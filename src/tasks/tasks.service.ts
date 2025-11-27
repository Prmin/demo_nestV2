import {
  Injectable,
  NotFoundException,
  Inject,
  OnModuleInit,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TaskMongo, TaskDocument } from './task.schema';
import { CreateTaskInput } from './dto/create-task.input';
import { UpdateTaskInput } from './dto/update-task.input';
import { ClientKafka } from '@nestjs/microservices';

import Redis from 'ioredis';
import { REDIS_CLIENT } from '../redis/redis.module';

@Injectable()
export class TasksService implements OnModuleInit {
  // key สำหรับเก็บ cache ของ list งานทั้งหมด
  private readonly TASKS_ALL_CACHE_KEY = 'tasks:all';

  constructor(
    @InjectModel(TaskMongo.name)
    private readonly taskModel: Model<TaskDocument>,

    // Redis client สำหรับ cache
    @Inject(REDIS_CLIENT)
    private readonly redis: Redis,

    // Kafka client สำหรับยิง event ออก topic
    @Inject('KAFKA_TASK_CLIENT')
    private readonly kafkaClient: ClientKafka,
  ) {}

  // ให้ Kafka client connect ตอน module ขึ้น
  async onModuleInit() {
    await this.kafkaClient.connect();
  }

  // ========== READ ALL + Redis cache ==========
  async findAll(): Promise<TaskMongo[]> {
    // 1) ลองดูจาก Redis ก่อน
    const cached = await this.redis.get(this.TASKS_ALL_CACHE_KEY);
    if (cached) {
      console.log('[TasksService] return tasks from Redis cache');
      return JSON.parse(cached) as TaskMongo[];
    }

    // 2) ถ้าไม่มี cache → ยิง Mongo ปกติ
    console.log('[TasksService] query tasks from MongoDB');
    const tasks = await this.taskModel.find().sort({ createdAt: -1 }).exec();

    // 3) เก็บผลลัพธ์ลง Redis ไว้ 60 วินาที
    await this.redis.set(
      this.TASKS_ALL_CACHE_KEY,
      JSON.stringify(tasks),
      'EX',
      60,
    );

    return tasks;
  }

  async findOne(id: string): Promise<TaskMongo | null> {
    return this.taskModel.findById(id).exec();
  }

  async create(input: CreateTaskInput): Promise<TaskMongo> {
    const created = new this.taskModel({
      title: input.title,
      description: input.description ?? null,
    });
    const saved = await created.save();

    // ลบ cache รายการทั้งหมด เพราะข้อมูลเปลี่ยนแล้ว
    await this.redis.del(this.TASKS_ALL_CACHE_KEY);

    // ยิง event เข้า Kafka topic "tasks.events"
    this.kafkaClient.emit('tasks.events', {
      event: 'TASK_CREATED',
      taskId: saved._id.toString(),
      title: saved.title,
      isDone: saved.isDone,
    });

    return saved;
  }

  async update(input: UpdateTaskInput): Promise<TaskMongo> {
    const task = await this.taskModel.findById(input.id).exec();
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    if (typeof input.title === 'string') {
      task.title = input.title;
    }
    if (typeof input.description === 'string') {
      task.description = input.description;
    }
    if (typeof input.isDone === 'boolean') {
      task.isDone = input.isDone;
    }

    const saved = await task.save();

    // ข้อมูลเปลี่ยน → ล้าง cache list
    await this.redis.del(this.TASKS_ALL_CACHE_KEY);

    this.kafkaClient.emit('tasks.events', {
      event: 'TASK_UPDATED',
      taskId: saved._id.toString(),
      title: saved.title,
      isDone: saved.isDone,
    });

    return saved;
  }

  async delete(id: string): Promise<boolean> {
    const res = await this.taskModel.deleteOne({ _id: id }).exec();
    const ok = res.deletedCount === 1;

    if (ok) {
      // ลบจาก DB สำเร็จ → ล้าง cache list
      await this.redis.del(this.TASKS_ALL_CACHE_KEY);

      this.kafkaClient.emit('tasks.events', {
        event: 'TASK_DELETED',
        taskId: id,
      });
    }

    return ok;
  }
}

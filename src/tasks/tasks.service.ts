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

@Injectable()
export class TasksService implements OnModuleInit {
  constructor(
    @InjectModel(TaskMongo.name)
    private readonly taskModel: Model<TaskDocument>,

    // Kafka client สำหรับยิง event ออก topic
    @Inject('KAFKA_TASK_CLIENT')
    private readonly kafkaClient: ClientKafka,
  ) {}

  // ให้ Kafka client connect ตอน module ขึ้น
  async onModuleInit() {
    await this.kafkaClient.connect();
  }

  async findAll(): Promise<TaskMongo[]> {
    return this.taskModel.find().sort({ createdAt: -1 }).exec();
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
      this.kafkaClient.emit('tasks.events', {
        event: 'TASK_DELETED',
        taskId: id,
      });
    }

    return ok;
  }
}

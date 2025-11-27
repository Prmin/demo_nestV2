import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TaskMongo, TaskDocument } from './task.schema';
import { CreateTaskInput } from './dto/create-task.input';
import { UpdateTaskInput } from './dto/update-task.input';

@Injectable()
export class TasksService {
  constructor(
    @InjectModel(TaskMongo.name)
    private readonly taskModel: Model<TaskDocument>,
  ) {}

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
    return created.save();
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

    return task.save();
  }

  async delete(id: string): Promise<boolean> {
    const res = await this.taskModel.deleteOne({ _id: id }).exec();
    return res.deletedCount === 1;
  }
}

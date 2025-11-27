import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { TasksService } from './tasks.service';
import { CreateTaskInput } from './dto/create-task.input';
import { UpdateTaskInput } from './dto/update-task.input';
import { TaskMongo } from './task.schema';

@Resolver('Task') // ผูก resolver นี้กับ type "Task" ในไฟล์ .graphql (schema-first)
export class TasksResolver {
  constructor(private readonly tasksService: TasksService) {}

  // Query: tasks -> ดึงรายการงานทั้งหมด
  @Query('tasks')
  async getTasks(): Promise<TaskMongo[]> {
    return this.tasksService.findAll();
  }

  // Query: task(id: ID!) -> ดึงงานตาม id
  @Query('task')
  async getTask(@Args('id') id: string): Promise<TaskMongo | null> {
    return this.tasksService.findOne(id);
  }

  // Mutation: createTask(input: CreateTaskInput!) -> สร้างงานใหม่
  @Mutation('createTask')
  async createTask(@Args('input') input: CreateTaskInput): Promise<TaskMongo> {
    return this.tasksService.create(input);
  }

  // Mutation: updateTask(input: UpdateTaskInput!) -> อัปเดตงาน
  @Mutation('updateTask')
  async updateTask(@Args('input') input: UpdateTaskInput): Promise<TaskMongo> {
    return this.tasksService.update(input);
  }

  // Mutation: deleteTask(id: ID!) -> ลบงาน
  @Mutation('deleteTask')
  async deleteTask(@Args('id') id: string): Promise<boolean> {
    return this.tasksService.delete(id);
  }
}

import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { TasksService } from './tasks.service';
import { CreateTaskInput } from './dto/create-task.input';
import { UpdateTaskInput } from './dto/update-task.input';
import { TaskMongo } from './task.schema';

// Resolver ของ GraphQL สำหรับ type "Task"
// ทำหน้าที่รับ Query/Mutation จาก schema แล้วเรียก TasksService ทำงานต่อ
@Resolver('Task') // ต้องตรงกับชื่อ type Task ในไฟล์ .graphql
export class TasksResolver {
  constructor(private readonly tasksService: TasksService) {}

  // Query: tasks -> ดึงรายการ Task ทั้งหมด
  @Query('tasks')
  async getTasks(): Promise<TaskMongo[]> {
    return this.tasksService.findAll();
  }

  // Query: task(id: ID!) -> ดึง Task ตาม id
  @Query('task')
  async getTask(@Args('id') id: string): Promise<TaskMongo | null> {
    return this.tasksService.findOne(id);
  }

  // Mutation: createTask(input: CreateTaskInput!) -> สร้าง Task ใหม่
  @Mutation('createTask')
  async createTask(@Args('input') input: CreateTaskInput): Promise<TaskMongo> {
    return this.tasksService.create(input);
  }

  // Mutation: updateTask(input: UpdateTaskInput!) -> แก้ไข Task ที่มีอยู่
  @Mutation('updateTask')
  async updateTask(@Args('input') input: UpdateTaskInput): Promise<TaskMongo> {
    return this.tasksService.update(input);
  }

  // Mutation: deleteTask(id: ID!) -> ลบ Task ตาม id
  @Mutation('deleteTask')
  async deleteTask(@Args('id') id: string): Promise<boolean> {
    return this.tasksService.delete(id);
  }
}

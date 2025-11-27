import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TasksService } from './tasks.service';
import { TasksResolver } from './tasks.resolver';
import { TaskMongo, TaskSchema } from './task.schema';

@Module({
  imports: [
    // forFeature: ลงทะเบียน model name => schema เพื่อให้ InjectModel(TaskMongo.name) ใช้งานได้
    MongooseModule.forFeature([{ name: TaskMongo.name, schema: TaskSchema }]),
  ],
  providers: [TasksService, TasksResolver],
})
export class TasksModule {}

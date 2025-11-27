import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TaskDocument = TaskMongo & Document;

@Schema({ timestamps: true }) // timestamps จะสร้าง createdAt/updatedAt ให้ตรงกับ field ใน schema GraphQL
export class TaskMongo {
  @Prop({ required: true })
  title: string;

  @Prop()
  description?: string;

  @Prop({ default: false })
  isDone: boolean;
}

export const TaskSchema = SchemaFactory.createForClass(TaskMongo);

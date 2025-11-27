import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

// type ของ document ที่ได้จาก Mongo (คลาส + Document ของ Mongoose)
export type TaskDocument = TaskMongo & Document;

// schema ของ Task ใน MongoDB (มี createdAt/updatedAt อัตโนมัติ)
@Schema({ timestamps: true })
export class TaskMongo {
  // ชื่อของงาน (บังคับต้องมี)
  @Prop({ required: true })
  title: string;

  // รายละเอียดงาน (ไม่มีก็ได้)
  @Prop()
  description?: string;

  // สถานะว่างานเสร็จหรือยัง (ค่าเริ่มต้น = false)
  @Prop({ default: false })
  isDone: boolean;
}

// แปลงคลาสให้กลายเป็น Mongoose schema สำหรับใช้กับ Model
export const TaskSchema = SchemaFactory.createForClass(TaskMongo);

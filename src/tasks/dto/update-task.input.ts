// ใช้รับข้อมูลตอนอัปเดต Task ที่มีอยู่
export class UpdateTaskInput {
  // ไอดีของ Task ที่ต้องการแก้
  id: string;

  // ชื่อใหม่ของงาน (ไม่ส่ง = ไม่แก้)
  title?: string;

  // รายละเอียดใหม่ของงาน (ไม่ส่ง = ไม่แก้)
  description?: string;

  // สถานะงานเสร็จหรือยัง (ไม่ส่ง = ไม่แก้)
  isDone?: boolean;
}

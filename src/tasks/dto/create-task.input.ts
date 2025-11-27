// ใช้รับข้อมูลตอนสร้าง Task ใหม่จาก GraphQL
export class CreateTaskInput {
  // ชื่อของงาน (บังคับต้องมี)
  title: string;

  // รายละเอียดงาน (ไม่ใส่ก็ได้)
  description?: string;
}
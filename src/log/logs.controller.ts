import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { LogsService } from './logs.service';

@Controller()
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  // ฟังทุก message จาก topic "tasks.events"
  @MessagePattern('tasks.events')
  handleTasksEvents(@Payload() message: any) {
    // สำหรับ Kafka + NestJS ข้อมูลจริงมักอยู่ใน message.value
    const value = message?.value ?? message;
    this.logsService.handleTaskEvent(value);
  }
}

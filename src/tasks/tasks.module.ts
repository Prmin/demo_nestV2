import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TasksService } from './tasks.service';
import { TasksResolver } from './tasks.resolver';
import { TaskMongo, TaskSchema } from './task.schema';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TaskMongo.name, schema: TaskSchema },
    ]),

    // สมัคร Kafka client สำหรับฝั่ง Task API (ใช้ยิง event ออกไป)
    ClientsModule.registerAsync([
      {
        name: 'KAFKA_TASK_CLIENT',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: config.get('KAFKA_CLIENT_ID') ?? 'task-api',
              brokers:
                (config.get<string>('KAFKA_BROKERS') ?? 'localhost:9092').split(','),
            },
            // ใช้ยิง event อย่างเดียว ไม่ต้องมี consumer ฝั่งนี้
            producerOnlyMode: true,
          },
        }),
      },
    ]),
  ],
  providers: [TasksService, TasksResolver],
})
export class TasksModule {}

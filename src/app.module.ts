/**
 * สรุปสแตกของโปรเจ็กต์นี้ (NestJS + TypeScript + MongoDB + GraphQL schema-first + Kafka + Redis)
 * - NestJS: โครงสร้างโมดูลาร์พร้อม dependency injection ช่วยแยก concerns ชัดเจน
 * - GraphQL (schema-first): ใช้ไฟล์ *.graphql เป็นแหล่งความจริง แล้วผูก resolver ให้ตรงกับ schema
 * - MongoDB: ต่อผ่าน Mongoose (ODM) อ่านค่า URI จาก .env
 * - Kafka: ยังไม่ผูกโมดูลในโค้ด แต่เตรียม env สำหรับใช้เป็น message broker/queue
 * - Redis: ยังไม่ผูกโมดูลในโค้ด แต่เตรียม env สำหรับ cache หรือ pub/sub
 */
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { MongooseModule } from '@nestjs/mongoose';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { TasksModule } from './tasks/tasks.module';

@Module({
  imports: [
    // โหลดค่า .env เข้า process.env และประกาศเป็นโมดูล global ให้ ConfigService ใช้ได้ทุกที่
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver, // กำหนดให้ Apollo เป็น GraphQL server
      typePaths: ['./**/*.graphql'], // โหมด schema-first: ดึง schema จากไฟล์ .graphql ทั้งโปรเจ็กต์
      playground: false, // ปิด playground เดิม
      plugins: [ApolloServerPluginLandingPageLocalDefault()], // ใช้ landing page ของ Apollo สำหรับ dev
    }),

    // เชื่อม MongoDB แบบ async เพื่อดึง URI จาก ConfigService (ค่าใน .env)
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'), // mongodb://localhost:27017/...
        // หากต้องการเพิ่ม option: dbName, user, pass, authSource, autoIndex, retryWrites ฯลฯ ใส่ที่นี่
      }),
    }),

    TasksModule, // โมดูลงานตัวอย่าง ใช้ GraphQL + MongoDB
  ],
})
export class AppModule {}

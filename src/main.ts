import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') ?? 3000;

  const brokers =
    (configService.get<string>('KAFKA_BROKERS') ?? 'localhost:9092').split(',');

  // ผูก Kafka microservice สำหรับ Log Service เข้าไปใน app เดิม
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId:
          configService.get<string>('KAFKA_LOG_CLIENT_ID') ?? 'log-service',
        brokers,
      },
      consumer: {
        groupId:
          configService.get<string>('KAFKA_LOG_GROUP_ID') ??
          'log-service-group',
        // Auto-create the topic if it is missing to avoid startup errors in dev.
        allowAutoTopicCreation: true,
      },
    },
  });

  // เริ่ม Kafka microservice
  await app.startAllMicroservices();

  // เริ่ม HTTP + GraphQL
  await app.listen(port);
  console.log(`Server is running on http://localhost:${port}/graphql`);
}
bootstrap();

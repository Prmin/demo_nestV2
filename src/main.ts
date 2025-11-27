// bootstrap หลักของ NestJS: สร้างแอป, อ่านค่าพอร์ตจาก .env ผ่าน ConfigService แล้วเปิด GraphQL endpoint
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') ?? 3000; // PORT ใน .env คือพอร์ต HTTP/GraphQL

  await app.listen(port);
  console.log(`Server is running on http://localhost:${port}/graphql`);
}
bootstrap();

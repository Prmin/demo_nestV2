import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

export const REDIS_CLIENT = 'REDIS_CLIENT';

// ทำเป็น Global module จะได้ Inject ใช้ที่ไหนก็ได้โดยไม่ต้อง import ซ้ำ
@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: REDIS_CLIENT,
      useFactory: (configService: ConfigService) => {
        // อ่านค่า REDIS_URL จาก .env (เช่น redis://localhost:6379)
        const url =
          configService.get<string>('REDIS_URL') ?? 'redis://localhost:6379';

        const client = new Redis(url);

        client.on('connect', () => {
          console.log('[Redis] connected:', url);
        });

        client.on('error', (err) => {
          console.error('[Redis] error:', err.message);
        });

        return client;
      },
      inject: [ConfigService],
    },
  ],
  exports: [REDIS_CLIENT],
})
export class RedisModule {}

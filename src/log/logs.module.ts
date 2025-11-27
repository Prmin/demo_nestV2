import { Module } from '@nestjs/common';

import { LogsController } from './logs.controller';
import { LogsResolver } from './logs.resolver';
import { LogsService } from './logs.service';

@Module({
  controllers: [LogsController],
  providers: [LogsService, LogsResolver],
})
export class LogsModule {}

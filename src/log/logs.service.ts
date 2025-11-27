import { Injectable, Logger, NotFoundException } from '@nestjs/common';

import { CreateLogInput } from './dto/create-log.input';
import { UpdateLogInput } from './dto/update-log.input';
import { Log } from './entities/log.entity';

@Injectable()
export class LogsService {
  private readonly logger = new Logger(LogsService.name);
  private readonly logs: Log[] = [];
  private nextId = 1;

  create(createLogInput: CreateLogInput): Log {
    const log: Log = {
      id: this.nextId++,
      event: createLogInput.event,
      payload: createLogInput.payload,
      createdAt: new Date().toISOString(),
    };

    this.logs.unshift(log);
    return log;
  }

  findAll(): Log[] {
    return [...this.logs];
  }

  findOne(id: number): Log | undefined {
    return this.logs.find((log) => log.id === id);
  }

  update(id: number, updateLogInput: UpdateLogInput): Log {
    const log = this.logs.find((item) => item.id === id);
    if (!log) {
      throw new NotFoundException('Log not found');
    }

    if (updateLogInput.event) {
      log.event = updateLogInput.event;
    }

    if (updateLogInput.payload !== undefined) {
      log.payload = updateLogInput.payload;
    }

    return log;
  }

  remove(id: number): Log | undefined {
    const index = this.logs.findIndex((log) => log.id === id);
    if (index === -1) {
      return undefined;
    }

    const [removed] = this.logs.splice(index, 1);
    return removed;
  }

  // Capture incoming Kafka task events so they can be queried later.
  handleTaskEvent(message: { event?: string; [key: string]: any }) {
    const eventName = message.event ?? 'unknown';

    this.logger.log(
      `Kafka event: ${eventName} - payload=${JSON.stringify(message)}`,
    );

    this.create({
      event: eventName,
      payload: JSON.stringify(message),
    });
  }
}

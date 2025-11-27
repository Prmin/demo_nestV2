import { Test, TestingModule } from '@nestjs/testing';
import { LogsResolver } from './logs.resolver';
import { LogsService } from './logs.service';

describe('LogsResolver', () => {
  let resolver: LogsResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LogsResolver, LogsService],
    }).compile();

    resolver = module.get<LogsResolver>(LogsResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});

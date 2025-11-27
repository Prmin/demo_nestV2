import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { LogsService } from './logs.service';
import { CreateLogInput } from './dto/create-log.input';
import { UpdateLogInput } from './dto/update-log.input';

@Resolver('Log')
export class LogsResolver {
  constructor(private readonly logsService: LogsService) {}

  @Mutation('createLog')
  create(@Args('createLogInput') createLogInput: CreateLogInput) {
    return this.logsService.create(createLogInput);
  }

  @Query('logs')
  findAll() {
    return this.logsService.findAll();
  }

  @Query('log')
  findOne(@Args('id') id: number) {
    return this.logsService.findOne(id);
  }

  @Mutation('updateLog')
  update(@Args('updateLogInput') updateLogInput: UpdateLogInput) {
    return this.logsService.update(updateLogInput.id, updateLogInput);
  }

  @Mutation('removeLog')
  remove(@Args('id') id: number) {
    return this.logsService.remove(id);
  }
}

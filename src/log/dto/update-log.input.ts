import { CreateLogInput } from './create-log.input';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateLogInput extends PartialType(CreateLogInput) {
  id: number;
}

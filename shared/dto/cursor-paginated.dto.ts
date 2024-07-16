import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { IsOptional } from 'class-validator';

export class CursorPaginatedDto<TData> {
  @IsOptional()
  @ApiProperty()
  nextId?: string;

  @ApiHideProperty()
  @Exclude()
  results: TData[];
}

import { ApiHideProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { IsString, IsNotEmpty } from 'class-validator';

export class SuccessResponseDto<T = undefined> {
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiHideProperty()
  @Exclude()
  result?: T;
}

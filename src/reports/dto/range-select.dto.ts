import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RangeSelectDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  start: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  end: string;
}

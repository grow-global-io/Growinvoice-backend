import { ApiProperty } from '@nestjs/swagger';

export class ErrorMessageDto {
  @ApiProperty()
  message: string;

  @ApiProperty()
  status: number;
}

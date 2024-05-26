import { ApiProperty } from '@nestjs/swagger';

export class LoginSuccessDto {
  @ApiProperty({
    type: 'string',
  })
  message: string;

  @ApiProperty({
    type: 'string',
  })
  authToken: string;
}

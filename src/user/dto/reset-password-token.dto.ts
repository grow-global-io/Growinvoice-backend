import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordTokenDto {
  @ApiProperty({
    description: 'Password reset token',
  })
  token: string;

  @ApiProperty({
    description: 'New password',
  })
  password: string;
}

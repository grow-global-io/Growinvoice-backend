import { ApiProperty } from '@nestjs/swagger';

export class LoginResponseDto {
  @ApiProperty()
  access_token: string;

  @ApiProperty()
  token_type: string;

  @ApiProperty()
  expires_in: number;

  @ApiProperty()
  refresh_token: string;
}

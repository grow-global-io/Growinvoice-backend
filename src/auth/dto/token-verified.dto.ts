import { ApiProperty } from '@nestjs/swagger';

export class TokenVerifiedDto {
  @ApiProperty()
  sub: string;
  @ApiProperty()
  email: string;
}

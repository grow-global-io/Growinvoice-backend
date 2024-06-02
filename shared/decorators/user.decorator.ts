// user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
export class UserTokenDto {
  @ApiProperty()
  sub: string;
  @ApiProperty()
  email: string;
  @ApiProperty()
  given_name: string;
  @ApiProperty()
  family_name: string;
  @ApiProperty()
  nickname: string;
  @ApiProperty()
  name: string;
  @ApiProperty()
  picture: string;
  @ApiProperty()
  updated_at: string;
  @ApiProperty()
  email_verified: boolean;
  @ApiProperty()
  id: string;
}

export const GetUser = createParamDecorator((data, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  return request.user;
});

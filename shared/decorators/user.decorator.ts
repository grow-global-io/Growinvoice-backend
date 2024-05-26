// user.decorator.ts
// user.interface.ts
export interface User {
  sub: string;
  email: string;
  // add other properties as needed
}
// user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetUser = createParamDecorator((data, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  return request.user;
});

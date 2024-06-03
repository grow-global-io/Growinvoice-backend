import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GetUser, User } from '@shared/decorators/user.decorator';
import { AuthService } from './auth.service';
import { IsPublic } from '@shared/decorators/public.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get()
  async status(@GetUser() user: User) {
    return this.authService.verifyToken(user);
  }

  @IsPublic()
  @Get('user')
  getUser(@Query('id') id: string) {
    return this.authService.getUser(id);
  }
}

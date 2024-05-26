import { Controller, Get } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetUser, User } from '@shared/decorators/user.decorator';
import { AuthService } from './auth.service';
import { User as UserDto } from '@shared/models';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('verify')
  @ApiResponse({ status: 200, type: UserDto })
  status(@GetUser() user: User) {
    return this.authService.verifyToken(user);
  }
}

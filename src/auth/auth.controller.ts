import { Controller, Get } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetUser, User } from '@shared/decorators/user.decorator';
import { TokenVerifiedDto } from './dto/token-verified.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor() {}

  @Get('verify')
  @ApiResponse({ status: 200, type: TokenVerifiedDto })
  status(@GetUser() user: User) {
    return user;
  }
}

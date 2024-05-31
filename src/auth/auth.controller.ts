import { Controller, Get } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetUser, UserTokenDto } from '@shared/decorators/user.decorator';
import { AuthService } from './auth.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authServie: AuthService) {}

  @Get('verify')
  @ApiResponse({ status: 200, type: UserTokenDto })
  async status(@GetUser() user: UserTokenDto) {
    const primsData = await this.authServie.findUserById(user.id);
    console.log(primsData);
    if (primsData !== null) {
      return {
        ...user,
        prismaData: primsData,
      };
    }
    return user;
  }
}

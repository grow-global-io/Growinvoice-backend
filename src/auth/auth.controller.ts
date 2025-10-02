import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetUser, User } from '@shared/decorators/user.decorator';
import { AuthService } from './auth.service';
import { IsPublic } from '@shared/decorators/public.decorator';
import { VerifyGoogleTokenDto } from './dto/verify-google-token.dto';
import { LoginSuccessDto } from '@/user/dto/login-success.dto';

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

  @Get('getUserQuota')
  @ApiQuery({
    name: 'userId',
    required: false,
    description: 'ID of the user to get quota for',
    type: String,
  })
  async getUserQuota(@GetUser() user: User, @Query('userId') userId?: string) {
    return await this.authService.getUserQuota(user.sub, userId);
  }

  @IsPublic()
  @ApiResponse({
    status: 200,
    description: 'User logged in successfully',
    type: LoginSuccessDto,
  })
  @Post('verify-google-token')
  async verifyGoogleToken(
    @Body() body: VerifyGoogleTokenDto,
  ): Promise<LoginSuccessDto> {
    return await this.authService.verifyGoogleToken(body.token);
  }
}

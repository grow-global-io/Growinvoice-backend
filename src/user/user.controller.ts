import { Body, Controller, Post } from '@nestjs/common';
import { ApiExtraModels, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';
import { ErrorMessageDto } from '@shared/dto/errorMessage.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { LoginSuccessDto } from './dto/login-success.dto';
import { AuthService } from '@/auth/auth.service';
import { IsPublic } from '@shared/decorators/public.decorator';
import { CreateUserCompany } from './dto/create-user-company.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordTokenDto } from './dto/reset-password-token.dto';
import { ApiSuccessResponse } from '@shared/decorators/api-success-response.decorator';
import { User } from '@shared/models';
import { SuccessResponseDto } from '@shared/dto/success-response.dto';

@ApiExtraModels(User)
@ApiTags('users')
@Controller('user')
export class UserController {
  constructor(
    private userService: UserService,
    private authService: AuthService,
  ) {}

  @IsPublic()
  @Post('create')
  @ApiSuccessResponse(User, {
    status: 201,
  })
  async createUser(
    @Body() createUserDto: CreateUserCompany,
  ): Promise<SuccessResponseDto<User>> {
    const result = await this.userService.createUser(createUserDto);
    return {
      message: 'User created successfully',
      result,
    };
  }

  @IsPublic()
  @Post('login')
  @ApiResponse({
    status: 200,
    description: 'User logged in successfully',
    type: LoginSuccessDto,
  })
  async loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.authService.loginUser(loginUserDto);
  }

  @IsPublic()
  @Post('forgot-password')
  @ApiResponse({
    status: 200,
    description: 'Password reset email sent successfully',
    type: ErrorMessageDto,
  })
  async forgotPassword(@Body() body: ForgotPasswordDto) {
    return this.userService.forgotPassword(body.email);
  }

  @IsPublic()
  @Post('reset-password')
  @ApiResponse({
    status: 200,
    description: 'Password reset successfully',
    type: ErrorMessageDto,
  })
  async resetPassword(@Body() body: ResetPasswordTokenDto) {
    return this.userService.resetPassword(body);
  }
}

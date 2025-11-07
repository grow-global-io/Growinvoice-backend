import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { ApiExtraModels, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';
import { ErrorMessageDto } from '@shared/dto/errorMessage.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { LoginSuccessDto } from './dto/login-success.dto';
import { AuthService } from '@/auth/auth.service';
import { IsPublic } from '@shared/decorators/public.decorator';
import {
  CreateUserCompany,
  UpdateUserCompany,
} from './dto/create-user-company.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordTokenDto } from './dto/reset-password-token.dto';
import { ApiSuccessResponse } from '@shared/decorators/api-success-response.decorator';
import { User, UserDto } from '@shared/models';
import { SuccessResponseDto } from '@shared/dto/success-response.dto';
import { updateCurrencyCompanyDto } from './dto/update-currency-company.dto';
import {
  GetUser,
  User as UserTokenDetails,
} from '@shared/decorators/user.decorator';

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
  @ApiResponse({
    status: 200,
    description: 'User created or logged in successfully',
    type: LoginSuccessDto,
  })
  async createUser(
    @Body() createUserDto: CreateUserCompany,
  ): Promise<LoginSuccessDto> {
    // This now returns LoginSuccessDto (with authToken) whether user exists or not
    return await this.userService.createUser(createUserDto);
  }

  @IsPublic()
  @Post('login')
  @ApiResponse({
    status: 200,
    description: 'User logged in successfully',
    type: LoginSuccessDto,
  })
  async loginUser(
    @Body() loginUserDto: LoginUserDto,
  ): Promise<LoginSuccessDto> {
    return await this.authService.loginUser(loginUserDto);
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

  @Post('update-currency-company')
  @ApiSuccessResponse(User, { status: 201 })
  async updateCurrencyCompany(
    @Body() body: updateCurrencyCompanyDto,
    @GetUser() user: UserTokenDetails,
  ): Promise<SuccessResponseDto<User>> {
    const result = await this.userService.updateCurrencyCompany(body, user);
    return {
      message: 'Currency and company updated successfully',
      result,
    };
  }

  @Put('updateUser/:id')
  @ApiSuccessResponse(UserDto, { status: 201 })
  async updateUser(
    @Body() body: UpdateUserCompany,
    @Param('id') id: string,
  ): Promise<SuccessResponseDto<UserDto>> {
    const result = await this.userService.updateUser(body, id);
    return {
      message: 'User updated successfully',
      result,
    };
  }

  @Get('userCount')
  async userCount(@GetUser() user: UserTokenDetails) {
    return await this.userService.userCount(user?.sub);
  }

  @Get('getUsersList')
  async getUsersList(@GetUser() user: UserTokenDetails) {
    return await this.userService.getUsersList(user?.sub);
  }

  @Put('blockUser/:id')
  @ApiSuccessResponse(UserDto, { status: 200 })
  async blockUser(
    @Param('id') id: string,
  ): Promise<SuccessResponseDto<UserDto>> {
    const user = await this.userService.blockUser(id);
    return {
      message: 'User blocked successfully',
      result: user,
    };
  }

  @Get('dashboard-count')
  async getDashboardCount(@GetUser() user: UserTokenDetails) {
    return await this.authService.getDashboardCount(user?.sub);
  }
}

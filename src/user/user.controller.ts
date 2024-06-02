import { Body, Controller, Post, Query } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';
import { ErrorMessageDto } from '@shared/dto/errorMessage.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { IsPublic } from '@shared/decorators/public.decorator';
import { CreateUserCompany } from './dto/create-user-company.dto';

@ApiTags('users')
@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @IsPublic()
  @Post('create')
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
    type: ErrorMessageDto,
  })
  async createUser(@Body() createUserDto: CreateUserCompany) {
    return this.userService.createUser(createUserDto);
  }

  @IsPublic()
  @Post('login')
  @ApiResponse({
    status: 200,
    description: 'User logged in successfully',
    type: LoginResponseDto,
  })
  async loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.userService.login(loginUserDto);
  }

  @IsPublic()
  @Post('password-less-login')
  @ApiResponse({
    status: 200,
    description: 'User logged in successfully',
    type: LoginResponseDto,
  })
  async passwordLessLogin(@Query('email') email: string) {
    return this.userService.passwordLessLogin(email);
  }

  @IsPublic()
  @Post('password-less-login-verify')
  @ApiResponse({
    status: 200,
    description: 'User logged in successfully',
    type: LoginResponseDto,
  })
  async passwordLessLoginVerify(
    @Query('email') email: string,
    @Query('code') code: string,
  ) {
    return this.userService.passwordLessLoginVerify(email, code);
  }

  @IsPublic()
  @Post('change-password')
  @ApiResponse({
    status: 200,
    description: 'Password changed successfully',
    type: ErrorMessageDto,
  })
  async changePassword(@Query('email') email: string) {
    return this.userService.changePassword(email);
  }
}

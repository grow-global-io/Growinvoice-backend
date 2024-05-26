import { Body, Controller, Post } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserDto } from '@shared/models';
import { ErrorMessageDto } from '@shared/dto/errorMessage.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { LoginSuccessDto } from './dto/login-success.dto';
import { AuthService } from '@/auth/auth.service';
import { IsPublic } from '@shared/decorators/public.decorator';

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
    status: 201,
    description: 'User created successfully',
    type: ErrorMessageDto,
  })
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto);
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
}

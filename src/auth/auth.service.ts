import { PrismaService } from '@/prisma/prisma.service';
import { LoginUserDto } from '@/user/dto/login-user.dto';
import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@shared/decorators/user.decorator';
import * as bcrypt from 'bcrypt';
import { UserWithCompanyDto } from './dto/user-with-company.dto';
import { plainToInstance } from 'class-transformer';
import { UserDto } from '@shared/models';
import { LoginSuccessDto } from '@/user/dto/login-success.dto';

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
  ) {}

  async loginUser(data: LoginUserDto) {
    const user = await this.prismaService.user.findUnique({
      where: { email: data.email },
    });
    if (!user) {
      throw new BadRequestException('User not found');
    }
    if (!(await bcrypt.compare(data.password, user.password))) {
      throw new BadRequestException('Invalid password');
    }

    const payload = { sub: user.id, email: user.email };

    return plainToInstance(LoginSuccessDto, {
      message: 'Login successful',
      authToken: await this.jwtService.signAsync(payload),
    });
  }

  async verifyToken(user: User) {
    const userData = await this.prismaService.user.findUnique({
      where: { id: user.sub },
      include: { company: true, currency: true },
    });
    if (!userData) {
      throw new BadRequestException('User not found');
    }
    return plainToInstance(UserWithCompanyDto, userData);
  }

  async getUser(id: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id },
    });
    if (!user) {
      throw new BadRequestException('User not found');
    }
    return plainToInstance(UserDto, user);
  }
}

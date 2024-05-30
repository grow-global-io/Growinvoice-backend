import { PrismaService } from '@/prisma/prisma.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from '@shared/models';
import * as bcrypt from 'bcrypt';
import { CreateUserCompany } from './dto/create-user-company.dto';

@Injectable()
export class UserService {
  constructor(private prismaService: PrismaService) {}

  private async validateCreateUserDto(data: CreateUserDto) {
    const errors = [];

    if (!data.email) {
      errors.push('Email is required');
    } else if (!this.isValidEmail(data.email)) {
      errors.push('Email is not valid');
    }

    if (!data.password) {
      errors.push('Password is required');
    } else if (!this.isValidPassword(data.password)) {
      errors.push(
        'Password must be at least 6 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      );
    }

    if (errors.length > 0) {
      throw new BadRequestException(errors[0]);
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidPassword(password: string): boolean {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
    return passwordRegex.test(password);
  }

  private async checkIfUserExists(email: string) {
    const existingUser = await this.prismaService.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      throw new BadRequestException('User already exists');
    }
  }

  async createUser(data: CreateUserCompany) {
    await this.validateCreateUserDto(data);
    await this.checkIfUserExists(data.email);
    const hashedPassword = await bcrypt.hash(data.password, 12);
    await this.prismaService.user.create({
      data: {
        email: data.email,
        name: data.name,
        phone: data.phone,
        password: hashedPassword,
        company: {
          create: {
            name: data.companyName,
          },
        },
      },
    });

    return {
      message: 'User created successfully',
      status: 201,
    };
  }
}

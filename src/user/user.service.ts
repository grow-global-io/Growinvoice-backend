import { PrismaService } from '@/prisma/prisma.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto, User, UserDto } from '@shared/models';
import * as bcrypt from 'bcrypt';
import {
  CreateUserCompany,
  UpdateUserCompany,
} from './dto/create-user-company.dto';
import { MailService } from '@/mail/mail.service';
import { v4 as uuidv4 } from 'uuid';
import { ResetPasswordTokenDto } from './dto/reset-password-token.dto';
import { plainToInstance } from 'class-transformer';
import { updateCurrencyCompanyDto } from './dto/update-currency-company.dto';
import { User as UserTokenDetails } from '@shared/decorators/user.decorator';

@Injectable()
export class UserService {
  constructor(
    private prismaService: PrismaService,
    private mailService: MailService,
  ) {}

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
    const result = await this.prismaService.user.create({
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
    return plainToInstance(User, result);
  }

  async forgotPassword(email: string) {
    const user = await this.prismaService.user.findUnique({
      where: { email },
    });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const token = uuidv4();
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + 1); // Token valid for 1 hour

    await this.prismaService.user.update({
      where: { email },
      data: {
        resetToken: token,
        resetTokenExpiry: expiry,
      },
    });

    await this.mailService.sendEmail(email, token);

    // Send password reset email
    return {
      message: 'Password reset email sent successfully',
      status: 200,
    };
  }

  async resetPassword(resetPassword: ResetPasswordTokenDto) {
    const user = await this.prismaService.user.findFirst({
      where: {
        resetToken: resetPassword.token,
        resetTokenExpiry: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired token');
    }

    const hashedPassword = await bcrypt.hash(resetPassword.password, 10);

    await this.prismaService.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });
    return {
      message: 'Password reset successfully',
      status: 200,
    };
  }

  async updateCurrencyCompany(
    data: updateCurrencyCompanyDto,
    user: UserTokenDetails,
  ) {
    const result = await this.prismaService.user.update({
      where: { id: user.sub },
      data: {
        currency_id: data.currency_id,
        company: {
          update: {
            where: {
              user_id: user.sub,
            },
            data: {
              name: data.companyName,
              phone: data.phoneNumber,
              country_id: data.country,
              state_id: data.state,
              city: data.city,
              address: data.address,
              zip: data.zipCode,
              vat: data.vat,
              logo: data.logo,
            },
          },
        },
      },
    });
    return plainToInstance(User, result);
  }

  async updateUser(data: UpdateUserCompany, id: string) {
    if (data?.old_password === '' && data.password === '') {
      const result = await this.prismaService.user.update({
        where: { id },
        data: {
          email: data.email,
          name: data.name,
          phone: data.phone,
          currency_id: data.currency_id,
        },
      });
      return plainToInstance(UserDto, result);
    } else {
      const checkPassword = await this.prismaService.user.findUnique({
        where: { id },
        select: { password: true },
      });

      if (!checkPassword) {
        throw new BadRequestException('User not found');
      }

      const passwordMatch = await bcrypt.compare(
        data.old_password,
        checkPassword.password,
      );

      if (!passwordMatch) {
        throw new BadRequestException('Invalid password');
      }

      const hashedPassword = await bcrypt.hash(data.password, 10);

      const result = await this.prismaService.user.update({
        where: { id },
        data: {
          email: data.email,
          name: data.name,
          phone: data.phone,
          currency_id: data.currency_id,
          password: hashedPassword,
        },
      });
      return plainToInstance(UserDto, result);
    }
  }

  async findOne(id: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id },
      include: {
        company: true,
        currency: true,
      },
    });
    return plainToInstance(User, user);
  }
}

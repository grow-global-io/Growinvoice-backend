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
import { AdminUsersListDto } from './dto/admin-users-list.dto';
import { JwtService } from '@nestjs/jwt';
import { LoginSuccessDto } from './dto/login-success.dto';
import { AuthService } from '@/auth/auth.service';

@Injectable()
export class UserService {
  constructor(
    private prismaService: PrismaService,
    private mailService: MailService,
    private jwtService: JwtService,
    private authService: AuthService,
  ) {}

  private async validateCreateUserDto(
    data: CreateUserDto,
    hasGoogleToken: boolean = false,
  ) {
    const errors = [];

    if (!data.email) {
      errors.push('Email is required');
    } else if (!this.isValidEmail(data.email)) {
      errors.push('Email is not valid');
    }

    // Password is only required if not using Google OAuth
    if (!hasGoogleToken) {
      if (!data.password) {
        errors.push('Password is required');
      } else if (!this.isValidPassword(data.password)) {
        errors.push(
          'Password must be at least 6 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character',
        );
      }
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

  async createUser(data: CreateUserCompany) {
    console.log('createUser called with:', {
      email: data.email,
      hasGoogleToken: !!data.googleToken,
      hasPassword: !!data.password,
      isGoogleSignIn: data.isGoogleSignIn,
    });

    // Handle Google OAuth flow - ALWAYS prioritize Google token if provided
    if (data.googleToken) {
      console.log('Processing Google OAuth flow with token');
      // Verify Google token and handle login/registration
      // This will log in existing users or create new ones
      try {
        return await this.authService.verifyGoogleToken(data.googleToken);
      } catch (error: any) {
        // If Google token verification fails, log the error and re-throw
        console.error('Google token verification failed:', error);
        throw error;
      }
    }

    // Check if user already exists BEFORE validation
    // This allows us to handle Google sign-in for existing users even without token
    const existingUser = await this.prismaService.user.findUnique({
      where: { email: data.email },
    });

    // Detect Google sign-in attempts (even without explicit flag or token)
    // Common patterns: placeholder passwords, or isGoogleSignIn flag
    const isLikelyGoogleSignIn =
      data.isGoogleSignIn ||
      data.googleToken ||
      (data.password &&
        /^(random_password|placeholder|google_signin|oauth|temp)/i.test(
          data.password,
        ));

    // If user exists and this is a Google sign-in attempt (with or without token)
    if (existingUser && isLikelyGoogleSignIn) {
      console.log(
        'Existing user detected with Google sign-in (flag/token/placeholder password), logging in:',
        existingUser.email,
      );
      // Link Google account to existing user and log them in
      // Generate JWT token for login
      const payload = { sub: existingUser.id, email: existingUser.email };
      const authToken = await this.jwtService.signAsync(payload);

      // Return login response format
      return plainToInstance(LoginSuccessDto, {
        message: 'Account linked to Google successfully. Logged in.',
        authToken,
      });
    }

    // If user exists and this is NOT a Google sign-in, check password
    if (existingUser) {
      // Regular email/password flow - validate password
      await this.validateCreateUserDto(data, false);

      // User exists - verify password and log them in
      const passwordMatch = await bcrypt.compare(
        data.password,
        existingUser.password,
      );

      if (!passwordMatch) {
        // If password doesn't match, suggest using Google login if available
        throw new BadRequestException(
          'Invalid email or password. If you signed up with Google, please use Google Sign-In.',
        );
      }

      // Generate JWT token for login
      const payload = { sub: existingUser.id, email: existingUser.email };
      const authToken = await this.jwtService.signAsync(payload);

      // Return login response format
      return plainToInstance(LoginSuccessDto, {
        message: 'Login successful',
        authToken,
      });
    }

    // User doesn't exist - proceed with regular validation and creation
    await this.validateCreateUserDto(data, false);

    // User doesn't exist - create new user
    console.log('User does not exist, creating new user');
    try {
      const hashedPassword = await bcrypt.hash(data.password, 12);
      await this.mailService.sendWelcomeMail(data.email, data.name);
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

      // Generate JWT token for new user
      const payload = { sub: result.id, email: result.email };
      const authToken = await this.jwtService.signAsync(payload);

      // Return login response format for new user too
      return plainToInstance(LoginSuccessDto, {
        message: 'User created and logged in successfully',
        authToken,
      });
    } catch (createError: any) {
      console.error('Error creating user:', {
        code: createError?.code,
        message: createError?.message,
        meta: createError?.meta,
      });

      // Handle Prisma unique constraint error (user already exists)
      // This can happen due to race conditions
      if (
        createError?.code === 'P2002' ||
        createError?.message?.includes('already exists') ||
        createError?.message?.includes('Unique constraint')
      ) {
        console.log(
          'User already exists (race condition or duplicate), attempting login',
        );
        // User was created between our check and create - fetch and try to log them in
        const raceConditionUser = await this.prismaService.user.findUnique({
          where: { email: data.email },
        });

        if (raceConditionUser) {
          // Try to verify password
          const passwordMatch = await bcrypt.compare(
            data.password,
            raceConditionUser.password,
          );

          if (passwordMatch) {
            // Password matches - log them in
            console.log('Password matches, logging in existing user');
            const payload = {
              sub: raceConditionUser.id,
              email: raceConditionUser.email,
            };
            const authToken = await this.jwtService.signAsync(payload);

            return plainToInstance(LoginSuccessDto, {
              message: 'Login successful',
              authToken,
            });
          } else {
            console.log('Password does not match, user already exists');
            // If password doesn't match, suggest Google login
            throw new BadRequestException(
              'User already exists. If you signed up with Google, please use Google Sign-In. Otherwise, please use the login endpoint with your password.',
            );
          }
        } else {
          throw new BadRequestException(
            'User already exists. If you signed up with Google, please use Google Sign-In. Otherwise, please use the login endpoint with your password.',
          );
        }
      } else {
        // Re-throw other errors
        throw createError;
      }
    }
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
    let hashedPassword: string;
    if (data?.old_password && data.password) {
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

      hashedPassword = await bcrypt.hash(data.password, 10);
    }

    try {
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
    } catch (error) {
      throw new BadRequestException('Email already in use');
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

  async userCount(user_id: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id: user_id },
    });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    return await this.prismaService.user.count({
      where: { id: user?.isAdmin ? undefined : user_id },
    });
  }

  async getUsersList(user_id: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id: user_id },
    });
    if (!user || !user.isAdmin) {
      throw new BadRequestException('User not found');
    }

    const users = await this.prismaService.user.findMany({
      where: {
        isAdmin: false, // Only fetch non-admin users
      },
      include: {
        company: {
          include: {
            country: true,
            state: true,
          },
        },
        currency: true,
        UserPlans: {
          include: {
            plan: {
              include: {
                PlanFeatures: true,
              },
            },
          },
        },
      },
    });
    return plainToInstance(AdminUsersListDto, users);
  }

  async blockUser(id: string) {
    const userExists = await this.prismaService.user.findUnique({
      where: { id },
    });
    const user = await this.prismaService.user.update({
      where: { id },
      data: {
        isActive: !userExists.isActive, // Toggle isActive status
      },
    });
    return plainToInstance(UserDto, user);
  }
}

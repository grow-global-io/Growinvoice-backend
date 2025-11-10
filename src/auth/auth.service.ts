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
import { SharedService } from '@/shared/shared.service';
import { UserQuotaDto } from './dto/user-quota.dto';
import { OAuth2Client } from 'google-auth-library';
import { ConfigService } from '@nestjs/config';
import * as moment from 'moment-timezone';
import { DashboardCount } from '@/user/dto/dashboard-count.dto';

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
    private readonly sharedService: SharedService,
    private readonly configService: ConfigService,
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
      include: {
        company: {
          include: {
            country: true,
          },
        },
        currency: true,
        UserPlans: {
          where: {
            status: true,
            start_date: {
              lte: new Date(),
            },
            end_date: {
              gte: new Date(),
            },
          },
          include: {
            plan: true,
          },
        },
      },
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

  async getUserQuota(user_id: string, userId?: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id: user_id },
    });
    if (user?.isAdmin && userId) {
      const res = await this.sharedService.getQuota(userId);
      return plainToInstance(UserQuotaDto, res);
    }
    const res = await this.sharedService.getQuota(user_id);
    return plainToInstance(UserQuotaDto, res);
  }

  getGoogleClientId(): string {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    if (!clientId) {
      throw new BadRequestException(
        'Google OAuth is not configured. GOOGLE_CLIENT_ID is missing.',
      );
    }
    return clientId;
  }

  async verifyGoogleToken(token: string): Promise<LoginSuccessDto> {
    const clientId = this.getGoogleClientId();
    const client = new OAuth2Client(clientId);
    try {
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: clientId, // Specify the CLIENT_ID of the app that calls the backend.
      });
      const payload = ticket.getPayload();
      if (!payload || !payload.email) {
        throw new BadRequestException('Invalid Google token: missing email');
      }

      // Check if user exists
      let user = await this.prismaService.user.findUnique({
        where: { email: payload.email },
      });

      // If user exists, log them in (link Google account to existing account)
      if (user) {
        console.log(
          `✅ Existing user logged in via Google OAuth: ${user.email}`,
        );
      }

      // If user doesn't exist, create a new user with Google data
      if (!user) {
        // Generate a random password for Google OAuth users (they won't use it)
        const randomPassword = await bcrypt.hash(
          Math.random().toString(36).slice(-12) + Date.now().toString(),
          12,
        );

        // Create user with data from Google
        try {
          user = await this.prismaService.user.create({
            data: {
              email: payload.email,
              name:
                payload.name ||
                payload.given_name ||
                payload.email.split('@')[0],
              phone: null, // Google doesn't always provide phone
              password: randomPassword, // Random password since they use Google OAuth
              // Create a default company for the user
              company: {
                create: {
                  name: payload.name || payload.given_name || 'My Company',
                },
              },
            },
          });

          if (!user || !user.id) {
            throw new BadRequestException(
              'Failed to create user account. Please try again.',
            );
          }

          console.log(`✅ New user created via Google OAuth: ${user.email}`);
        } catch (createError: any) {
          // Handle Prisma unique constraint error (user already exists)
          // This can happen due to race conditions or if user was created between check and create
          if (createError?.code === 'P2002') {
            // User already exists - fetch and log them in
            console.log(
              `⚠️ User already exists (race condition), logging in: ${payload.email}`,
            );
            user = await this.prismaService.user.findUnique({
              where: { email: payload.email },
            });
            if (!user) {
              throw new BadRequestException(
                'User account exists but could not be retrieved. Please try again.',
              );
            }
          } else {
            console.error('Error creating user:', createError);
            throw new BadRequestException(
              `Failed to create user account: ${createError.message || 'Unknown error'}`,
            );
          }
        }
      }

      // Ensure user exists and has an id before proceeding
      if (!user || !user.id) {
        throw new BadRequestException(
          'User account is invalid. Please contact support.',
        );
      }

      const payloadDb = { sub: user.id, email: user.email };
      return {
        message: 'Login successful',
        authToken: await this.jwtService.signAsync(payloadDb),
      };
    } catch (error) {
      console.error('Error verifying ID token:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(
        'Failed to verify Google token. Please try again.',
      );
    }
  }

  async getDashboardCount(user_id: string) {
    const currentMonthStart =
      moment().startOf('month').format('YYYY-MM-DD') + 'T00:00:00.000Z';
    const currentMonthEnd =
      moment().endOf('month').format('YYYY-MM-DD') + 'T23:59:59.999Z';

    const lastMonthStart =
      moment().subtract(1, 'month').startOf('month').format('YYYY-MM-DD') +
      'T00:00:00.000Z';
    const lastMonthEnd =
      moment().subtract(1, 'month').endOf('month').format('YYYY-MM-DD') +
      'T23:59:59.999Z';

    const customer = await this.prismaService.customer.findMany({
      where: { user_id },
    });

    const invoice = await this.prismaService.invoice.findMany({
      where: { user_id },
    });

    const quotation = await this.prismaService.quotation.findMany({
      where: { user_id },
    });

    const res = {
      customer: {
        currentMonth: customer.filter((c) => {
          const createdAt = new Date(c.createdAt);
          return (
            createdAt >= new Date(currentMonthStart) &&
            createdAt <= new Date(currentMonthEnd)
          );
        }).length,
        lastMonth: customer.filter((c) => {
          const createdAt = new Date(c.createdAt);
          return (
            createdAt >= new Date(lastMonthStart) &&
            createdAt <= new Date(lastMonthEnd)
          );
        }).length,
        total: customer.length,
      },
      invoiceCount: {
        currentMonth: invoice.filter((i) => {
          const createdAt = new Date(i.createdAt);
          return (
            createdAt >= new Date(currentMonthStart) &&
            createdAt <= new Date(currentMonthEnd)
          );
        }).length,
        lastMonth: invoice.filter((i) => {
          const createdAt = new Date(i.createdAt);
          return (
            createdAt >= new Date(lastMonthStart) &&
            createdAt <= new Date(lastMonthEnd)
          );
        }).length,
        total: invoice.length,
      },
      quotationCount: {
        currentMonth: quotation.filter((q) => {
          const createdAt = new Date(q.createdAt);
          return (
            createdAt >= new Date(currentMonthStart) &&
            createdAt <= new Date(currentMonthEnd)
          );
        }).length,
        lastMonth: quotation.filter((q) => {
          const createdAt = new Date(q.createdAt);
          return (
            createdAt >= new Date(lastMonthStart) &&
            createdAt <= new Date(lastMonthEnd)
          );
        }).length,
        total: quotation.length,
      },
      dueAmount: {
        currentMonth: invoice
          .filter((i) => {
            const createdAt = new Date(i.createdAt);
            return (
              createdAt >= new Date(currentMonthStart) &&
              createdAt <= new Date(currentMonthEnd)
            );
          })
          .reduce((acc, curr) => acc + curr.due_amount, 0),
        lastMonth: invoice
          .filter((i) => {
            const createdAt = new Date(i.createdAt);
            return (
              createdAt >= new Date(lastMonthStart) &&
              createdAt <= new Date(lastMonthEnd)
            );
          })
          .reduce((acc, curr) => acc + curr.due_amount, 0),
        total: invoice.reduce((acc, curr) => acc + curr.due_amount, 0),
      },
    };

    return plainToInstance(DashboardCount, res);
  }
}

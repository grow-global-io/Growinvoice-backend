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

  async verifyGoogleToken(token: string): Promise<LoginSuccessDto> {
    const client = new OAuth2Client(
      this.configService.get<string>('GOOGLE_CLIENT_ID'),
    );
    try {
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: this.configService.get<string>('GOOGLE_CLIENT_ID'), // Specify the CLIENT_ID of the app that calls the backend.
      });
      const payload = ticket.getPayload();
      const user = await this.prismaService.user.findUnique({
        where: { email: payload.email },
      });
      const payloadDb = { sub: user.id, email: user.email };
      if (!user) {
        throw new BadRequestException('User not found');
      }
      return {
        message: 'Login successful',
        authToken: await this.jwtService.signAsync(payloadDb),
      };
    } catch (error) {
      console.error('Error verifying ID token:', error);
      return null;
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

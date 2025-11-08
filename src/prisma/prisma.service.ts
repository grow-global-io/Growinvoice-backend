import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { enhance } from '@zenstackhq/runtime';
import { SoftDeleteMiddleware } from './middleware';
import PaginationPaginate from 'prisma-paginate';

@Injectable()
export class PrismaService
  extends PrismaClient<Prisma.PrismaClientOptions, 'query'>
  implements OnModuleInit, OnModuleDestroy
{
  count = 0;
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super();

    this.logger.log(`Prisma v${Prisma.prismaVersion.client}`);
    this.$use(SoftDeleteMiddleware());
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Prisma connected to the database');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Prisma disconnected from the database');
  }

  getClient(user?) {
    return user.id === 'system' ? this : enhance(this, { user });
  }

  getPaginatedClient(user?) {
    const paginatedPrisma = this.$extends(PaginationPaginate);
    return enhance(paginatedPrisma, { user });
  }
}

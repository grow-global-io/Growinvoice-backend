import { Injectable, Logger } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { enhance } from '@zenstackhq/runtime';
import { SoftDeleteMiddleware } from './middleware';
import PaginationPaginate from 'prisma-paginate';

@Injectable()
export class PrismaService extends PrismaClient<
  Prisma.PrismaClientOptions,
  'query'
> {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super();

    this.logger.log(`Prisma v${Prisma.prismaVersion.client}`);
    this.$use(SoftDeleteMiddleware());
  }

  getClient(user?) {
    return user.id === 'system'
      ? this
      : enhance(this, { user }, { logPrismaQuery: true });
  }

  getPaginatedClient(user?) {
    const paginatedPrisma = this.$extends(PaginationPaginate);
    return enhance(paginatedPrisma, { user }, { logPrismaQuery: true });
  }
}

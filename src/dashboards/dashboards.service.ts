import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import {
  AIDashboardDto,
  CreateAIDashboardDto,
  UpdateAIDashboardDto,
} from '@shared/models';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class DashboardsService {
  constructor(private prismaService: PrismaService) {}
  async create(createDashboardDto: CreateAIDashboardDto) {
    const dashboard = await this.prismaService.aIDashboard.create({
      data: createDashboardDto,
    });
    return plainToInstance(AIDashboardDto, dashboard);
  }

  async findAll(user_id: string) {
    const dashboards = await this.prismaService.aIDashboard.findMany({
      where: {
        user_id,
      },
    });
    return dashboards.map((dashboard) =>
      plainToInstance(AIDashboardDto, dashboard),
    );
  }

  async findOne(id: string) {
    const dashboard = await this.prismaService.aIDashboard.findUnique({
      where: {
        id,
      },
    });
    return plainToInstance(AIDashboardDto, dashboard);
  }

  async update(id: string, updateDashboardDto: UpdateAIDashboardDto) {
    const dashboard = await this.prismaService.aIDashboard.update({
      where: {
        id,
      },
      data: updateDashboardDto,
    });
    return plainToInstance(AIDashboardDto, dashboard);
  }

  async remove(id: string) {
    const dashboard = await this.prismaService.aIDashboard.delete({
      where: {
        id,
      },
    });
    return plainToInstance(AIDashboardDto, dashboard);
  }
}

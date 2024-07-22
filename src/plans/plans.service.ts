import { Injectable } from '@nestjs/common';
import {
  CreatePlanWithFeaturesDto,
  UpdatePlanWithFeaturesDto,
} from './dto/create-plan-with-features.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { plainToInstance } from 'class-transformer';
import { PlansDto } from '@shared/models';
import { PlanWithFeaturesDto } from './dto/plan-with-features.dto';

@Injectable()
export class PlansService {
  constructor(private readonly prismaService: PrismaService) {}
  async create(createPlanDto: CreatePlanWithFeaturesDto) {
    const plan = await this.prismaService.plans.create({
      data: {
        days: createPlanDto.days,
        description: createPlanDto.description,
        is_active: createPlanDto.is_active,
        name: createPlanDto.name,
        price: createPlanDto.price,
        PlanFeatures: {
          createMany: {
            data: createPlanDto.features?.map((feature) => {
              return {
                count: feature.count,
                feature: feature.feature,
              };
            }),
          },
        },
      },
    });

    return plainToInstance(PlansDto, plan);
  }

  async findAll() {
    const plans = await this.prismaService.plans.findMany({
      include: {
        PlanFeatures: true,
      },
    });

    return plans.map((plan) => plainToInstance(PlanWithFeaturesDto, plan));
  }

  async findOne(id: string) {
    const plan = await this.prismaService.plans.findUnique({
      where: {
        id,
      },
      include: {
        PlanFeatures: true,
      },
    });

    return plainToInstance(PlanWithFeaturesDto, plan);
  }

  async update(id: string, updatePlanDto: UpdatePlanWithFeaturesDto) {
    const plan = await this.prismaService.plans.update({
      where: {
        id,
      },
      data: {
        days: updatePlanDto.days,
        description: updatePlanDto.description,
        is_active: updatePlanDto.is_active,
        name: updatePlanDto.name,
        price: updatePlanDto.price,
        PlanFeatures: {
          deleteMany: {},
          createMany: {
            data: updatePlanDto.features?.map((feature) => {
              return {
                count: feature.count,
                feature: feature.feature,
              };
            }),
          },
        },
      },
    });

    return plainToInstance(PlansDto, plan);
  }

  async remove(id: string) {
    return await this.prismaService.plans.delete({
      where: {
        id,
      },
    });
  }
}

import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { CreateUserPlansDto, UserPlansDto } from '@shared/models';
import { plainToInstance } from 'class-transformer';
import { UpdateUserPlanCustomDto } from './dto/update-dto-custom.dto';

@Injectable()
export class UserplansService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createUserplanDto: CreateUserPlansDto) {
    const userplan = await this.prismaService.userPlans.create({
      data: {
        plan_id: createUserplanDto.plan_id,
        user_id: createUserplanDto.user_id,
        start_date: createUserplanDto.start_date,
        end_date: createUserplanDto.end_date,
        status: createUserplanDto.status,
      },
    });

    return plainToInstance(UserPlansDto, userplan);
  }

  async update(id: string, updateUserplanDto: UpdateUserPlanCustomDto) {
    const userplan = await this.prismaService.userPlans.update({
      where: { id },
      data: {
        status: updateUserplanDto.status,
      },
    });

    return plainToInstance(UserPlansDto, userplan);
  }
}

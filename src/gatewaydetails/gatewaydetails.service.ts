import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { GateWayType } from '@prisma/client';
import {
  CreateGateWayDetailsDto,
  GateWayDetailsDto,
  UpdateGateWayDetailsDto,
} from '@shared/models';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class GatewaydetailsService {
  constructor(private prismaService: PrismaService) {}
  async create(createGatewaydetailDto: CreateGateWayDetailsDto) {
    const gatewayDetails = await this.prismaService.gateWayDetails.create({
      data: createGatewaydetailDto,
    });

    return plainToInstance(GateWayDetailsDto, gatewayDetails);
  }

  async findAll(user_id: string) {
    const gatewayDetails = await this.prismaService.gateWayDetails.findMany({
      where: {
        user_id,
      },
    });

    return plainToInstance(GateWayDetailsDto, gatewayDetails);
  }

  async findEnabledAll(user_id: string) {
    const gatewayDetails = await this.prismaService.gateWayDetails.findMany({
      where: {
        user_id,
        enabled: true,
      },
    });

    return plainToInstance(GateWayDetailsDto, gatewayDetails);
  }

  async findOne(id: string) {
    const gatewayDetails = await this.prismaService.gateWayDetails.findUnique({
      where: {
        id,
      },
    });

    return plainToInstance(GateWayDetailsDto, gatewayDetails);
  }

  async update(id: string, updateGatewaydetailDto: UpdateGateWayDetailsDto) {
    const gatewayDetails = await this.prismaService.gateWayDetails.update({
      where: {
        id,
      },
      data: updateGatewaydetailDto,
    });

    return plainToInstance(GateWayDetailsDto, gatewayDetails);
  }

  async getbyuserIdandType(user_id: string, type: GateWayType) {
    const gatewayDetails = await this.prismaService.gateWayDetails.findUnique({
      where: {
        type_user_id: {
          user_id,
          type,
        },
      },
    });
    return plainToInstance(GateWayDetailsDto, gatewayDetails);
  }

  async remove(id: string) {
    return await this.prismaService.gateWayDetails.delete({
      where: {
        id,
      },
    });
  }
}

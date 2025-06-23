import { PrismaService } from '@/prisma/prisma.service';
import { Inject, Injectable } from '@nestjs/common';
import { HSNCode, HSNCodeDto, UpdateHSNCodeDto } from '@shared/models';
import { plainToInstance } from 'class-transformer';
import { CreateHSNCodeTaxDto } from './dto/create-hsn-code-tax.dto';
import { SharedService } from '@/shared/shared.service';
import { ENHANCED_PRISMA } from '@zenstackhq/server/nestjs';

@Injectable()
export class HsncodeService {
  constructor(
    @Inject(ENHANCED_PRISMA) private prismaService: PrismaService,
    private readonly sharedService: SharedService, // Assuming SharedService is defined elsewhere
  ) {}
  async create(createHsncodeDto: CreateHSNCodeTaxDto) {
    await this.sharedService.checkHsnCodeQuota(createHsncodeDto.user_id);
    const tax = await this.prismaService.tax.create({
      data: {
        percentage: createHsncodeDto.tax,
        user_id: createHsncodeDto.user_id,
        hsnCode: {
          create: {
            code: createHsncodeDto.hsn_code,
            user_id: createHsncodeDto.user_id,
          },
        },
      },
    });
    return plainToInstance(HSNCodeDto, tax);
  }

  async findAll(user_id: string) {
    const hsncode = await this.prismaService.hSNCode.findMany({
      where: { user_id },
      include: {
        tax: true,
      },
    });
    return plainToInstance(HSNCode, hsncode);
  }

  async findOne(id: string) {
    const hsncode = await this.prismaService.hSNCode.findUnique({
      where: { id },
    });
    return plainToInstance(HSNCodeDto, hsncode);
  }

  async update(id: string, updateHsncodeDto: UpdateHSNCodeDto) {
    const hsncode = await this.prismaService.hSNCode.update({
      where: { id },
      data: updateHsncodeDto,
    });
    return plainToInstance(HSNCodeDto, hsncode);
  }

  async remove(id: string) {
    return await this.prismaService.hSNCode.delete({
      where: { id },
    });
  }
}

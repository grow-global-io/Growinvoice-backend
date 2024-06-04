import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { CreateHSNCodeDto, HSNCodeDto, UpdateHSNCodeDto } from '@shared/models';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class HsncodeService {
  constructor(private prismaService: PrismaService) {}
  async create(createHsncodeDto: CreateHSNCodeDto) {
    const hsncode = await this.prismaService.hSNCode.create({
      data: createHsncodeDto,
    });
    return plainToInstance(HSNCodeDto, hsncode);
  }

  async findAll() {
    const hsncode = await this.prismaService.hSNCode.findMany();
    return plainToInstance(HSNCodeDto, hsncode);
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

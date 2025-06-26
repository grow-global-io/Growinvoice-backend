import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import {
  CouponsDto,
  CreateCouponsDto,
  UpdateCouponsDto,
  User,
} from '@shared/models';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class CouponsService {
  constructor(private readonly prismaService: PrismaService) {}
  async create(createCouponDto: CreateCouponsDto, user: User) {
    return this.prismaService.coupons.create({
      data: {
        code: createCouponDto.code,
        discount: createCouponDto.discount,
        end_date: createCouponDto.end_date,
        start_date: createCouponDto.start_date,
        user: {
          connect: {
            id: user.id,
          },
        },
      },
    });
  }

  async findAll() {
    const coupons = await this.prismaService.coupons.findMany();
    return plainToInstance(CouponsDto, coupons);
  }

  async findOne(id?: string, code?: string) {
    const coupon = await this.prismaService.coupons.findFirst({
      where: {
        OR: [{ id: id }, { code: code }],
      },
    });
    return plainToInstance(CouponsDto, coupon);
  }

  async update(id: string, updateCouponDto: UpdateCouponsDto) {
    const coupon = await this.prismaService.coupons.update({
      where: { id: id },
      data: updateCouponDto,
    });
    return plainToInstance(CouponsDto, coupon);
  }

  async remove(id: string) {
    await this.prismaService.coupons.delete({
      where: { id },
    });
    return {
      message: 'Coupon deleted successfully',
    };
  }
}

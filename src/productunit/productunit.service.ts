import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import {
  CreateProductUnitDto,
  ProductUnitDto,
  UpdateProductUnitDto,
} from '@shared/models';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class ProductunitService {
  constructor(private prismaService: PrismaService) {}

  async create(createProductunitDto: CreateProductUnitDto) {
    return await this.prismaService.productUnit.create({
      data: createProductunitDto,
    });
  }

  findAll(userId: string) {
    const productunit = this.prismaService.productUnit.findMany({
      where: { user_id: userId },
    });

    return plainToInstance(ProductUnitDto, productunit);
  }

  findOne(id: string) {
    const productunit = this.prismaService.productUnit.findUnique({
      where: { id: id },
    });

    return plainToInstance(ProductUnitDto, productunit);
  }

  update(id: string, updateProductunitDto: UpdateProductUnitDto) {
    return this.prismaService.productUnit.update({
      where: { id: id },
      data: updateProductunitDto,
    });
  }

  remove(id: string) {
    return this.prismaService.productUnit.delete({
      where: { id: id },
    });
  }
}

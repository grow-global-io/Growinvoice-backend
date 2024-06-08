import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateProductDto, ProductDto, UpdateProductDto } from '@shared/models';
import { plainToInstance } from 'class-transformer';
import { ProductWithAllDataDto } from './dto/product-with-allproperties.dto';

@Injectable()
export class ProductService {
  constructor(private prismaService: PrismaService) {}

  create(createProductDto: CreateProductDto) {
    return this.prismaService.product.create({
      data: createProductDto,
    });
  }

  async findAll(user_id: string) {
    const products = await this.prismaService.product.findMany({
      where: { user_id },
      include: {
        unit: true,
      },
    });
    return plainToInstance(ProductWithAllDataDto, products);
  }

  async findOne(id: string) {
    const product = await this.prismaService.product.findUnique({
      where: { id },
    });
    return plainToInstance(ProductDto, product);
  }

  update(id: string, updateProductDto: UpdateProductDto) {
    return this.prismaService.product.update({
      where: { id },
      data: updateProductDto,
    });
  }

  async remove(id: string) {
    return this.prismaService.product.delete({
      where: { id },
    });
  }
}

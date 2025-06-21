import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { ProductDto } from '@shared/models';
import { plainToInstance } from 'class-transformer';
import { ProductWithAllDataDto } from './dto/product-with-allproperties.dto';
import { SharedService } from '@/shared/shared.service';
import { ENHANCED_PRISMA } from '@zenstackhq/server/nestjs';
import { CreateProductWithTaxDto } from './dto/create-prodyuct-with-tax.dto';
import { UpdateProductWithTaxDto } from './dto/update-prodyct-with-tax.dto';

@Injectable()
export class ProductService {
  constructor(
    @Inject(ENHANCED_PRISMA) private prismaService: PrismaService,
    private readonly sharedService: SharedService, // Assuming you have a SharedService for common functionalities
  ) {}

  async create(createProductDto: CreateProductWithTaxDto) {
    const { tax, ...prodyctData } = createProductDto;
    await this.sharedService.checkProductQuota(createProductDto.user_id);
    const product = await this.prismaService.product.create({
      data: {
        ...prodyctData,
        user_id: createProductDto.user_id,
      },
    });

    if (tax && tax.length > 0) {
      await this.prismaService.taxForProduct.createMany({
        data: tax.map((taxId) => ({
          product_id: product.id,
          tax_id: taxId,
        })),
      });
    }
    return plainToInstance(ProductWithAllDataDto, product);
  }

  async findAll(user_id: string) {
    const products = await this.prismaService.product.findMany({
      where: { user_id },
      include: {
        unit: true,
        currency: true,
        tax: {
          include: {
            tax: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return plainToInstance(ProductWithAllDataDto, products);
  }

  async findOne(id: string) {
    const product = await this.prismaService.product.findUnique({
      where: { id },
    });
    return plainToInstance(ProductDto, product);
  }

  async update(id: string, updateProductDto: UpdateProductWithTaxDto) {
    const { tax, ...updateData } = updateProductDto;
    const product = await this.prismaService.product.update({
      where: { id },
      data: {
        ...updateData,
        user_id: updateProductDto.user_id, // Ensure user_id is updated if provided
      },
    });
    if (tax && tax.length > 0) {
      // Remove existing tax associations
      await this.prismaService.taxForProduct.deleteMany({
        where: { product_id: id },
      });
      // Create new tax associations
      await this.prismaService.taxForProduct.createMany({
        data: tax.map((taxId) => ({
          product_id: id,
          tax_id: taxId,
        })),
      });
    }
    return plainToInstance(ProductWithAllDataDto, product);
  }

  async remove(id: string) {
    return this.prismaService.product.delete({
      where: { id },
    });
  }
}

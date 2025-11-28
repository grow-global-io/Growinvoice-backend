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
    const { tax, priceBook, ...prodyctData } = createProductDto;

    // Check quota first and ensure it completes fully before proceeding
    // This prevents transaction conflicts with ZenStack's enhanced Prisma client
    try {
      await this.sharedService.checkProductQuota(createProductDto.user_id);
      // Small delay to ensure any transaction context from quota check is fully closed
      await new Promise((resolve) => setTimeout(resolve, 10));
    } catch (error) {
      // Re-throw quota errors immediately
      throw error;
    }

    if (!Object.keys(prodyctData).includes('description')) {
      prodyctData.description = '';
    }
    if (!Object.keys(prodyctData).includes('hsnCode_id')) {
      prodyctData.hsnCode_id = null;
    }
    if (!Object.keys(prodyctData).includes('images')) {
      prodyctData.images = [];
    }
    // Ensure includeStore is explicitly set (default to false if not provided)
    if (
      !Object.keys(prodyctData).includes('includeStore') ||
      prodyctData.includeStore === undefined
    ) {
      prodyctData.includeStore = false;
    }

    // Create product with all nested relations in a single operation
    // This ensures everything happens in one transaction
    // Add retry logic for transaction errors
    const maxRetries = 3;
    let lastError: any;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const product = await this.prismaService.product.create({
          data: {
            ...prodyctData,
            user_id: createProductDto.user_id,
            ...(tax && {
              tax: {
                createMany: {
                  data: tax?.map((taxId) => ({ tax_id: taxId })) || [],
                },
              },
            }),
            priceBook: {
              createMany: {
                data:
                  priceBook?.map((price) => ({
                    ...price,
                  })) || [],
              },
            },
          },
        });
        return plainToInstance(ProductWithAllDataDto, product);
      } catch (error: any) {
        lastError = error;
        // Check if it's a transaction error that we should retry
        const isTransactionError =
          error?.message?.includes('Transaction') ||
          error?.message?.includes('transaction') ||
          error?.code === 'P2034' || // Prisma transaction timeout error code
          error?.message?.includes('Transaction already closed');

        if (isTransactionError && attempt < maxRetries) {
          // Wait before retrying (exponential backoff)
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }
        // If not a transaction error or max retries reached, throw
        throw error;
      }
    }

    // If we get here, all retries failed
    throw lastError;
  }

  async findAll(user_id: string) {
    const products = await this.prismaService.product.findMany({
      where: { user_id },
      include: {
        unit: true,
        tax: {
          include: {
            tax: true,
          },
        },
        hsnCode: {
          include: {
            tax: true,
          },
        },
        priceBook: {
          include: {
            currency: true,
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
    const { tax, priceBook, ...updateData } = updateProductDto;

    // Build update data object
    const dataToUpdate: any = {
      ...updateData,
    };

    // Only update user_id if provided
    if (updateProductDto.user_id) {
      dataToUpdate.user_id = updateProductDto.user_id;
    }

    // Handle tax associations
    if (tax !== undefined) {
      dataToUpdate.tax = {
        deleteMany: {}, // Remove all existing tax associations
        createMany: {
          data: tax?.map((taxId) => ({ tax_id: taxId })) || [],
        },
      };
    }

    // Handle priceBook associations
    if (priceBook !== undefined) {
      dataToUpdate.priceBook = {
        deleteMany: {}, // Remove all existing priceBook associations
        createMany: {
          data:
            priceBook?.map((price) => ({
              ...price,
            })) || [],
        },
      };
    }

    const product = await this.prismaService.product.update({
      where: { id },
      data: dataToUpdate,
    });
    return plainToInstance(ProductWithAllDataDto, product);
  }

  async remove(id: string) {
    return this.prismaService.product.delete({
      where: { id },
    });
  }
}

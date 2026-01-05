import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { ENHANCED_PRISMA } from '@zenstackhq/server/nestjs';
import {
  CreateInventoryDto,
  InventoryOperation,
} from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import {
  InventoryResponseDto,
  InventoryStatus,
} from './dto/inventory-response.dto';

// Units to exclude from inventory
const EXCLUDED_UNITS = [
  'monthly',
  'quadrimester',
  'month',
  'months',
  'quadrimesters',
];

@Injectable()
export class InventoryService {
  constructor(@Inject(ENHANCED_PRISMA) private prismaService: PrismaService) {}

  /**
   * Calculate inventory status based on quantity and threshold
   */
  private calculateStatus(
    quantity: number,
    threshold: number,
  ): InventoryStatus {
    if (quantity === 0) return InventoryStatus.UNAVAILABLE;
    if (quantity > 0 && quantity < threshold)
      return InventoryStatus.PARTIALLY_AVAILABLE;
    return InventoryStatus.AVAILABLE;
  }

  /**
   * Transform inventory entity to response DTO
   */
  private transformToResponseDto(inventory: any): InventoryResponseDto {
    return {
      id: inventory.id,
      productId: inventory.product_id,
      productName: inventory.product?.name || '',
      quantity: inventory.quantity,
      lowStockThreshold: inventory.lowStockThreshold,
      lastUpdated: inventory.lastUpdated.toISOString(),
      unit: inventory.product?.unit?.name || '',
      status: this.calculateStatus(
        inventory.quantity,
        inventory.lowStockThreshold,
      ),
      user_id: inventory.user_id,
      createdAt: inventory.createdAt.toISOString(),
      updatedAt:
        inventory.updatedAt?.toISOString() || inventory.createdAt.toISOString(),
    };
  }

  /**
   * Verify that product belongs to user
   */
  private async verifyProductOwnership(
    productId: string,
    userId: string,
  ): Promise<void> {
    const product = await this.prismaService.product.findUnique({
      where: { id: productId },
      select: { user_id: true },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    if (product.user_id !== userId) {
      throw new ForbiddenException(
        'You do not have permission to access this product',
      );
    }
  }

  /**
   * Verify that inventory entry belongs to user
   */
  private async verifyInventoryOwnership(
    inventoryId: string,
    userId: string,
  ): Promise<void> {
    const inventory = await this.prismaService.inventory.findUnique({
      where: { id: inventoryId },
      select: { user_id: true },
    });

    if (!inventory) {
      throw new NotFoundException(
        `Inventory entry with ID ${inventoryId} not found`,
      );
    }

    if (inventory.user_id !== userId) {
      throw new ForbiddenException(
        'You do not have permission to access this inventory entry',
      );
    }
  }

  /**
   * Apply operation to quantity
   */
  private applyOperation(
    currentQuantity: number,
    operation: InventoryOperation,
    quantity?: number,
    amount?: number,
  ): number {
    switch (operation) {
      case InventoryOperation.SET:
        return quantity ?? 0;
      case InventoryOperation.ADD:
        if (amount === undefined) {
          throw new BadRequestException(
            'Amount is required when operation is "add"',
          );
        }
        return currentQuantity + amount;
      case InventoryOperation.SUBTRACT:
        if (amount === undefined) {
          throw new BadRequestException(
            'Amount is required when operation is "subtract"',
          );
        }
        return Math.max(0, currentQuantity - amount);
      default:
        return quantity ?? currentQuantity;
    }
  }

  /**
   * Get all inventory entries for a user
   */
  async findAll(
    userId: string,
    excludeUnits?: string[],
  ): Promise<InventoryResponseDto[]> {
    const excludedUnitsList = excludeUnits || EXCLUDED_UNITS;

    const inventoryEntries = await this.prismaService.inventory.findMany({
      where: {
        user_id: userId,
        product: {
          unit: {
            name: {
              notIn: excludedUnitsList.map((u) => u.toLowerCase()),
            },
          },
        },
      },
      include: {
        product: {
          include: {
            unit: true,
          },
        },
      },
      orderBy: { lastUpdated: 'desc' },
    });

    return inventoryEntries.map((entry) => this.transformToResponseDto(entry));
  }

  /**
   * Get inventory entry by product ID
   */
  async findByProductId(
    productId: string,
    userId: string,
  ): Promise<InventoryResponseDto> {
    await this.verifyProductOwnership(productId, userId);

    const inventory = await this.prismaService.inventory.findUnique({
      where: { product_id: productId },
      include: {
        product: {
          include: {
            unit: true,
          },
        },
      },
    });

    if (!inventory) {
      throw new NotFoundException(
        `Inventory entry for product ${productId} not found`,
      );
    }

    if (inventory.user_id !== userId) {
      throw new ForbiddenException(
        'You do not have permission to access this inventory entry',
      );
    }

    return this.transformToResponseDto(inventory);
  }

  /**
   * Create or update inventory entry
   */
  async create(
    createInventoryDto: CreateInventoryDto,
    userId: string,
  ): Promise<InventoryResponseDto> {
    await this.verifyProductOwnership(createInventoryDto.productId, userId);

    // Check if inventory entry already exists
    const existing = await this.prismaService.inventory.findUnique({
      where: { product_id: createInventoryDto.productId },
    });

    const operation = createInventoryDto.operation || InventoryOperation.SET;
    const currentQuantity = existing?.quantity ?? 0;
    const newQuantity = this.applyOperation(
      currentQuantity,
      operation,
      createInventoryDto.quantity,
      createInventoryDto.amount,
    );

    const inventoryData = {
      product_id: createInventoryDto.productId,
      quantity: newQuantity,
      lowStockThreshold: createInventoryDto.lowStockThreshold ?? 10,
      user_id: userId,
      lastUpdated: new Date(),
    };

    let inventory;
    if (existing) {
      // Update existing entry
      inventory = await this.prismaService.inventory.update({
        where: { id: existing.id },
        data: inventoryData,
        include: {
          product: {
            include: {
              unit: true,
            },
          },
        },
      });
    } else {
      // Create new entry
      inventory = await this.prismaService.inventory.create({
        data: inventoryData,
        include: {
          product: {
            include: {
              unit: true,
            },
          },
        },
      });
    }

    return this.transformToResponseDto(inventory);
  }

  /**
   * Update inventory entry
   */
  async update(
    id: string,
    updateInventoryDto: UpdateInventoryDto,
    userId: string,
  ): Promise<InventoryResponseDto> {
    await this.verifyInventoryOwnership(id, userId);

    const existing = await this.prismaService.inventory.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Inventory entry with ID ${id} not found`);
    }

    const operation = updateInventoryDto.operation || InventoryOperation.SET;
    const newQuantity = this.applyOperation(
      existing.quantity,
      operation,
      updateInventoryDto.quantity,
      updateInventoryDto.amount,
    );

    const updateData: any = {
      lastUpdated: new Date(),
    };

    if (
      updateInventoryDto.quantity !== undefined ||
      updateInventoryDto.operation
    ) {
      updateData.quantity = newQuantity;
    }

    if (updateInventoryDto.lowStockThreshold !== undefined) {
      updateData.lowStockThreshold = updateInventoryDto.lowStockThreshold;
    }

    const inventory = await this.prismaService.inventory.update({
      where: { id },
      data: updateData,
      include: {
        product: {
          include: {
            unit: true,
          },
        },
      },
    });

    return this.transformToResponseDto(inventory);
  }

  /**
   * Delete inventory entry
   */
  async remove(id: string, userId: string): Promise<void> {
    await this.verifyInventoryOwnership(id, userId);

    await this.prismaService.inventory.delete({
      where: { id },
    });
  }

  /**
   * Bulk update inventory entries
   */
  async bulkUpdate(
    updates: CreateInventoryDto[],
    userId: string,
  ): Promise<InventoryResponseDto[]> {
    const results: InventoryResponseDto[] = [];

    for (const update of updates) {
      try {
        const result = await this.create(update, userId);
        results.push(result);
      } catch (error) {
        // Continue with other updates even if one fails
        // You might want to collect errors and return them
        console.error(
          `Failed to update inventory for product ${update.productId}:`,
          error,
        );
      }
    }

    return results;
  }
}

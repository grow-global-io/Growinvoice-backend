import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { ProductunitService } from './productunit.service';
import { ApiTags } from '@nestjs/swagger';
import {
  CreateProductUnitDto,
  ProductUnitDto,
  UpdateProductUnitDto,
} from '@shared/models';
import { ApiSuccessResponse } from '@shared/decorators/api-success-response.decorator';
import { SuccessResponseDto } from '@shared/dto/success-response.dto';

@ApiTags('productunit')
@Controller('productunit')
export class ProductunitController {
  constructor(private readonly productunitService: ProductunitService) {}

  @Post()
  @ApiSuccessResponse(ProductUnitDto, {
    status: 201,
  })
  async create(
    @Body() createProductunitDto: CreateProductUnitDto,
  ): Promise<SuccessResponseDto<ProductUnitDto>> {
    const productunit =
      await this.productunitService.create(createProductunitDto);

    return {
      result: productunit,
      message: 'Product unit created successfully',
    };
  }

  @Get()
  findAll() {
    return this.productunitService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productunitService.findOne(id);
  }

  @Put(':id')
  @ApiSuccessResponse(ProductUnitDto)
  async update(
    @Param('id') id: string,
    @Body() updateProductunitDto: UpdateProductUnitDto,
  ): Promise<SuccessResponseDto<ProductUnitDto>> {
    const productUnit = await this.productunitService.update(
      id,
      updateProductunitDto,
    );
    return {
      result: productUnit,
      message: 'Product unit updated successfully',
    };
  }

  @Delete(':id')
  @ApiSuccessResponse()
  async remove(@Param('id') id: string) {
    await this.productunitService.remove(id);
    return {
      message: 'Product unit deleted successfully',
    };
  }
}

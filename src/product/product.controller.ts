import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductDto } from '@shared/models';
import { ApiTags } from '@nestjs/swagger';
import { ApiSuccessResponse } from '@shared/decorators/api-success-response.decorator';
import { GetUser, User } from '@shared/decorators/user.decorator';
import { CreateProductWithTaxDto } from './dto/create-prodyuct-with-tax.dto';
import { UpdateProductWithTaxDto } from './dto/update-prodyct-with-tax.dto';

@ApiTags('product')
@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @ApiSuccessResponse(ProductDto, { status: 201 })
  async create(@Body() createProductDto: CreateProductWithTaxDto) {
    const product = await this.productService.create(createProductDto);
    return {
      message: 'Product created successfully',
      data: product,
    };
  }

  @Get()
  async findAll(@GetUser() user: User) {
    return await this.productService.findAll(user?.sub);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productService.findOne(id);
  }

  @Put(':id')
  @ApiSuccessResponse(ProductDto, { status: 200 })
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductWithTaxDto,
  ) {
    const product = await this.productService.update(id, updateProductDto);
    return {
      message: 'Product updated successfully',
      data: product,
    };
  }

  @Delete(':id')
  @ApiSuccessResponse()
  async remove(@Param('id') id: string) {
    await this.productService.remove(id);
    return {
      message: 'Product deleted successfully',
    };
  }
}

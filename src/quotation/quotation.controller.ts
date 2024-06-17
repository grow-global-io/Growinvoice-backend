import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { QuotationService } from './quotation.service';
import { ApiExtraModels, ApiTags } from '@nestjs/swagger';
import { QuotationDto } from '@shared/models';
import { ApiSuccessResponse } from '@shared/decorators/api-success-response.decorator';
import {
  CreateQuotationWithProducts,
  UpdateQuotationWithProducts,
} from './dto/create-quotation-with-products.dto';
import { SuccessResponseDto } from '@shared/dto/success-response.dto';
import { GetUser, User } from '@shared/decorators/user.decorator';

@ApiExtraModels(QuotationDto)
@ApiTags('quotation')
@Controller('quotation')
export class QuotationController {
  constructor(private readonly quotationService: QuotationService) {}

  @Post()
  @ApiSuccessResponse(QuotationDto, { status: 201 })
  async create(
    @Body() createQuotationDto: CreateQuotationWithProducts,
  ): Promise<SuccessResponseDto<QuotationDto>> {
    const quotation = await this.quotationService.create(createQuotationDto);
    return {
      message: 'Quotation created successfully',
      result: quotation,
    };
  }

  @Get()
  findAll(@GetUser() user: User) {
    return this.quotationService.findAll(user?.sub);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.quotationService.findOne(id);
  }

  @Patch(':id')
  @ApiSuccessResponse(QuotationDto, { status: 200 })
  async update(
    @Param('id') id: string,
    @Body() updateQuotationDto: UpdateQuotationWithProducts,
  ): Promise<SuccessResponseDto<QuotationDto>> {
    const quotation = await this.quotationService.update(
      id,
      updateQuotationDto,
    );
    return {
      message: 'Quotation updated successfully',
      result: quotation,
    };
  }

  @Delete(':id')
  @ApiSuccessResponse()
  async remove(@Param('id') id: string) {
    await this.quotationService.remove(id);
    return {
      message: 'Quotation deleted successfully',
    };
  }
}

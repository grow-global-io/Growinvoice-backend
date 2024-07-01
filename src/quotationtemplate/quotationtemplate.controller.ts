import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { QuotationtemplateService } from './quotationtemplate.service';
import {
  CreateQuotationTemplateDto,
  QuotationTemplateDto,
  UpdateQuotationTemplateDto,
} from '@shared/models';
import { ApiSuccessResponse } from '@shared/decorators/api-success-response.decorator';
import { SuccessResponseDto } from '@shared/dto/success-response.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('quotationtemplate')
@Controller('quotationtemplate')
export class QuotationtemplateController {
  constructor(
    private readonly quotationtemplateService: QuotationtemplateService,
  ) {}

  @Post()
  @ApiSuccessResponse(QuotationTemplateDto, { status: 201 })
  async create(
    @Body() createQuotationtemplateDto: CreateQuotationTemplateDto,
  ): Promise<SuccessResponseDto<QuotationTemplateDto>> {
    const quotation = await this.quotationtemplateService.create(
      createQuotationtemplateDto,
    );
    return {
      message: 'Invoice template created successfully',
      result: quotation,
    };
  }

  @Get()
  async findAll() {
    return this.quotationtemplateService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.quotationtemplateService.findOne(id);
  }

  @Patch(':id')
  @ApiSuccessResponse(QuotationTemplateDto)
  async update(
    @Param('id') id: string,
    @Body() updateQuotationtemplateDto: UpdateQuotationTemplateDto,
  ): Promise<SuccessResponseDto<QuotationTemplateDto>> {
    const quotation = await this.quotationtemplateService.update(
      id,
      updateQuotationtemplateDto,
    );
    return {
      message: 'Quotation template updated successfully',
      result: quotation,
    };
  }

  @Delete(':id')
  @ApiSuccessResponse()
  async remove(@Param('id') id: string): Promise<SuccessResponseDto> {
    await this.quotationtemplateService.remove(id);
    return {
      message: 'Quotation template deleted successfully',
    };
  }
}

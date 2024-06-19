import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { InvoicetemplateService } from './invoicetemplate.service';
import {
  CreateInvoiceTemplateDto,
  InvoiceTemplateDto,
  UpdateInvoiceTemplateDto,
} from '@shared/models';
import { ApiSuccessResponse } from '@shared/decorators/api-success-response.decorator';
import { SuccessResponseDto } from '@shared/dto/success-response.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('invoicetemplate')
@Controller('invoicetemplate')
export class InvoicetemplateController {
  constructor(
    private readonly invoicetemplateService: InvoicetemplateService,
  ) {}

  @Post()
  @ApiSuccessResponse(InvoiceTemplateDto, { status: 201 })
  async create(
    @Body() createInvoicetemplateDto: CreateInvoiceTemplateDto,
  ): Promise<SuccessResponseDto<InvoiceTemplateDto>> {
    const result = await this.invoicetemplateService.create(
      createInvoicetemplateDto,
    );
    return {
      message: 'Invoice template created successfully',
      result: result,
    };
  }

  @Get()
  async findAll() {
    return await this.invoicetemplateService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.invoicetemplateService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateInvoicetemplateDto: UpdateInvoiceTemplateDto,
  ) {
    return this.invoicetemplateService.update(id, updateInvoicetemplateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.invoicetemplateService.remove(id);
  }
}

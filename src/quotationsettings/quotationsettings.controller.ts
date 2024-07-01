import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { QuotationsettingsService } from './quotationsettings.service';
import {
  CreateQuotationSettingsDto,
  QuotationSettingsDto,
  UpdateQuotationSettingsDto,
} from '@shared/models';
import { ApiTags } from '@nestjs/swagger';
import { ApiSuccessResponse } from '@shared/decorators/api-success-response.decorator';
import { SuccessResponseDto } from '@shared/dto/success-response.dto';
import { GetUser, User } from '@shared/decorators/user.decorator';

@ApiTags('quotationsettings')
@Controller('quotationsettings')
export class QuotationsettingsController {
  constructor(
    private readonly quotationsettingsService: QuotationsettingsService,
  ) {}

  @Post()
  @ApiSuccessResponse(QuotationSettingsDto, { status: 201 })
  async create(
    @Body() createQuotationsettingDto: CreateQuotationSettingsDto,
  ): Promise<SuccessResponseDto<QuotationSettingsDto>> {
    const quotation = await this.quotationsettingsService.create(
      createQuotationsettingDto,
    );
    return {
      message: 'Quotation setting created successfully',
      result: quotation,
    };
  }

  @Get()
  async findAll(@GetUser() user: User) {
    return await this.quotationsettingsService.findAll(user?.sub);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.quotationsettingsService.findOne(id);
  }

  @Patch(':id')
  @ApiSuccessResponse(QuotationSettingsDto)
  async update(
    @Param('id') id: string,
    @Body() updateQuotationsettingDto: UpdateQuotationSettingsDto,
  ): Promise<SuccessResponseDto<QuotationSettingsDto>> {
    const quotation = await this.quotationsettingsService.update(
      id,
      updateQuotationsettingDto,
    );
    return {
      message: 'Quotation setting updated successfully',
      result: quotation,
    };
  }

  @Delete(':id')
  @ApiSuccessResponse()
  async remove(@Param('id') id: string): Promise<SuccessResponseDto> {
    await this.quotationsettingsService.remove(id);
    return {
      message: 'Quotation setting deleted successfully',
    };
  }
}

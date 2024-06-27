import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { InvoicesettingsService } from './invoicesettings.service';
import {
  CreateInvoiceSettingsDto,
  InvoiceSettingsDto,
  UpdateInvoiceSettingsDto,
} from '@shared/models';
import { ApiSuccessResponse } from '@shared/decorators/api-success-response.decorator';
import { SuccessResponseDto } from '@shared/dto/success-response.dto';
import { GetUser, User } from '@shared/decorators/user.decorator';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('invoicesettings')
@Controller('invoicesettings')
export class InvoicesettingsController {
  constructor(
    private readonly invoicesettingsService: InvoicesettingsService,
  ) {}

  @Post()
  @ApiSuccessResponse(InvoiceSettingsDto, { status: 201 })
  async create(
    @Body() createInvoicesettingDto: CreateInvoiceSettingsDto,
  ): Promise<SuccessResponseDto<InvoiceSettingsDto>> {
    const setting = await this.invoicesettingsService.create(
      createInvoicesettingDto,
    );
    return {
      message: 'Invoice setting created successfully',
      result: setting,
    };
  }

  @Get()
  async findAll(@GetUser() user: User) {
    return this.invoicesettingsService.findAll(user?.sub);
  }

  @Get('first')
  async findFirst(@GetUser() user: User) {
    return this.invoicesettingsService.findFirst(user?.sub);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.invoicesettingsService.findOne(id);
  }

  @Patch(':id')
  @ApiSuccessResponse(InvoiceSettingsDto)
  async update(
    @Param('id') id: string,
    @Body() updateInvoicesettingDto: UpdateInvoiceSettingsDto,
  ): Promise<SuccessResponseDto<InvoiceSettingsDto>> {
    const setting = await this.invoicesettingsService.update(
      id,
      updateInvoicesettingDto,
    );
    return {
      message: 'Invoice setting updated successfully',
      result: setting,
    };
  }

  @Delete(':id')
  @ApiSuccessResponse()
  async remove(@Param('id') id: string): Promise<SuccessResponseDto> {
    await this.invoicesettingsService.remove(id);
    return {
      message: 'Invoice setting deleted successfully',
    };
  }
}

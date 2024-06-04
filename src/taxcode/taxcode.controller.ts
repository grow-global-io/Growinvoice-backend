import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { TaxcodeService } from './taxcode.service';
import { CreateTaxDto, TaxDto, UpdateTaxDto } from '@shared/models';
import { ApiSuccessResponse } from '@shared/decorators/api-success-response.decorator';
import { SuccessResponseDto } from '@shared/dto/success-response.dto';

@Controller('taxcode')
export class TaxcodeController {
  constructor(private readonly taxcodeService: TaxcodeService) {}

  @Post()
  @ApiSuccessResponse(TaxDto, { status: 201 })
  create(@Body() createTaxcodeDto: CreateTaxDto): SuccessResponseDto<TaxDto> {
    const taxcode = this.taxcodeService.create(createTaxcodeDto);
    return {
      result: taxcode,
      message: 'Tax Code created successfully',
    };
  }

  @Get()
  findAll() {
    return this.taxcodeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.taxcodeService.findOne(id);
  }

  @Patch(':id')
  @ApiSuccessResponse(TaxDto, { status: 201 })
  update(
    @Param('id') id: string,
    @Body() updateTaxcodeDto: UpdateTaxDto,
  ): SuccessResponseDto<TaxDto> {
    const taxcode = this.taxcodeService.update(id, updateTaxcodeDto);
    return {
      result: taxcode,
      message: 'Tax Code updated successfully',
    };
  }

  @Delete(':id')
  @ApiSuccessResponse()
  async remove(@Param('id') id: string): Promise<SuccessResponseDto> {
    await this.taxcodeService.remove(id);
    return {
      message: 'Tax Code deleted successfully',
    };
  }
}

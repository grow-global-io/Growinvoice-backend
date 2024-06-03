import { Controller, Get, Body, Param, Delete, Put } from '@nestjs/common';
import { CompanyService } from './company.service';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { CompanyDto, UpdateCompanyDto } from '@shared/models';
import { ApiSuccessResponse } from '@shared/decorators/api-success-response.decorator';
import { ErrorMessageDto } from '@shared/dto/errorMessage.dto';

@ApiTags('company')
@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.companyService.findOne(id);
  }

  @Put(':id')
  @ApiSuccessResponse(CompanyDto, { status: 201 })
  async update(
    @Param('id') id: string,
    @Body() updateCompanyDto: UpdateCompanyDto,
  ) {
    const companyData = await this.companyService.update(id, updateCompanyDto);
    return { message: 'Company updated successfully', result: companyData };
  }

  @Delete(':id')
  @ApiResponse({
    status: 200,
    type: ErrorMessageDto,
    description: 'Company removed successfully',
  })
  async remove(@Param('id') id: string) {
    await this.companyService.remove(id);
    return { message: 'Company removed successfully' };
  }
}

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { HsncodeService } from './hsncode.service';
import { CreateHSNCodeDto, HSNCodeDto, UpdateHSNCodeDto } from '@shared/models';
import { ApiSuccessResponse } from '@shared/decorators/api-success-response.decorator';
import { SuccessResponseDto } from '@shared/dto/success-response.dto';
import { ApiTags } from '@nestjs/swagger';
import { GetUser, User } from '@shared/decorators/user.decorator';

@ApiTags('hsncode')
@Controller('hsncode')
export class HsncodeController {
  constructor(private readonly hsncodeService: HsncodeService) {}

  @Post()
  @ApiSuccessResponse(HSNCodeDto, { status: 201 })
  async create(
    @Body() createHsncodeDto: CreateHSNCodeDto,
  ): Promise<SuccessResponseDto<HSNCodeDto>> {
    const hsncode = await this.hsncodeService.create(createHsncodeDto);
    return {
      result: hsncode,
      message: 'HSN Code created successfully',
    };
  }

  @Get()
  async findAll(@GetUser() user: User) {
    return await this.hsncodeService.findAll(user?.sub);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.hsncodeService.findOne(id);
  }

  @Put(':id')
  @ApiSuccessResponse(HSNCodeDto, { status: 201 })
  async update(
    @Param('id') id: string,
    @Body() updateHsncodeDto: UpdateHSNCodeDto,
  ): Promise<SuccessResponseDto<HSNCodeDto>> {
    const hsncode = await this.hsncodeService.update(id, updateHsncodeDto);
    return {
      result: hsncode,
      message: 'HSN Code updated successfully',
    };
  }

  @Delete(':id')
  @ApiSuccessResponse()
  async remove(@Param('id') id: string): Promise<SuccessResponseDto> {
    await this.hsncodeService.remove(id);
    return {
      message: 'HSN Code deleted successfully',
    };
  }
}

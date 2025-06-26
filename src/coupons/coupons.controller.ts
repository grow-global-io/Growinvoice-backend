import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CouponsService } from './coupons.service';
import { ApiTags } from '@nestjs/swagger';
import {
  CouponsDto,
  CreateCouponsDto,
  UpdateCouponsDto,
  User,
} from '@shared/models';
import { ApiSuccessResponse } from '@shared/decorators/api-success-response.decorator';
import { SuccessResponseDto } from '@shared/dto/success-response.dto';
import { GetUser } from '@shared/decorators/user.decorator';

@Controller('coupons')
@ApiTags('Coupons')
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @Post()
  @ApiSuccessResponse(CouponsDto)
  async create(
    @Body() createCouponDto: CreateCouponsDto,
    @GetUser() user: User,
  ): Promise<SuccessResponseDto<CouponsDto>> {
    const coupon = await this.couponsService.create(createCouponDto, user);
    return {
      message: 'Coupon created successfully',
      result: coupon,
    };
  }

  @Get()
  findAll() {
    return this.couponsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.couponsService.findOne(id);
  }

  @Patch(':id')
  @ApiSuccessResponse(CouponsDto)
  update(@Param('id') id: string, @Body() updateCouponDto: UpdateCouponsDto) {
    const coupon = this.couponsService.update(id, updateCouponDto);
    return {
      message: 'Coupon updated successfully',
      result: coupon,
    };
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.couponsService.remove(id);
  }
}

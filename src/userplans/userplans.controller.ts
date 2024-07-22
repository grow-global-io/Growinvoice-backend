import { Controller, Post, Body, Patch, Param } from '@nestjs/common';
import { UserplansService } from './userplans.service';
import { CreateUserPlansDto, UserPlansDto } from '@shared/models';
import { UpdateUserPlanCustomDto } from './dto/update-dto-custom.dto';
import { ApiSuccessResponse } from '@shared/decorators/api-success-response.decorator';
import { SuccessResponseDto } from '@shared/dto/success-response.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('userplans')
@Controller('userplans')
export class UserplansController {
  constructor(private readonly userplansService: UserplansService) {}

  @Post()
  @ApiSuccessResponse(UserPlansDto)
  async create(
    @Body() createUserplanDto: CreateUserPlansDto,
  ): Promise<SuccessResponseDto<UserPlansDto>> {
    const userplan = await this.userplansService.create(createUserplanDto);
    return {
      result: userplan,
      message: 'User plan created successfully',
    };
  }

  @Patch(':id')
  @ApiSuccessResponse(UserPlansDto)
  async update(
    @Param('id') id: string,
    @Body() updateUserplanDto: UpdateUserPlanCustomDto,
  ): Promise<SuccessResponseDto<UserPlansDto>> {
    const userplan = await this.userplansService.update(id, updateUserplanDto);
    return {
      result: userplan,
      message: 'User plan updated successfully',
    };
  }
}

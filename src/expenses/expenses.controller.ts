import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { ApiTags } from '@nestjs/swagger';
import {
  CreateExpensesDto,
  ExpensesDto,
  UpdateExpensesDto,
} from '@shared/models';
import { ApiSuccessResponse } from '@shared/decorators/api-success-response.decorator';
import { SuccessResponseDto } from '@shared/dto/success-response.dto';
import { GetUser, User } from '@shared/decorators/user.decorator';

@ApiTags('expenses')
@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  @ApiSuccessResponse(ExpensesDto)
  async create(
    @Body() createExpenseDto: CreateExpensesDto,
  ): Promise<SuccessResponseDto<ExpensesDto>> {
    const expense = await this.expensesService.create(createExpenseDto);
    return {
      result: expense,
      message: 'Expense created successfully',
    };
  }

  @Get()
  async findAll(@GetUser() user: User) {
    return await this.expensesService.findAll(user?.sub);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.expensesService.findOne(id);
  }

  @Patch(':id')
  @ApiSuccessResponse(ExpensesDto)
  async update(
    @Param('id') id: string,
    @Body() updateExpenseDto: UpdateExpensesDto,
  ): Promise<SuccessResponseDto<ExpensesDto>> {
    const expense = await this.expensesService.update(id, updateExpenseDto);
    return {
      result: expense,
      message: 'Expense updated successfully',
    };
  }

  @Delete(':id')
  @ApiSuccessResponse()
  async remove(@Param('id') id: string): Promise<SuccessResponseDto> {
    await this.expensesService.remove(id);
    return {
      message: 'Expense deleted successfully',
    };
  }
}

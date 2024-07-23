import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import {
  CreateExpensesDto,
  ExpensesDto,
  UpdateExpensesDto,
} from '@shared/models';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class ExpensesService {
  constructor(private readonly prismaService: PrismaService) {}
  async create(createExpenseDto: CreateExpensesDto) {
    const expense = await this.prismaService.expenses.create({
      data: createExpenseDto,
    });
    return plainToInstance(ExpensesDto, expense);
  }

  async findAll(user_id: string) {
    const expense = await this.prismaService.expenses.findMany({
      where: {
        user_id,
      },
    });
    return expense.map((e) => plainToInstance(ExpensesDto, e));
  }

  async findOne(id: string) {
    const expense = await this.prismaService.expenses.findUnique({
      where: {
        id,
      },
    });
    return plainToInstance(ExpensesDto, expense);
  }

  async update(id: string, updateExpenseDto: UpdateExpensesDto) {
    const expense = await this.prismaService.expenses.update({
      where: {
        id,
      },
      data: updateExpenseDto,
    });
    return plainToInstance(ExpensesDto, expense);
  }

  async remove(id: string) {
    await this.prismaService.expenses.delete({
      where: {
        id,
      },
    });
    return {
      message: 'Expense deleted successfully',
    };
  }
}

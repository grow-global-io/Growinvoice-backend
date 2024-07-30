import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import {
  ProfitLossCountDto,
  ProfitLostReportsDto,
} from './dto/profit-loss.dto';
import { RangeSelectDto } from './dto/range-select.dto';
import { CustomerWithInvocieDto } from '@/customer/dto/update-customer-with-address.dto';
import { InvoiceProducts } from '@shared/models';

@Injectable()
export class ReportsService {
  constructor(private readonly prismaService: PrismaService) {}

  async getResultsForProfitAndLoss({
    userId,
    start,
    end,
  }: {
    userId: string;
    start: string;
    end: string;
  }) {
    const invoices = await this.prismaService.invoice.findMany({
      where: {
        user_id: userId,
        date: {
          gte: new Date(start),
          lte: new Date(end),
        },
      },
    });

    const expenses = await this.prismaService.expenses.findMany({
      where: {
        user_id: userId,
        expenseDate: {
          gte: new Date(start),
          lte: new Date(end),
        },
      },
    });

    // Calculate total income from invoices
    const totalIncome = invoices.reduce(
      (sum, invoice) => sum + invoice.total,
      0,
    );

    // Calculate total expenses
    const totalExpenses = expenses.reduce(
      (sum, expense) => sum + expense.amount,
      0,
    );

    console.log(totalExpenses);

    // Compute profit or loss
    const profitOrLoss = totalIncome - totalExpenses;

    // Create and return the report object
    return plainToInstance(ProfitLossCountDto, {
      totalIncome,
      totalExpenses,
      profitOrLoss,
    });
  }

  async getProfitLossReports({
    userId,
    start,
    end,
  }: {
    userId: string;
    start: string;
    end: string;
  }) {
    const invoices = await this.prismaService.invoice.findMany({
      where: {
        user_id: userId,
        date: {
          gte: new Date(start),
          lte: new Date(end),
        },
      },
    });

    const expenses = await this.prismaService.expenses.findMany({
      where: {
        user_id: userId,
        expenseDate: {
          gte: new Date(start),
          lte: new Date(end),
        },
      },
    });

    return plainToInstance(ProfitLostReportsDto, {
      invoices,
      expenses,
    });
  }

  async getProfitLossDateRange(userId: string) {
    const invoices = await this.prismaService.invoice.findMany({
      where: {
        user_id: userId,
      },
    });

    const expenses = await this.prismaService.expenses.findMany({
      where: {
        user_id: userId,
      },
    });

    const invoiceDates = invoices.map((invoice) => invoice.date);
    const expenseDates = expenses.map((expense) => expense.expenseDate);

    const allDates = [...invoiceDates, ...expenseDates].sort();

    return plainToInstance(RangeSelectDto, {
      start: new Date(allDates[0]).toISOString(),
      end: new Date(allDates[allDates.length - 1]).toISOString(),
    });
  }

  async getCustomerReports({
    userId,
    start,
    end,
  }: {
    userId: string;
    start: string;
    end: string;
  }) {
    const customers = await this.prismaService.customer.findMany({
      where: {
        user_id: userId,
      },
      include: {
        invoice: {
          where: {
            date: {
              gte: new Date(start),
              lte: new Date(end),
            },
          },
        },
      },
    });

    const customersWithInvoices = customers.filter(
      (customer) => customer.invoice.length > 0,
    );
    return plainToInstance(CustomerWithInvocieDto, customersWithInvoices);
  }

  async getProductReports({
    userId,
    start,
    end,
  }: {
    userId: string;
    start: string;
    end: string;
  }) {
    const invoices = await this.prismaService.invoice.findMany({
      where: {
        user_id: userId,
        date: {
          gte: new Date(start),
          lte: new Date(end),
        },
      },
      include: {
        product: {
          include: {
            product: true,
          },
        }, // Include product relation to get associated products
      },
    });

    // Extract products from invoices and ensure uniqueness
    const productsWithInvoices = new Set();
    invoices.forEach((invoice) => {
      invoice.product.forEach((product) => {
        productsWithInvoices.add(product);
      });
    });

    // Convert Set to Array if needed
    const uniqueProducts = Array.from(productsWithInvoices);

    return plainToInstance(InvoiceProducts, uniqueProducts);
  }
}

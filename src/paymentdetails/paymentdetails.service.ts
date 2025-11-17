import { PrismaService } from '@/prisma/prisma.service';
import { Injectable, Logger } from '@nestjs/common';
import { PaymentType } from '@prisma/client';
import {
  CreatePaymentDetailsDto,
  PaymentDetailsDto,
  UpdatePaymentDetailsDto,
} from '@shared/models';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class PaymentdetailsService {
  private readonly logger = new Logger(PaymentdetailsService.name);

  constructor(private prismaService: PrismaService) {}

  private async retryDatabaseOperation<T>(
    operation: () => Promise<T>,
    maxRetries = 3,
  ): Promise<T> {
    let lastError: any;

    for (let retry = 1; retry <= maxRetries; retry++) {
      try {
        return await operation();
      } catch (error: any) {
        lastError = error;
        const isConnectionError =
          error?.message?.includes('connection') ||
          error?.message?.includes('Connection') ||
          error?.code === 'P1001' ||
          error?.code === 'P1017';

        if (isConnectionError && retry < maxRetries) {
          const delay = Math.min(500 * retry, 2000);
          this.logger.warn(
            `Connection error in paymentdetails, retrying in ${delay}ms (attempt ${retry}/${maxRetries})`,
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }
        throw error;
      }
    }

    throw lastError;
  }

  async create(createPaymentdetailDto: CreatePaymentDetailsDto) {
    return this.retryDatabaseOperation(async () => {
      const paymentdetail = await this.prismaService.paymentDetails.create({
        data: createPaymentdetailDto,
      });
      return plainToInstance(PaymentDetailsDto, paymentdetail);
    });
  }

  async findAll(user_id: string) {
    return this.retryDatabaseOperation(async () => {
      const paymentdetails = await this.prismaService.paymentDetails.findMany({
        where: { user_id },
      });
      return plainToInstance(PaymentDetailsDto, paymentdetails);
    });
  }

  async findOne(id: string) {
    return this.retryDatabaseOperation(async () => {
      const paymentDetails = await this.prismaService.paymentDetails.findUnique(
        {
          where: { id },
        },
      );
      return plainToInstance(PaymentDetailsDto, paymentDetails);
    });
  }

  async update(id: string, updatePaymentdetailDto: UpdatePaymentDetailsDto) {
    return this.retryDatabaseOperation(async () => {
      // Exclude user_id from update data as it's a relation field
      const { user_id, ...updateData } = updatePaymentdetailDto;
      const paymentdetail = await this.prismaService.paymentDetails.update({
        where: { id },
        data: updateData,
      });
      return plainToInstance(PaymentDetailsDto, paymentdetail);
    });
  }

  async remove(id: string) {
    return this.retryDatabaseOperation(async () => {
      return await this.prismaService.paymentDetails.delete({
        where: { id },
      });
    });
  }

  async findByPaymentTypeandUserId(paymentType: PaymentType, user_id: string) {
    return this.retryDatabaseOperation(async () => {
      const paymentDetails = await this.prismaService.paymentDetails.findFirst({
        where: { paymentType, user_id },
      });
      return plainToInstance(PaymentDetailsDto, paymentDetails);
    });
  }
}

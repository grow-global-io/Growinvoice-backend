import { Inject, Injectable } from '@nestjs/common';
import { CreateCustomerWithAddressDto } from './dto/create-customer-with-address.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { plainToInstance } from 'class-transformer';
import { UpdateCustomerWithAddressDto } from './dto/update-customer-with-address.dto';
import { GetCustomerWithAddressDto } from './dto/get-customer-with-address.dto';
import { SharedService } from '@/shared/shared.service';
import { ENHANCED_PRISMA } from '@zenstackhq/server/nestjs';

@Injectable()
export class CustomerService {
  constructor(
    @Inject(ENHANCED_PRISMA) private prismaServie: PrismaService,
    private readonly sharedService: SharedService, // Assuming you have a SharedService for common functionalities
  ) {}

  async create(createCustomerDto: CreateCustomerWithAddressDto) {
    await this.sharedService.checkCustomerQuota(createCustomerDto.user_id);
    const { billingDetails, shippingDetails, ...customerDetails } =
      createCustomerDto;
    return await this.prismaServie.customer.create({
      data: {
        name: customerDetails.name,
        option: customerDetails?.option,
        gstIn: customerDetails.gstIn,
        billingAddress: {
          create: billingDetails,
        },
        shippingAddress: {
          create: shippingDetails,
        },
        display_name: customerDetails.display_name,
        email: customerDetails.email,
        phone: customerDetails.phone,
        website: customerDetails.website,
        currencies: {
          connect: {
            id: customerDetails.currencies_id,
          },
        },
        user: {
          connect: {
            id: customerDetails.user_id,
          },
        },
      },
    });
  }

  async findAll(userId: string) {
    const customers = await this.prismaServie.customer.findMany({
      where: {
        user_id: userId,
      },
      include: {
        _count: {
          select: {
            invoice: true,
          },
        },
        billingAddress: true,
        shippingAddress: true,
      },
    });
    const customerWithDueAmounts = await Promise.all(
      customers.map(async (customer) => {
        const totalDue = await this.prismaServie.invoice.aggregate({
          _sum: {
            due_amount: true,
          },
          where: {
            customer_id: customer.id,
            status: 'DUE', // assuming there's a 'status' field to filter due invoices
          },
        });

        return {
          ...customer,
          totalDue: totalDue._sum.due_amount || 0,
        };
      }),
    );
    return plainToInstance(GetCustomerWithAddressDto, customerWithDueAmounts);
  }

  async findOne(id: string) {
    const customer = await this.prismaServie.customer.findUnique({
      where: {
        id,
      },
      include: {
        billingAddress: true,
        shippingAddress: true,
      },
    });
    return plainToInstance(GetCustomerWithAddressDto, customer);
  }

  async update(id: string, updateCustomerDto: UpdateCustomerWithAddressDto) {
    const { billingDetails, shippingDetails, ...customerDetails } =
      updateCustomerDto;

    return await this.prismaServie.customer.update({
      where: {
        id,
      },
      data: {
        name: customerDetails.name,
        option: customerDetails?.option,
        gstIn: customerDetails.gstIn,
        billingAddress: {
          update: billingDetails,
        },
        shippingAddress: {
          update: shippingDetails,
        },
        display_name: customerDetails.display_name,
        email: customerDetails.email,
        phone: customerDetails.phone,
        website: customerDetails.website,
        currencies: {
          connect: {
            id: customerDetails.currencies_id,
          },
        },
        user: {
          connect: {
            id: customerDetails.user_id,
          },
        },
      },
    });
  }

  async remove(id: string) {
    return await this.prismaServie.customer.delete({
      where: {
        id,
      },
    });
  }

  async customerCount(userId: string) {
    return await this.prismaServie.customer.count({
      where: {
        user_id: userId,
      },
    });
  }
}

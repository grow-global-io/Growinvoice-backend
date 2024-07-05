import { Injectable } from '@nestjs/common';
import { CreateCustomerWithAddressDto } from './dto/create-customer-with-address.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { plainToInstance } from 'class-transformer';
import { UpdateCustomerWithAddressDto } from './dto/update-customer-with-address.dto';
import { GetCustomerWithAddressDto } from './dto/get-customer-with-address.dto';

@Injectable()
export class CustomerService {
  constructor(private prismaServie: PrismaService) {}

  create(createCustomerDto: CreateCustomerWithAddressDto) {
    const { billingDetails, shippingDetails, ...customerDetails } =
      createCustomerDto;
    return this.prismaServie.customer.create({
      data: {
        name: customerDetails.name,
        option: customerDetails?.option,
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
      },
    });
    return plainToInstance(GetCustomerWithAddressDto, customers);
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

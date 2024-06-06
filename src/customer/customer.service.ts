import { Injectable } from '@nestjs/common';
import { UpdateCustomerDto } from '@shared/models';
import { CreateCustomerWithAddressDto } from './dto/create-customer-with-address.dto';
import { PrismaService } from '@/prisma/prisma.service';

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
      },
    });
  }

  findAll() {
    return `This action returns all customer`;
  }

  findOne(id: string) {
    return `This action returns a #${id} customer`;
  }

  update(id: string, updateCustomerDto: UpdateCustomerDto) {
    return `This action updates a #${id} customer`;
  }

  remove(id: string) {
    return `This action removes a #${id} customer`;
  }
}

import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { CreateCustomerWithAddressDto } from './dto/create-customer-with-address.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { plainToInstance } from 'class-transformer';
import { UpdateCustomerWithAddressDto } from './dto/update-customer-with-address.dto';
import {
  BulkCustomerDto,
  Fulfilled,
  GetCustomerWithAddressDto,
  Rejected,
} from './dto/get-customer-with-address.dto';
import { SharedService } from '@/shared/shared.service';
import { ENHANCED_PRISMA } from '@zenstackhq/server/nestjs';
// import admin from 'firebase-admin';
import {
  getStorage,
  getDownloadURL,
  ref,
  deleteObject,
} from '@firebase/storage';
import { CreateBillingAddressDto } from '@shared/models';

@Injectable()
export class CustomerService {
  constructor(
    @Inject(ENHANCED_PRISMA) private prismaServie: PrismaService,
    private readonly sharedService: SharedService, // Assuming you have a SharedService for common functionalities
  ) {}

  async create(createCustomerDto: CreateCustomerWithAddressDto) {
    if (createCustomerDto.email && createCustomerDto.email.trim() !== '') {
      const customerExists = await this.prismaServie.customer.findFirst({
        where: {
          email: createCustomerDto.email,
          user_id: createCustomerDto.user_id,
        },
      });
      if (customerExists) {
        // Return existing customer instead of throwing error to support "Get or Create" flow
        return customerExists;
      }
    }
    await this.sharedService.checkCustomerQuota(createCustomerDto.user_id);
    const { billingDetails, shippingDetails, ...customerDetails } =
      createCustomerDto;

    // Helper function to check if address has meaningful data
    const hasAddressData = (address: CreateBillingAddressDto) => {
      return (
        (address &&
          address.address &&
          address.address.trim() !== '' &&
          address.city &&
          address.city.trim() !== '' &&
          address.country_id &&
          address.country_id.trim() !== '' &&
          address.state_id &&
          address.state_id.trim() !== '' &&
          address.zip &&
          address.zip.trim() !== '') ||
        (address &&
          address.address &&
          address.city &&
          address.country_name &&
          address.country_name.trim() !== '' &&
          address.state_name &&
          address.state_name.trim() !== '' &&
          address.zip &&
          address.zip.trim() !== '')
      );
    };

    // Prepare the customer data
    const customerData: any = {
      name: customerDetails.name,
      option: customerDetails?.option,
      gstIn: customerDetails.gstIn,
      display_name: customerDetails.display_name,
      email: customerDetails.email,
      phone: customerDetails.phone,
      user: {
        connect: {
          id: customerDetails.user_id,
        },
      },
    };

    if (customerDetails.currencies_id) {
      customerData.currencies = {
        connect: {
          id: customerDetails.currencies_id,
        },
      };
    }

    // Only create billing address if it has meaningful data
    if (hasAddressData(billingDetails)) {
      customerData.billingAddress = {
        create: billingDetails,
      };
    }

    // Only create shipping address if it has meaningful data
    if (hasAddressData(shippingDetails)) {
      customerData.shippingAddress = {
        create: shippingDetails,
      };
    }

    return await this.prismaServie.customer.create({
      data: customerData,
    });
  }

  async createBulk(bulkCustomerDto: BulkCustomerDto) {
    const fulfilled: Fulfilled[] = [];
    const rejected: Rejected[] = [];
    const firebaseStoragePath = bulkCustomerDto.firebaseStoragePath;
    const storage = getStorage();
    const fileRef = ref(storage, firebaseStoragePath);
    const fileContent = await getDownloadURL(fileRef);
    const response = await fetch(fileContent);
    const customers: CreateCustomerWithAddressDto[] = await response.json();

    for (const customerDto of customers) {
      try {
        const customer = await this.create(customerDto);
        fulfilled.push({
          email: customer.email,
          uId: customer.id,
        });
      } catch (error) {
        rejected.push({
          email: customerDto.email,
          reason: error.message,
        });
      }
    }
    await deleteObject(fileRef);
    return { fulfilled, rejected };
  }

  async findAll(userId: string) {
    const user = await this.prismaServie.user.findUnique({
      where: { id: userId },
    });
    const customers = await this.prismaServie.customer.findMany({
      where: {
        user_id: user?.isAdmin ? undefined : userId,
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

    // Helper function to check if address has meaningful data
    const hasAddressData = (address: any) => {
      return (
        address &&
        address.address &&
        address.address.trim() !== '' &&
        address.city &&
        address.city.trim() !== '' &&
        address.country_id &&
        address.country_id.trim() !== '' &&
        address.state_id &&
        address.state_id.trim() !== '' &&
        address.zip &&
        address.zip.trim() !== ''
      );
    };

    // First, get the current customer to check if addresses exist
    const currentCustomer = await this.prismaServie.customer.findUnique({
      where: { id },
      include: {
        billingAddress: true,
        shippingAddress: true,
      },
    });

    if (!currentCustomer) {
      throw new BadRequestException('Customer not found');
    }

    // Prepare the customer data
    const customerData: any = {
      name: customerDetails.name,
      option: customerDetails?.option,
      gstIn: customerDetails.gstIn,
      display_name: customerDetails.display_name,
      email: customerDetails.email,
      phone: customerDetails.phone,
      user: {
        connect: {
          id: customerDetails.user_id,
        },
      },
    };

    if (customerDetails.currencies_id) {
      customerData.currencies = {
        connect: {
          id: customerDetails.currencies_id,
        },
      };
    }

    // Handle billing address
    if (hasAddressData(billingDetails)) {
      if (currentCustomer.billingAddress) {
        // Update existing billing address
        customerData.billingAddress = {
          update: billingDetails,
        };
      } else {
        // Create new billing address
        customerData.billingAddress = {
          create: billingDetails,
        };
      }
    }

    // Handle shipping address
    if (hasAddressData(shippingDetails)) {
      if (currentCustomer.shippingAddress) {
        // Update existing shipping address
        customerData.shippingAddress = {
          update: shippingDetails,
        };
      } else {
        // Create new shipping address
        customerData.shippingAddress = {
          create: shippingDetails,
        };
      }
    }

    return await this.prismaServie.customer.update({
      where: {
        id,
      },
      data: customerData,
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
    const user = await this.prismaServie.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (!user) {
      throw new BadRequestException('User not found');
    }
    return await this.prismaServie.customer.count({
      where: {
        user_id: user?.isAdmin ? undefined : userId,
      },
    });
  }
}

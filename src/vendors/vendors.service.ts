import { Injectable } from '@nestjs/common';
import {
  CreateVendorsWithAddressDto,
  GetVendorsWithAddressDto,
} from './dto/create-vendor-with-address.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { VendorsDto } from '@shared/models';
import { plainToInstance } from 'class-transformer';
import { UpdateVendorsWithAddressDto } from './dto/update-vendor-with-address.dto';

@Injectable()
export class VendorsService {
  constructor(private prismaService: PrismaService) {}
  async create(createVendorDto: CreateVendorsWithAddressDto) {
    const vendor = await this.prismaService.vendors.create({
      data: {
        display_name: createVendorDto.display_name,
        email: createVendorDto.email,
        name: createVendorDto.name,
        phone: createVendorDto.phone,
        user: {
          connect: {
            id: createVendorDto.user_id,
          },
        },
        website: createVendorDto.website,
        billingAddress: {
          create: createVendorDto.billingAddress,
        },
      },
    });
    return plainToInstance(VendorsDto, vendor);
  }

  async findAll(user_id: string) {
    const vendors = await this.prismaService.vendors.findMany({
      where: {
        user_id,
      },
    });
    return plainToInstance(VendorsDto, vendors);
  }

  async findOne(id: string) {
    const vendor = await this.prismaService.vendors.findUnique({
      where: {
        id,
      },
      include: {
        billingAddress: true,
      },
    });
    return plainToInstance(GetVendorsWithAddressDto, vendor);
  }

  async update(id: string, updateVendorDto: UpdateVendorsWithAddressDto) {
    const vendor = await this.prismaService.vendors.update({
      where: {
        id,
      },
      data: {
        display_name: updateVendorDto.display_name,
        email: updateVendorDto.email,
        name: updateVendorDto.name,
        phone: updateVendorDto.phone,
        website: updateVendorDto.website,
        billingAddress: {
          update: updateVendorDto.billingAddress,
        },
      },
    });
    return plainToInstance(VendorsDto, vendor);
  }

  async remove(id: string) {
    const vendor = await this.prismaService.vendors.delete({
      where: {
        id,
      },
    });
    return plainToInstance(VendorsDto, vendor);
  }
}

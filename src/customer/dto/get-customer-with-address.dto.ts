import { ApiProperty } from '@nestjs/swagger';
import {
  BillingAddressDto,
  CustomerDto,
  ShippingAddressDto,
} from '@shared/models';
import { Type } from 'class-transformer';
import { IsArray } from 'class-validator';

export class CountInvoiceDto {
  @ApiProperty({
    type: 'number',
    required: false,
  })
  invoice?: number;
}

export class CountTotalDueDto {
  @ApiProperty({
    type: 'number',
    required: false,
  })
  totalDue?: number;
}

export class GetCustomerWithAddressDto extends CustomerDto {
  @Type(() => BillingAddressDto)
  billingAddress?: BillingAddressDto;

  @Type(() => ShippingAddressDto)
  shippingAddress?: ShippingAddressDto;

  @Type(() => CountInvoiceDto)
  _count?: CountInvoiceDto;

  @Type(() => CountTotalDueDto)
  totalDue?: CountTotalDueDto;
}

export class Fulfilled {
  email: string;
  uId: string;
}

export class Rejected {
  email: string;
  reason: string;
}

export class BulkCustomerDto {
  firebaseStoragePath: string;
}

export class ResBulkCustomerDto {
  @IsArray()
  @Type(() => Fulfilled)
  fulfilled: Fulfilled[];

  @IsArray()
  @Type(() => Rejected)
  rejected: Rejected[];
}

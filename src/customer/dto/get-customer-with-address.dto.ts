import {
  BillingAddressDto,
  CustomerDto,
  ShippingAddressDto,
} from '@shared/models';
import { Type } from 'class-transformer';

export class GetCustomerWithAddressDto extends CustomerDto {
  @Type(() => BillingAddressDto)
  billingDetails?: BillingAddressDto;

  @Type(() => ShippingAddressDto)
  shippingDetails?: ShippingAddressDto;
}

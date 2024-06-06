import { OmitType } from '@nestjs/swagger';
import {
  CreateBillingAddressDto,
  CreateCustomerDto,
  CreateShippingAddressDto,
} from '@shared/models';
import { Type } from 'class-transformer';

export class CreateCustomerWithAddressDto extends OmitType(CreateCustomerDto, [
  'billingAddress_id',
  'shippingAddress_id',
] as const) {
  @Type(() => CreateBillingAddressDto)
  billingDetails?: CreateBillingAddressDto;

  @Type(() => CreateShippingAddressDto)
  shippingDetails?: CreateShippingAddressDto;
}

import { OmitType } from '@nestjs/swagger';
import {
  InvoiceDto,
  UpdateBillingAddressDto,
  UpdateCustomerDto,
  UpdateShippingAddressDto,
} from '@shared/models';
import { Type } from 'class-transformer';

export class UpdateCustomerWithAddressDto extends OmitType(UpdateCustomerDto, [
  'billingAddress_id',
  'shippingAddress_id',
] as const) {
  @Type(() => UpdateBillingAddressDto)
  billingDetails?: UpdateBillingAddressDto;

  @Type(() => UpdateShippingAddressDto)
  shippingDetails?: UpdateShippingAddressDto;
}

export class CustomerWithInvocieDto {
  @Type(() => InvoiceDto)
  invoice: InvoiceDto[];
}

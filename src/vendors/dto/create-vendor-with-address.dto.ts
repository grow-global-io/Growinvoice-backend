import { OmitType } from '@nestjs/swagger';
import {
  CreateVendorsBillingAddressDto,
  CreateVendorsDto,
} from '@shared/models';
import { Type } from 'class-transformer';

export class CreateVendorsWithAddressDto extends OmitType(CreateVendorsDto, [
  'billingAddress_id',
] as const) {
  @Type(() => CreateVendorsBillingAddressDto)
  billingAddress?: CreateVendorsBillingAddressDto;
}

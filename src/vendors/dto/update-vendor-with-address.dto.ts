import { OmitType } from '@nestjs/swagger';
import {
  UpdateVendorsBillingAddressDto,
  UpdateVendorsDto,
} from '@shared/models';
import { Type } from 'class-transformer';

export class UpdateVendorsWithAddressDto extends OmitType(UpdateVendorsDto, [
  'billingAddress_id',
] as const) {
  @Type(() => UpdateVendorsBillingAddressDto)
  billingAddress?: UpdateVendorsBillingAddressDto;
}

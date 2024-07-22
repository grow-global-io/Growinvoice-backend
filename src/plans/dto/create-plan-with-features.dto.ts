import { OmitType } from '@nestjs/swagger';
import { CreatePlanFeaturesDto, CreatePlansDto } from '@shared/models';
import { Type } from 'class-transformer';

class OmitCreatePlanFeatureDto extends OmitType(CreatePlanFeaturesDto, [
  'plan_id',
] as const) {}

export class CreatePlanWithFeaturesDto extends CreatePlansDto {
  @Type(() => OmitCreatePlanFeatureDto)
  features: OmitCreatePlanFeatureDto[];
}

export class UpdatePlanWithFeaturesDto extends CreatePlansDto {
  @Type(() => OmitCreatePlanFeatureDto)
  features: OmitCreatePlanFeatureDto[];
}

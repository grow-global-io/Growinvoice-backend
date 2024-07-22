import { PlanFeaturesDto, PlansDto } from '@shared/models';
import { Type } from 'class-transformer';

export class PlanWithFeaturesDto extends PlansDto {
  @Type(() => PlanFeaturesDto)
  PlanFeatures: PlanFeaturesDto[];
}

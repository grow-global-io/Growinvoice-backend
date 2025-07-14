import { PlanFeaturesDto, Plans } from '@shared/models';
import { Type } from 'class-transformer';

export class PlanWithFeaturesDto extends Plans {
  @Type(() => PlanFeaturesDto)
  PlanFeatures: PlanFeaturesDto[];
}

import { Company, User, UserPlans } from '@shared/models';
import { IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class UserWithCompanyDto extends User {
  @IsOptional()
  @Type(() => Company)
  company?: Company[];

  @IsOptional()
  @Type(() => UserPlans)
  UserPlans?: UserPlans[];
}

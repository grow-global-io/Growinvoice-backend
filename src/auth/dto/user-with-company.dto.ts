import { CompanyDto, User, UserPlansDto } from '@shared/models';
import { IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class UserWithCompanyDto extends User {
  @IsOptional()
  @Type(() => CompanyDto)
  company?: CompanyDto[];

  @IsOptional()
  @Type(() => UserPlansDto)
  UserPlans?: UserPlansDto[];
}

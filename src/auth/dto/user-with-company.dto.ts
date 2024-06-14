import { CompanyDto, User } from '@shared/models';
import { IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class UserWithCompanyDto extends User {
  @IsOptional()
  @Type(() => CompanyDto)
  company?: CompanyDto[];
}

import { CompanyDto, User } from '@shared/models';
import { IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class userWithCompanyDto extends User {
  @IsOptional()
  @Type(() => CompanyDto)
  company?: CompanyDto;
}

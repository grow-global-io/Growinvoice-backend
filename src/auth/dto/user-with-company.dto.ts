import { CompanyDto, UserDto } from '@shared/models';
import { IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class UserWithCompanyDto extends UserDto {
  @IsOptional()
  @Type(() => CompanyDto)
  company?: CompanyDto[];
}

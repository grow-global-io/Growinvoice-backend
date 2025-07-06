import { Company, User, UserPlans } from '@shared/models';
import { Type } from 'class-transformer';

export class AdminUsersListDto extends User {
  @Type(() => Company)
  company: Company[];

  @Type(() => UserPlans)
  UserPlans: UserPlans[];
}

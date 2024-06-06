import { Injectable, Logger } from '@nestjs/common';
// import { Cron } from '@nestjs/schedule';

@Injectable()
export class TaskserviceService {
  private readonly logger = new Logger(TaskserviceService.name);

  // @Cron('* 25 * * * *')
  // handleCron() {
  //   this.logger.debug('Called when the current second is 45');
  // }

  // @Cron('* 45 * * * *')
  // handleCron1() {
  //   this.logger.debug('Called when the current second is 45');
  // }
}

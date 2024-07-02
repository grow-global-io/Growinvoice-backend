import { Type } from 'class-transformer';

export class ChatHistoryDto {
  @Type(() => HistoryDto)
  history: HistoryDto[];
}

export class HistoryDto {
  role: string;
  @Type(() => PartsDto)
  parts: PartsDto[];
}

export class PartsDto {
  text: string;
}

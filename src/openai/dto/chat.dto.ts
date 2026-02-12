import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ChatMessageDto {
  @ApiProperty({ example: 'user' })
  @IsString()
  role: string;

  @ApiProperty({ example: 'Hello' })
  @IsString()
  content: string;
}

export class ChatDto {
  @ApiProperty({
    type: [ChatMessageDto],
    example: [
      { role: 'user', content: 'Hello' },
      { role: 'assistant', content: 'Hi!' },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChatMessageDto)
  messages: ChatMessageDto[];

  @ApiPropertyOptional({
    description:
      'Base64 strings (no data URL prefix) for images the AI can see',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imageBase64?: string[];
}

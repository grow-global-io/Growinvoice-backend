import { Controller, Post, Body, Param, Get } from '@nestjs/common';
import { OpenaiService } from './openai.service';
import { RequestBodyOpenaiDto } from './dto/request-body-openai.dto';
import { ChatDto } from './dto/chat.dto';
import { ExtractInvoiceDto } from './dto/extract-invoice.dto';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetUser, User } from '@shared/decorators/user.decorator';

@ApiTags('openai')
@Controller('openai')
export class OpenaiController {
  constructor(private readonly openaiService: OpenaiService) {}

  @Post('chat')
  @ApiResponse({
    status: 200,
    description: 'Chat with AI (text + optional images). Returns model reply.',
    schema: {
      type: 'object',
      properties: { content: { type: 'string' } },
    },
  })
  async chat(@Body() chatDto: ChatDto) {
    return this.openaiService.chat(
      chatDto.messages.map((m) => ({ role: m.role, content: m.content })),
      chatDto.imageBase64,
    );
  }

  @Post('extract-invoice')
  @ApiResponse({
    status: 200,
    description:
      'Extract invoice/receipt data from images for pre-filling forms.',
    schema: {
      type: 'object',
      properties: {
        customer: { type: 'object' },
        invoice_number: { type: 'string' },
        date: { type: 'string' },
        due_date: { type: 'string' },
        line_items: {
          type: 'array',
          items: { type: 'object' },
        },
        subtotal: { type: 'number' },
        total: { type: 'number' },
        tax_amount: { type: 'number' },
        currency_code: { type: 'string' },
        notes: { type: 'string' },
      },
    },
  })
  async extractInvoice(@Body() extractDto: ExtractInvoiceDto) {
    return this.openaiService.extractInvoice(extractDto.imageBase64);
  }

  @Post()
  // ApiResponse Any
  @ApiResponse({
    status: 200,
    description: 'Create a new openai',
    schema: {
      type: 'array',
      items: {
        type: 'object',
      },
    },
  })
  async create(
    @Body() createOpenaiDto: RequestBodyOpenaiDto,
    @GetUser() user: User,
  ) {
    return await this.openaiService.create(createOpenaiDto, user?.sub);
  }

  @Post('graph')
  // ApiResponse Any
  @ApiResponse({
    status: 200,
    description: 'Create a new openai',
    schema: {
      type: 'array',
      items: {
        type: 'object',
      },
    },
  })
  async createGraph(
    @Body() createOpenaiDto: RequestBodyOpenaiDto,
    @GetUser() user: User,
  ) {
    return await this.openaiService.createGraph(createOpenaiDto, user?.sub);
  }

  @Get('dashboardDataGet/:id')
  async dashboardDataGet(@Param('id') id: string) {
    return await this.openaiService.getChatWithOpenAIForDashboard(id);
  }
}

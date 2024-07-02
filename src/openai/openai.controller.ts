import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { OpenaiService } from './openai.service';
import { RequestBodyOpenaiDto } from './dto/request-body-openai.dto';
import { ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetUser, User } from '@shared/decorators/user.decorator';

@ApiTags('openai')
@Controller('openai')
export class OpenaiController {
  constructor(private readonly openaiService: OpenaiService) {}

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

  @ApiQuery({ name: 'q', required: false })
  @Get('suggestions')
  async suggestions(@GetUser() user: User, @Query('q') searchTerm?: string) {
    return await this.openaiService.suggestions(searchTerm, user?.sub);
  }

  @Post('chat')
  async chat(
    @GetUser() user: User,
    @Body() chatHistoryDto: RequestBodyOpenaiDto[],
  ) {
    return await this.openaiService.getChatWithOpenAI(
      user?.sub,
      chatHistoryDto,
    );
  }
}

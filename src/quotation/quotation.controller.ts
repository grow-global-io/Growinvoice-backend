import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  Query,
} from '@nestjs/common';
import { QuotationService } from './quotation.service';
import { ApiExtraModels, ApiResponse, ApiTags } from '@nestjs/swagger';
import { QuotationDto } from '@shared/models';
import { ApiSuccessResponse } from '@shared/decorators/api-success-response.decorator';
import {
  CreateQuotationWithProducts,
  UpdateQuotationWithProducts,
} from './dto/create-quotation-with-products.dto';
import { SuccessResponseDto } from '@shared/dto/success-response.dto';
import { GetUser, User } from '@shared/decorators/user.decorator';
import { Response } from 'express';
import { convertLogoToBase64 } from '@shared/utils/constants';
import { IsPublic } from '@shared/decorators/public.decorator';
import { SendMailDto } from '@/mail/dto/send-mail.dto';
import { MailService } from '@/mail/mail.service';

@ApiExtraModels(QuotationDto)
@ApiTags('quotation')
@Controller('quotation')
export class QuotationController {
  constructor(
    private readonly quotationService: QuotationService,
    private readonly mailService: MailService,
  ) {}

  @Post()
  @ApiSuccessResponse(QuotationDto, { status: 201 })
  async create(
    @Body() createQuotationDto: CreateQuotationWithProducts,
  ): Promise<SuccessResponseDto<QuotationDto>> {
    const quotation = await this.quotationService.create(createQuotationDto);
    return {
      message: 'Quotation created successfully',
      result: quotation,
    };
  }

  @Get('countTotal')
  async countTotal(@GetUser() user: User) {
    return await this.quotationService.countTotal(user?.sub);
  }

  @Get()
  async findAll(@GetUser() user: User) {
    return await this.quotationService.findAll(user?.sub);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.quotationService.findOne(id);
  }

  @Patch(':id')
  @ApiSuccessResponse(QuotationDto, { status: 200 })
  async update(
    @Param('id') id: string,
    @Body() updateQuotationDto: UpdateQuotationWithProducts,
  ): Promise<SuccessResponseDto<QuotationDto>> {
    const quotation = await this.quotationService.update(
      id,
      updateQuotationDto,
    );
    return {
      message: 'Quotation updated successfully',
      result: quotation,
    };
  }

  @Delete(':id')
  @ApiSuccessResponse()
  async remove(@Param('id') id: string) {
    await this.quotationService.remove(id);
    return {
      message: 'Quotation deleted successfully',
    };
  }

  @IsPublic()
  @Get('test/:id')
  @ApiResponse({ status: 200, type: String })
  async test(@Param('id') id: string, @Res() res?: Response) {
    const quotation = await this.quotationService.findQuotationTest(id);
    const a = quotation;
    if (!quotation) {
      return res.status(404).json({
        message: 'Quotation not found',
      });
    }
    a.user.company[0].logo = await convertLogoToBase64(a.user.company[0].logo);
    const quotationSettingsWithFormat =
      await this.quotationService.quotationSettingsWithFormat(a);
    const templateName = quotation?.template?.view ?? 'template1';
    return res.render('quotation/' + templateName, quotationSettingsWithFormat);
  }

  @IsPublic()
  @Get('quotationPublicFindOne/:id')
  async quotationPublicFindOne(@Param('id') id: string) {
    return await this.quotationService.findOne(id);
  }

  @Post('quotationSentToMail')
  @ApiSuccessResponse(QuotationDto, { status: 200 })
  async invoiceSentToMail(
    @Body() createInvoiceDto: SendMailDto,
    @Query('id') id: string,
  ): Promise<SuccessResponseDto<QuotationDto>> {
    const quotation = await this.quotationService.statusToMailed(id);
    await this.mailService.sendMail(createInvoiceDto);
    return {
      message: 'Quotation created and sent to mail successfully',
      result: quotation,
    };
  }

  @Post('markedAsRejected')
  @ApiSuccessResponse(QuotationDto, { status: 200 })
  async markedAsRejected(
    @Query('id') id: string,
  ): Promise<SuccessResponseDto<QuotationDto>> {
    const invoice = await this.quotationService.statusToRejected(id);
    return {
      message: 'Quotation marked as rejected successfully',
      result: invoice,
    };
  }

  @Post('markedAsAccepted')
  @ApiSuccessResponse(QuotationDto, { status: 200 })
  async markedAsAccepted(
    @Query('id') id: string,
  ): Promise<SuccessResponseDto<QuotationDto>> {
    const invoice = await this.quotationService.statusToAccepted(id);
    return {
      message: 'Quotation marked as accepted successfully',
      result: invoice,
    };
  }

  @Post('markedAsMailed')
  @ApiSuccessResponse(QuotationDto, { status: 200 })
  async markedAsMailed(
    @Query('id') id: string,
  ): Promise<SuccessResponseDto<QuotationDto>> {
    const invoice = await this.quotationService.statusToMailed(id);
    return {
      message: 'Quotation marked as mailed successfully',
      result: invoice,
    };
  }

  @Post('convertToInvoice')
  @ApiSuccessResponse(QuotationDto, { status: 200 })
  async convertToInvoice(
    @Query('id') id: string,
  ): Promise<SuccessResponseDto<QuotationDto>> {
    const invoice = await this.quotationService.convertToInvoice(id);
    return {
      message: 'Quotation converted to invoice successfully',
      result: invoice,
    };
  }

  @IsPublic()
  @Post('quotationPreviewFromBody')
  @ApiResponse({ status: 200, type: String })
  async quotationPreviewFromBody(
    @Body() createQuotationDto: CreateQuotationWithProducts,
    @Res() res?: Response,
  ) {
    const quotation =
      await this.quotationService.createQuotationPreview(createQuotationDto);
    const quotationSettings =
      await this.quotationService?.quotationSettingsWithFormat(quotation);
    return res.render(
      'quotation/' + quotation?.template?.view ?? 'template1',
      quotationSettings,
    );
  }
}

import { supplier } from './../../../shared/oranization/organizationType';
import { AppResponse } from 'src/shared/helpers/appresponse';
import { OrganizationRepository } from 'src/services/organization/organizationService';
import { InvoiceRepository } from './../../../services/invoice/invoice';
import { Invoice } from './../../../entities/invoice.entity';
import {
  CreateInvoiceDto,
  CreateManyInvoiceDto,
} from './../../../dto/invoice/create-invoice.dto';
import { ApiConsumes, ApiTags } from '@nestjs/swagger/dist/decorators';
import {
  BadGatewayException,
  Body,
  Controller,
  Get,
  Post,
  Request,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/modules/identity/auth/jwtauth.guard';
import { AnyFilesInterceptor } from '@nestjs/platform-express/multer/interceptors/any-files.interceptor';

@UseGuards(JwtAuthGuard)
@ApiTags('invoice')
@Controller('invoice')
export class InvoiceController {
  constructor(
    private invoiceRepo: InvoiceRepository,
    private orgRepo: OrganizationRepository,
  ) {}

  @Post()
  async create(@Body() createInvoices: CreateManyInvoiceDto) {
    const invoices = [] as Invoice[];
    const createdByOrg = await this.orgRepo.findOne({
      where: { id: createInvoices.createdByOrgId },
    });
    if (!createdByOrg)
      throw new BadGatewayException(
        AppResponse.badRequest('the organization (created by) cannot be found'),
      );

    const supplierOrg = await this.orgRepo.findOne({
      where: { id: createInvoices.supplierId },
    });
    if (!createdByOrg)
      throw new BadGatewayException(
        AppResponse.badRequest('the supplier organization  is cannot be found'),
      );

    createInvoices.invoices.forEach(item => {
      const invoice = item as Invoice;
      invoice.createdByOrganization = createdByOrg;
      invoice.createdForOrganization = supplierOrg;
      invoices.push(invoice);
    });

    await this.invoiceRepo.save(invoices);
    return AppResponse.OkSuccess(createInvoices);
  }

  @Post('upload')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(AnyFilesInterceptor())
  uploadFile(@UploadedFiles() files, @Request() req) {
    console.log(files as File);
    return req.user;
  }
}

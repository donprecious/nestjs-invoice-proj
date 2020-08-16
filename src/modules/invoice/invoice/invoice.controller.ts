import { InvoicePermissions } from './../../../shared/app/permissionsType';
import { supplier } from './../../../shared/oranization/organizationType';
import {
  PaginationQueryParam,
  PaginatedResultDto,
} from './../../../shared/dto/pagination.dto';
import { In } from 'typeorm/find-options/operator/In';
import { Organization } from 'src/entities/organization.entity';
import { invoiceExcelSchema } from './../invoiceExcelSchema';

import { AppResponse } from 'src/shared/helpers/appresponse';
import { OrganizationRepository } from 'src/services/organization/organizationService';
import { InvoiceRepository } from './../../../services/invoice/invoice';
import { Invoice } from './../../../entities/invoice.entity';
import readXlsxFile = require('read-excel-file/node');
import * as _ from 'lodash';
import {
  paginate,
  Pagination,
  IPaginationOptions,
} from 'nestjs-typeorm-paginate';

import {
  CreateInvoiceDto,
  CreateManyInvoiceBySupplierDto,
  CreateManyInvoiceDto,
  InvoiceFilter,
} from './../../../dto/invoice/create-invoice.dto';
import {
  ApiConsumes,
  ApiHeader,
  ApiTags,
} from '@nestjs/swagger/dist/decorators';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Request,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/modules/identity/auth/jwtauth.guard';
import { AnyFilesInterceptor } from '@nestjs/platform-express/multer/interceptors/any-files.interceptor';
import { Any, FindConditions, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { AppService } from 'src/services/app/app.service';
import { EmailService } from 'src/services/notification/email/email.service';
import { ConfigService } from '@nestjs/config';
import moment = require('moment');

import { AllowPermissions } from 'src/shared/guards/permission.decorator';
import { RolePermissionGuard } from 'src/shared/guards/role-permission.guard';

@UseGuards(JwtAuthGuard, RolePermissionGuard)
@ApiTags('invoice')
@Controller('invoice')
export class InvoiceController {
  constructor(
    private invoiceRepo: InvoiceRepository,
    private orgRepo: OrganizationRepository,
    private appService: AppService,
  ) {}

  @ApiHeader({
    name: 'organizationId',
    description: 'provide organization id',
  })
  @Post()
  @AllowPermissions(InvoicePermissions.create)
  async create(@Body() createInvoices: CreateManyInvoiceDto, @Request() req) {
    const organization = await this.appService.getOrganization();

    const orgnizationId = organization.id;

    // validate invoices
    const invoiceNos = createInvoices.invoices.map(a => a.invoiceNumber);
    const uniqueInvoiceNo = _.uniq(invoiceNos);
    const duplicateInvoice = _.filter(invoiceNos, (val, i, iteratee) =>
      _.includes(iteratee, val, Number(i) + 1),
    );

    if (duplicateInvoice.length > 0) {
      throw new BadRequestException(
        AppResponse.badRequest(
          'duplicate invoiceNo found [] ' + duplicateInvoice,
        ),
      );
    }

    // validate unique inovice
    //
    const uniqueOrgInvoice = await this.invoiceRepo.find({
      where: {
        invoiceNumber: In(uniqueInvoiceNo),
        createdByOrganization: organization,
      },
    });
    const existedInvoiceNo = uniqueOrgInvoice.map(a => a.invoiceNumber);

    const duplicateExistingCode = _.intersection(
      uniqueInvoiceNo,
      existedInvoiceNo,
    );
    if (duplicateExistingCode.length > 0) {
      // the fellowing existing code already exist
      throw new BadRequestException(
        AppResponse.badRequest(
          'the following invoice number already exist,invoice number/s ' +
            duplicateExistingCode,
        ),
      );
    }

    const uniqueCodes = _.uniq(
      createInvoices.invoices.map(a => a.supplierCode),
    );

    const uniqueOrganizations = await this.orgRepo.find({
      where: { code: In(uniqueCodes), parentId: organization.id },
    });
    const uniqueOrgCodes = uniqueOrganizations.map(a => a.code);
    const notfoundCodes = _.difference(uniqueCodes, uniqueOrgCodes);

    if (notfoundCodes.length > 0) {
      throw new BadRequestException(
        AppResponse.badRequest(
          'the following organization code was not found [] ' + notfoundCodes,
        ),
      );
    }

    const invoices = [] as Invoice[];

    for (const row of createInvoices.invoices) {
      const invoice = {
        amount: row.amount,
        invoiceNumber: row.invoiceNumber,
        currencyCode: row.currencyCode,
        dueDate: row.dueDate,
        createdByOrganization: organization,
        createdForOrganization: uniqueOrganizations.find(
          a => a.code == row.supplierCode,
        ),
      } as Invoice;
      invoices.push(invoice);
    }
    this.invoiceRepo.save(invoices);

    return AppResponse.OkSuccess(createInvoices);
  }

  @AllowPermissions(InvoicePermissions.create)
  @Post('upload/:organizationId')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(AnyFilesInterceptor())
  async uploadFile(
    @UploadedFiles() files,
    @Request() req,
    @Param('organizationId') organizationId: string,
  ) {
    if (!files || files.length <= 0) {
      throw new BadRequestException(AppResponse.badRequest('no files found'));
    }

    const organization = await this.orgRepo.findOne({
      where: { id: organizationId },
    });
    if (!organization)
      throw new BadRequestException(
        AppResponse.badRequest('organization not found'),
      );

    // const supplierOrg = await this.orgRepo.findOne({
    //   where: { id: supplierId },
    // });

    // if (!supplierOrg)
    //   throw new BadRequestException(
    //     AppResponse.badRequest('the supplier organization  is cannot be found'),
    //   );

    console.log(files);
    const file = files[0];

    const buffer = file.path;

    const result = await readXlsxFile(buffer, { schema: invoiceExcelSchema });

    const errors = result.errors;
    if (errors && errors.length > 0) {
      throw new BadRequestException(AppResponse.badRequest(errors));
    }

    // validate invoices
    const invoiceNos = result.rows.map(a => a.invoiceNo);
    const uniqueInvoiceNo = _.uniq(
      result.rows.map(a => a.invoiceNo.toString()),
    );
    const duplicateInvoice = _.filter(invoiceNos, (val, i, iteratee) =>
      _.includes(iteratee, val, Number(i) + 1),
    );

    if (duplicateInvoice.length > 0) {
      throw new BadRequestException(
        AppResponse.badRequest(
          'duplicate invoiceNo found [] ' + duplicateInvoice,
        ),
      );
    }

    // validate unique inovice
    //
    const uniqueOrgInvoice = await this.invoiceRepo.find({
      where: {
        invoiceNumber: In(uniqueInvoiceNo),
        createdByOrganization: organization,
      },
    });
    const existedInvoiceNo = uniqueOrgInvoice.map(a => a.invoiceNumber);

    const duplicateExistingCode = _.intersection(
      uniqueInvoiceNo,
      existedInvoiceNo,
    );
    if (duplicateExistingCode.length > 0) {
      // the fellowing existing code already exist
      throw new BadRequestException(
        AppResponse.badRequest(
          'the following invoice number already exist,invoice number/s ' +
            duplicateExistingCode,
        ),
      );
    }
    ///
    //validate unique supplier codes
    const uniqueCodes = _.uniq(result.rows.map(a => a.supplierCode));

    const uniqueOrganizations = await this.orgRepo.find({
      where: { code: In(uniqueCodes), parentId: organization.id },
    });
    const uniqueOrgCodes = uniqueOrganizations.map(a => a.code);
    const notfoundCodes = _.difference(uniqueCodes, uniqueOrgCodes);

    if (notfoundCodes.length > 0) {
      throw new BadRequestException(
        AppResponse.badRequest(
          'the following organization code was not found [] ' + notfoundCodes,
        ),
      );
    }
    const invoices: Invoice[] = [];

    for (const row of result.rows) {
      const invoice = {
        amount: row.amount,
        invoiceNumber: row.invoiceNo,
        currencyCode: row.currencyCode,
        dueDate: row.dueDate,
        createdByOrganization: organization,
        createdForOrganization: uniqueOrganizations.find(
          a => a.code == row.supplierCode,
        ),
      } as Invoice;
      invoices.push(invoice);
    }
    this.invoiceRepo.save(invoices);

    return AppResponse.OkSuccess(invoices);
  }

  @AllowPermissions(InvoicePermissions.view, InvoicePermissions.list)
  @ApiHeader({
    name: 'organizationId',
    description: 'provide organization id',
  })
  @Get('supplier')
  async GetInvoiceForSupplier(@Query() param: PaginationQueryParam) {
    const organization = await this.appService.getOrganization();
    console.log('param', param);
    // const invoices = await paginate(
    //   this.invoiceRepo,
    //   { page: param.page, limit: param.limit, route: '/invoice/supplier' },
    //   { createdByOrganization: organization },
    // );
    const skippedItems = (param.page - 1) * param.limit;
    const result = await this.invoiceRepo.findAndCount({
      where: { createdByOrganization: organization },
      relations: ['createdByOrganization', 'createdForOrganization'],
      skip: skippedItems,
      take: param.limit,
    });
    const pageRes: PaginatedResultDto = {
      data: result[0],
      limit: param.limit,
      page: param.page,
      totalCount: result[1],
    };

    return AppResponse.OkSuccess(pageRes);
  }

  @AllowPermissions(InvoicePermissions.view, InvoicePermissions.list)
  @Get('buyer')
  async GetInvoiceForBuyer(@Query() param: PaginationQueryParam) {
    const organization = await this.appService.getOrganization();

    const skippedItems = (param.page - 1) * param.limit;
    const result = await this.invoiceRepo.findAndCount({
      where: { createdForOrganization: organization },
      relations: ['createdByOrganization', 'createdForOrganization'],
      skip: skippedItems,
      take: param.limit,
    });
    const pageRes: PaginatedResultDto = {
      data: result[0],
      limit: param.limit,
      page: param.page,
      totalCount: result[1],
    };
    return AppResponse.OkSuccess(pageRes);
  }

  @AllowPermissions(InvoicePermissions.list)
  @Get()
  async GetAllInvoice(
    @Query() param: PaginationQueryParam,
    @Query() filter: InvoiceFilter,
  ) {
    console.log('param', param);
    const skippedItems = (param.page - 1) * param.limit;
    const where: FindConditions<Invoice> = {};
    if (filter.amount) {
      where.amount = filter.amount;
    }
    if (filter.invoiceNumber) {
      where.invoiceNumber = filter.invoiceNumber;
    }
    if (filter.supplierCode) {
      const supplier = await this.orgRepo.findOne({
        where: { code: filter.supplierCode },
      });
      if (supplier) {
        where.createdForOrganization = supplier;
      }
      // where.createdForOrganization = { code: filter.supplierCode };
    }

    if (filter.fromDueDate && filter.toDueDate) {
      const isAfter = moment(filter.fromDueDate).isAfter(filter.toDueDate);
      if (isAfter) {
        throw new BadRequestException(
          AppResponse.badRequest(
            'toDuedate value should exceed fromDueDate value',
          ),
        );
      }
    }

    if (filter.fromDueDate) {
      if (moment(filter.fromDueDate).isValid()) {
        const date = moment(
          moment(filter.fromDueDate).format('YYYY MM DD'),
        ).toDate();
        where.dueDate = MoreThanOrEqual(date);
      }
    }
    if (filter.toDueDate) {
      if (moment(filter.toDueDate).isValid()) {
        const date = moment(
          moment(filter.toDueDate).format('YYYY MM DD'),
        ).toDate();
        where.dueDate = LessThanOrEqual(date);
      }
    }

    // todo uncomment when entity has payment date
    //   if(filter.paymentDate){
    //     if(moment(filter.paymentDate).isValid()){
    //       const date = moment(moment(filter.paymentDate).format('YYYY MM DD')).toDate();
    //       where.paymentDate = date;
    //    }
    //  }

    const result = await this.invoiceRepo.findAndCount({
      relations: ['createdByOrganization', 'createdForOrganization'],
      skip: skippedItems,
      take: param.limit,
      where: where,
      order: { dueDate: 'DESC' },
    });
    const pageRes: PaginatedResultDto = {
      data: result[0],
      limit: param.limit,
      page: param.page,
      totalCount: result[1],
    };
    return AppResponse.OkSuccess(pageRes);
  }

  @AllowPermissions(InvoicePermissions.view)
  @Get(':invoiceId')
  async GetInvoice(@Param('invoiceId') invoiceId: string) {
    const invoice = await this.invoiceRepo.findOne({
      where: { id: invoiceId },
      relations: ['createdByOrganization', 'createdForOrganization'],
    });
    if (!invoice) {
      throw new BadRequestException(AppResponse.badRequest('No Invoice Found'));
    }
    return AppResponse.OkSuccess(invoice);
  }
}

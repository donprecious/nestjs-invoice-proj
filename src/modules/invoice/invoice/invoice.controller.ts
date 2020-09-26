import { invoiceStatus } from './../../../shared/app/invoiceStatus';
import { organizationType } from './../../../shared/app/organizationType';
import {
  InvoiceParameter,
  UpdateInvoiceDto,
} from './../../../dto/invoice/invoice.dto';
import { InvoicePermissions } from './../../../shared/app/permissionsType';
import {
  supplier,
  buyer,
} from './../../../shared/oranization/organizationType';
import {
  PaginationQueryParam,
  PaginatedResultDto,
} from './../../../shared/dto/pagination.dto';
import { In } from 'typeorm/find-options/operator/In';
import { Organization } from 'src/entities/organization.entity';
import { invoiceExcelSchema } from './../invoiceExcelSchema';

import { AppResponse } from 'src/shared/helpers/appresponse';
import { OrganizationRepository } from 'src/services/organization/organizationService';
import {
  InvoiceRepository,
  InvoiceService,
} from './../../../services/invoice/invoice';
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
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  Request,
  UnauthorizedException,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/modules/identity/auth/jwtauth.guard';
import { AnyFilesInterceptor } from '@nestjs/platform-express/multer/interceptors/any-files.interceptor';
import {
  Any,
  Between,
  FindConditions,
  LessThanOrEqual,
  MoreThanOrEqual,
} from 'typeorm';
import { AppService } from 'src/services/app/app.service';
import { EmailService } from 'src/services/notification/email/email.service';
import { ConfigService } from '@nestjs/config';
import moment = require('moment');

import { AllowPermissions } from 'src/shared/guards/permission.decorator';
import { RolePermissionGuard } from 'src/shared/guards/role-permission.guard';
import { OrganizationTypeEnum } from 'src/shared/app/organizationType';

@UseGuards(JwtAuthGuard, RolePermissionGuard)
@ApiTags('invoice')
@Controller('invoice')
export class InvoiceController {
  constructor(
    private invoiceRepo: InvoiceRepository,
    private orgRepo: OrganizationRepository,
    private appService: AppService,
    private invoiceService: InvoiceService,
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
        discountAmount: 0.95 * row.amount,
        createdByOrganization: organization,
        createdForOrganization: uniqueOrganizations.find(
          a => a.code == row.supplierCode,
        ),
      } as Invoice;
      invoices.push(invoice);
    }
    this.invoiceRepo.save(invoices);
    for (const invoice of invoices) {
      await this.invoiceService.ComputeInvoiceDiscount(
        invoice.id,
        invoice.status,
      );
    }
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
        discountAmount: 0.95 * row.amount,
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
    for (const invoice of invoices) {
      await this.invoiceService.ComputeInvoiceDiscount(
        invoice.id,
        invoice.status,
      );
    }
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

    const where: FindConditions<Invoice>[] = [];
    const where1: FindConditions<Invoice> = {};
    if (filter.amount) {
      // where.push({ amount: filter.amount });
      where1.amount = filter.amount;
    }
    if (filter.fromAmount && filter.toAmount) {
      // where.push({
      //   amount: Between(Number(filter.fromAmount), Number(filter.toAmount)),
      // });
      where1.amount = Between(
        Number(filter.fromAmount),
        Number(filter.toAmount),
      );
    }
    // if (filter.toAmount) {
    //   where.push({ amount: LessThanOrEqual<number>(Number(filter.toAmount)) });
    //   // where.amount = LessThanOrEqual(filter.amount);
    // }
    if (filter.discountAmount) {
      // where.push({ discountAmount: filter.discountAmount });

      where1.discountAmount = filter.discountAmount;
    }

    if (filter.fromDiscountAmount && filter.toDiscountAmount) {
      where.push({
        discountAmount: Between(
          Number(filter.fromDiscountAmount),
          Number(filter.toDiscountAmount),
        ),
      });
      where1.discountAmount = Between(
        Number(filter.fromDiscountAmount),
        Number(filter.toDiscountAmount),
      );

      // where.amount =  MoreThanOrEqual(filter.fromDiscountAmount);
    }

    if (filter.invoiceNumber) {
      where1.invoiceNumber = filter.invoiceNumber;
      // where.push({ invoiceNumber: filter.invoiceNumber });
    }

    if (filter.supplierCode) {
      const supplier = await this.orgRepo.findOne({
        where: { code: filter.supplierCode },
      });
      if (supplier) {
        // where.push({ createdForOrganization: supplier });
        where1.createdForOrganization = supplier;
      }
    }
    if (filter.buyerCode) {
      const buyer = await this.orgRepo.findOne({
        where: { code: filter.buyerCode },
      });
      if (buyer) {
        // where.push({ createdByOrganization: buyer });
        where1.createdByOrganization = buyer;
      }
    }

    if (filter.supplierName) {
      const supplier = await this.orgRepo.findOne({
        where: { name: filter.supplierName },
      });
      if (supplier) {
        // where.push({ createdForOrganization: supplier });
        where1.createdForOrganization = supplier;
      }
    }
    if (filter.buyerName) {
      const buyer = await this.orgRepo.findOne({
        where: { name: filter.buyerName },
      });
      if (buyer) {
        // where.push({ createdByOrganization: buyer });
        where1.createdByOrganization = buyer;
      }
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

    if (filter.fromDueDate && filter.toDueDate) {
      if (moment(filter.fromDueDate).isValid()) {
        const fromDate = moment(
          moment(filter.fromDueDate).format('DD-MM-YYYY'),
        ).format();
        const toDate = moment(
          moment(filter.toDueDate).format('DD-MM-YYYY'),
        ).format();
        where1.dueDate = Between(fromDate, toDate);

        // where.push({ dueDate: Between(fromDate, toDate) });
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
      where: where1,
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

  @Get('overview')
  async GetOverview(@Query() param: InvoiceParameter) {
    const loggedInUser = await this.appService.getLoggedUser();
    if (loggedInUser.organization.type != OrganizationTypeEnum.Admin) {
      if (loggedInUser.organization.type != param.type) {
        throw new UnauthorizedException();
      }
    }

    if (
      param.type == OrganizationTypeEnum.Buyer ||
      param.type == OrganizationTypeEnum.Supplier
    ) {
      if (!param.value || param.value == '') {
        param.value = loggedInUser.organization.id;
        //  throw new BadRequestException(AppResponse.badRequest("the key value is not present in query param"));
      }
    }
    const organization = await this.orgRepo.findOne(param.value);
    console.log(organization);
    const result = await this.invoiceRepo.GetInvoiceOverview(
      param.type,
      organization,
    );
    return AppResponse.OkSuccess(result);
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

  @Put(':invoiceId')
  async UpdateInvoice(
    @Param('invoiceId') invoiceId: string,
    @Body() updateInvoiceDto: UpdateInvoiceDto,
  ) {
    const invoice = await this.invoiceRepo.findOne({
      where: { id: invoiceId },
    });
    if (!invoice) {
      throw new NotFoundException(AppResponse.NotFound('invoice not found'));
    }
    invoice.amount = updateInvoiceDto.amount;
    invoice.invoiceNumber = updateInvoiceDto.invoiceNumber;
    invoice.currencyCode = updateInvoiceDto.currencyCode;
    invoice.dueDate = updateInvoiceDto.dueDate;
    // invoice.discountAmount = updateInvoiceDto.discountAmount;
    invoice.paymentDate = updateInvoiceDto.paymentDate;
    invoice.paymentReference = updateInvoiceDto.paymentReference;
    invoice.status = updateInvoiceDto.status;
    if (updateInvoiceDto.status == invoiceStatus.paid) {
      if (!updateInvoiceDto.paymentDate) {
        invoice.paymentDate = moment().toDate();
      } else {
        if (moment(invoice.createdOn).isAfter(updateInvoiceDto.paymentDate)) {
          throw new BadRequestException(
            AppResponse.badRequest(
              'payment date should be  greater than invoice created date',
            ),
          );
        }
        if (moment(updateInvoiceDto.paymentDate).isAfter(invoice.dueDate)) {
          throw new BadRequestException(
            AppResponse.badRequest(
              'payment date should be below invoice due date',
            ),
          );
        }
      }
    }
    if (updateInvoiceDto.dueDate) {
      if (moment(updateInvoiceDto.dueDate).isBefore(invoice.createdOn)) {
        throw new BadRequestException(
          AppResponse.badRequest(
            'due date should be above invoice creation date',
          ),
        );
      }
    }
    await this.invoiceRepo.update(invoice.id, invoice);
    await this.invoiceService.ComputeInvoiceDiscount(
      invoice.id,
      invoice.status,
    );
    return AppResponse.OkSuccess(invoice);
  }
}

import { endOfDay } from 'date-fns';
import { InvoiceChangeLogRepository } from './../../../repositories/invoice/invoiceChangeLogRepository';
import { getDurationInDays } from './../../../shared/helpers/dateUtility';
import { EmailDto } from 'src/shared/dto/emailDto';
import { EmailService } from 'src/services/notification/email/email.service';
import { getTemplate } from 'src/providers/EmailTemplate/welcome';
import { roleTypes } from 'src/shared/app/roleTypes';
import { UserRepository } from 'src/repositories/user/userRepository';
import {
  buyer,
  supplier,
} from './../../../shared/oranization/organizationType';
import { getSupplierPaymenMessage } from './../../../providers/EmailTemplate/supplierPaymentMessage';
import { OrganizationService } from 'src/services/organization/organization.services';
import { invoiceStatus } from './../../../shared/app/invoiceStatus';
import {
  InvoiceParameter,
  UpdateInvoiceDto,
  UpdateInvoicePaymentDate,
} from './../../../dto/invoice/invoice.dto';
import { InvoicePermissions } from './../../../shared/app/permissionsType';
import {
  PaginationQueryParam,
  PaginatedResultDto,
} from './../../../shared/dto/pagination.dto';
import { In } from 'typeorm/find-options/operator/In';

import { AppResponse } from 'src/shared/helpers/appresponse';
import { OrganizationRepository } from 'src/repositories/organization/organizationRepository';
import { InvoiceRepository } from '../../../repositories/invoice/invoiceRepository';
import { Invoice } from './../../../entities/invoice.entity';
import readXlsxFile = require('read-excel-file/node');
import * as _ from 'lodash';
import { ConfigService } from '@nestjs/config';
import { ConfigConstant } from 'src/shared/constants/ConfigConstant';

import {
  CreateManyInvoiceDto,
  InvoiceFilter,
} from './../../../dto/invoice/create-invoice.dto';
import {
  ApiBearerAuth,
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
  Between,
  FindConditions,
  MoreThan,
  LessThan,
  MoreThanOrEqual,
} from 'typeorm';
import { AppService } from 'src/services/app/app.service';
import moment = require('moment');

import { AllowPermissions } from 'src/shared/guards/permission.decorator';
import { RolePermissionGuard } from 'src/shared/guards/role-permission.guard';
import { OrganizationTypeEnum } from 'src/shared/app/organizationType';
import { invoiceExcelSchema } from './../invoiceExcelSchema';
import { InvoiceService } from 'src/services/invoice/invoice-service.service';
import { InvoiceChangeLog } from 'src/entities/invoiceChangeLog.entity';
import { InvoiceChangeLogService } from 'src/services/invoice-change-log/invoice-change-log.service';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolePermissionGuard)
@ApiTags('invoice')
@Controller('invoice')
export class InvoiceController {
  constructor(
    private invoiceRepo: InvoiceRepository,
    private orgRepo: OrganizationRepository,
    private orgService: OrganizationService,
    private appService: AppService,
    private invoiceService: InvoiceService,
    private configService: ConfigService,
    private userRepo: UserRepository,
    private emailService: EmailService,
    private invoiceChangeLogRepository: InvoiceChangeLogRepository,
    private invoiceChangeLogService: InvoiceChangeLogService,
  ) {}

  @ApiHeader({
    name: 'organizationId',
    description: 'provide organization id',
  })
  @Post()
  @AllowPermissions(InvoicePermissions.create)
  async create(@Body() createInvoices: CreateManyInvoiceDto, @Request() req) {
    const organization = await this.appService.getOrganization();

    //const orgnizationId = organization.id;

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
      const supplier = uniqueOrganizations.find(
        a => a.code == row.supplierCode,
      );
      const tenor = getDurationInDays(
        row.dueDate,
        moment()
          .toDate()
          .toString(),
      );
      const invoice = {
        amount: row.amount,
        invoiceNumber: row.invoiceNumber,
        currencyCode: row.currencyCode,
        dueDate: row.dueDate,
        discountAmount: 0.95 * row.amount,
        createdByOrganization: organization,
        status: invoiceStatus.accepted,
        createdForOrganization: uniqueOrganizations.find(
          a => a.code == row.supplierCode,
        ),
        apr: supplier.apr,
        tenor: tenor,
      } as Invoice;
      invoices.push(invoice);
    }
    this.invoiceRepo.save(invoices);

    const buyerApr =
      organization.apr > 0.0
        ? organization.apr
        : this.configService.get<number>(ConfigConstant.APR);

    for (const invoice of invoices) {
      await this.invoiceService.ComputeInvoiceDiscountAmount(
        invoice.invoiceNumber,
        invoice.status,
        buyerApr,
        organization,
      );
    }
    const oldInvoices = invoices.map(a => {
      a.status = invoiceStatus.pending;
      return a;
    });
    this.invoiceChangeLogService.createLogs(oldInvoices);
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
          'The following invoice number already exist,invoice number /s' +
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
      const supplier = uniqueOrganizations.find(
        a => a.code == row.supplierCode,
      );
      const tenor = getDurationInDays(
        row.dueDate,
        moment()
          .toDate()
          .toString(),
      );
      const invoice = {
        amount: row.amount,
        discountAmount: 0.9 * row.amount,
        invoiceNumber: row.invoiceNo,
        currencyCode: row.currencyCode,
        dueDate: row.dueDate,
        status: invoiceStatus.accepted,
        createdByOrganization: organization,
        createdForOrganization: uniqueOrganizations.find(
          a => a.code == row.supplierCode,
        ),
        apr: supplier.apr,
        tenor: tenor,
      } as Invoice;
      invoices.push(invoice);
    }
    await this.invoiceRepo.save(invoices);

    const buyerApr =
      organization.apr > 0.0
        ? organization.apr
        : this.configService.get<number>(ConfigConstant.APR);

    for (const invoice of invoices) {
      console.log(
        ' processing discount for invoice id' + invoice.invoiceNumber,
      );
      await this.invoiceService.ComputeInvoiceDiscountAmount(
        invoice.invoiceNumber,
        invoice.status,
        buyerApr,
        organization,
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
    if (filter.expiring) {
      // where.push({ discountAmount: filter.discountAmount });

      const expireIn = moment().add(filter.expiring, 'days');
      const fromDate = expireIn.startOf('day').toDate();
      const toDate = expireIn.endOf('day').toDate();
      where1.dueDate = Between(fromDate, toDate);
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
    if (filter.status) {
      where1.status = filter.status;
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
      }
    }

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
    const invoiceResult = await this.invoiceService.GetInvoiceOverview(
      param.type,
      organization,
      param.dateFilter,
    );
    const orgResult = await this.orgService.GetRelatedOrg(
      param.type,
      organization,
      param.dateFilter,
    );
    const response = {
      valueOfInvoice: invoiceResult.valueOfInvoice,
      numberOfInvoice: invoiceResult.numberOfInvoice,
      totalDaysPaidEarily: invoiceResult.totalDaysPaidEarily,
      totalOrgCount: orgResult.totalOrgCount,
      numberOfSuppliers: orgResult.numberOfSuppliers,
      numberOfBuyers: orgResult.numberOfBuyers,
    };
    return AppResponse.OkSuccess(response);
  }

  @Put('update-overdue')
  async UpdateOverDue() {
    const currentDate = moment().toDate();
    const overDueInvoices = await this.invoiceRepo.find({
      where: { dueDate: LessThan(currentDate), status: invoiceStatus.paid },
      relations: ['createdByOrganization', 'createdForOrganization'],
    });
    overDueInvoices.forEach(a => (a.status = invoiceStatus.overdue));
    await this.invoiceRepo.save(overDueInvoices);

    const changeLogs: InvoiceChangeLog[] = overDueInvoices.map(invoice => {
      const changeLog = {
        invoiceId: invoice.id,
        changeAmount: invoice.amount,
        discountAmount: invoice.discountAmount,
        invoiceNumber: invoice.invoiceNumber,
        changeMonth: moment().month(),
        changeYear: moment().year(),
        changeWeekInYear: moment().weeks(),
        statusFrom: invoiceStatus.paid,
        statusTo: invoice.status,
        invoiceAmount: invoice.amount,
        buyerCode: invoice.createdByOrganization.code,
        supplierCode: invoice.createdForOrganization.code,
      } as InvoiceChangeLog;
      return changeLog;
    });

    await this.invoiceChangeLogRepository.save(changeLogs);
    return AppResponse.OkSuccess(overDueInvoices);
  }

  @AllowPermissions(InvoicePermissions.edit)
  @Put('settle')
  async UpdateToSettle() {
    const invoices = await this.invoiceRepo.find({
      where: [
        { status: invoiceStatus.paid },
        { status: invoiceStatus.overdue },
      ],
      relations: ['createdByOrganization', 'createdForOrganization'],
    });
    const invoicesBeforeUpdate = Object.assign({}, invoices);
    invoices.forEach(a => (a.status = invoiceStatus.settled));
    await this.invoiceRepo.save(invoices);

    await this.invoiceChangeLogService.createLogs(invoicesBeforeUpdate);
    return AppResponse.OkSuccess(invoices);
  }

  @AllowPermissions(InvoicePermissions.edit)
  @Put('settle/:invoiceId')
  async UpdateToSettleByInvoiceId(@Param('invoiceId') invoiceId: string) {
    const invoice = await this.invoiceRepo.findOne({
      where: [{ id: invoiceId }],
      relations: ['createdByOrganization', 'createdForOrganization'],
    });
    const isNotOverdue = invoice.status !== invoiceStatus.overdue;
    if (invoice.status !== invoiceStatus.paid && isNotOverdue) {
      throw new BadRequestException(
        AppResponse.OkFailure(
          'invoice not updated, only invoice with status paid or overdue can be updated to settled',
        ),
      );
    }
    const invoicesBeforeUpdate = Object.assign({}, invoice);
    invoice.status = invoiceStatus.settled;
    await this.invoiceRepo.save(invoice);

    await this.invoiceChangeLogService.createLogs([invoicesBeforeUpdate]);
    return AppResponse.OkSuccess(invoice);
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

  @Put('payment/:invoiceId')
  async UpdateInvoicePaymentDate(
    @Param('invoiceId') invoiceId: string,
    @Body() updatePaymentDate: UpdateInvoicePaymentDate,
  ) {
    const invoice = await this.invoiceRepo.findOne({
      where: { id: invoiceId },
      relations: ['createdByOrganization', 'createdForOrganization'],
    });
    if (!invoice) {
      throw new NotFoundException(AppResponse.NotFound('invoice not found'));
    }
    const oldChangeInvoice = Object.assign({}, invoice);
    invoice.paymentReference = updatePaymentDate.paymentReference;
    invoice.status = invoiceStatus.paid;

    if (!updatePaymentDate.paymentDate) {
      invoice.paymentDate = moment().toDate();
    } else {
      if (moment(invoice.createdOn).isAfter(updatePaymentDate.paymentDate)) {
        throw new BadRequestException(
          AppResponse.badRequest(
            'payment date should be  greater than invoice created date',
          ),
        );
      }
      if (moment(updatePaymentDate.paymentDate).isAfter(invoice.dueDate)) {
        throw new BadRequestException(
          AppResponse.badRequest(
            'payment date should be below invoice due date',
          ),
        );
      }
      invoice.paymentDate = updatePaymentDate.paymentDate;
    }
    const tenor = getDurationInDays(invoice.dueDate, invoice.paymentDate);
    invoice.tenor = tenor;
    const currentUser = await this.appService.getCurrentUser();
    invoice.updatedBy = currentUser?.id;
    await this.invoiceRepo.update(invoice.id, invoice);

    await this.invoiceService.UpdateEarilyPayment(invoice.id);

    console.log(' buyer is ' + invoice.createdByOrganization);

    const buyerApr =
      invoice.createdByOrganization?.apr == null
        ? this.configService.get<number>(ConfigConstant.APR)
        : invoice.createdByOrganization?.apr;

    const updateInvoiceDiscount = await this.invoiceService.ComputeInvoiceDiscountAmount(
      invoice.invoiceNumber,
      invoice.status,
      buyerApr,
      invoice.createdByOrganization,
    );
    const buyer = invoice.createdByOrganization;
    const supplier = invoice.createdForOrganization;
    const currencyCode = invoice.currencyCode;
    const discountedAmount =
      updateInvoiceDiscount.amount - updateInvoiceDiscount.discountAmount;
    const message = getSupplierPaymenMessage(
      supplier.name,
      buyer.name,
      invoice.invoiceNumber,
      currencyCode +
        ' ' +
        new Intl.NumberFormat('en-IN').format(
          updateInvoiceDiscount.discountAmount,
        ),
      currencyCode +
        ' ' +
        new Intl.NumberFormat('en-IN').format(discountedAmount),

      currencyCode +
        ' ' +
        new Intl.NumberFormat('en-IN').format(invoice.amount),
      invoice.apr ? Number.parseFloat(invoice.apr?.toString()).toFixed(2) : 0,
      invoice.tenor
        ? Number.parseFloat(invoice.tenor?.toString()).toFixed(2)
        : 0,
    );
    const body = getTemplate(message, 'Congratulations Early Payment Received');
    const email = {
      body: body,
      subject: `Early Payment  of ${
        invoice.currencyCode
      } ${new Intl.NumberFormat('en-IN', {
        maximumSignificantDigits: 3,
      }).format(invoice.amount)} on  ${invoice.invoiceNumber}`,
      to: [supplier.email],
    } as EmailDto;
    const mail = await this.emailService.sendEmail(email).toPromise();
    console.log(mail);

    // const changeLog = {
    //   invoiceId: updateInvoiceDiscount.id,
    //   changeAmount: updateInvoiceDiscount.amount,
    //   discountAmount: updateInvoiceDiscount.discountAmount,
    //   invoiceNumber: updateInvoiceDiscount.invoiceNumber,
    //   changeMonth: moment().month(),
    //   changeYear: moment().year(),
    //   changeWeekInYear: moment().weeks(),
    //   statusFrom: oldChangeInvoice.status,
    //   statusTo: invoice.status,
    //   invoiceAmount: updateInvoiceDiscount.amount,
    //   buyerCode: invoice.createdByOrganization.code,
    //   supplierCode: invoice.createdForOrganization.code,
    // } as InvoiceChangeLog;
    // await this.invoiceChangeLogRepository.save(changeLog);
    await this.invoiceChangeLogService.createLogs([oldChangeInvoice]);
    return AppResponse.OkSuccess(invoice);
  }
}

import { getDateFromFilter } from './../../shared/helpers/dateUtility';
import { Organization } from './../../entities/organization.entity';
import { Invoice } from './../../entities/invoice.entity';

import {
  Repository,
  EntityRepository,
  FindConditions,
  Not,
  Between,
} from 'typeorm';
import { OrganizationTypeEnum } from 'src/shared/app/organizationType';
import * as _ from 'lodash';

@EntityRepository(Invoice)
export class InvoiceRepository extends Repository<Invoice> {
  constructor() {
    super();
  }
}

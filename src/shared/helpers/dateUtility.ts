import { dateFilterConstant } from './../app/dateFilterConstant';

import moment = require('moment');
import { endOfDay } from 'date-fns';
import { Moment } from 'moment';

export const getToday = () => {
  const from = moment().startOf('day');
  const to = moment().endOf('day');

  return { from, to };
};

export const getLast7Days = () => {
  const from = moment()
    .subtract(7, 'days')
    .startOf('day');
  const to = moment().endOf('day');
  return { from, to };
};

export const getLast30Days = () => {
  const from = moment()
    .subtract(30, 'days')
    .startOf('day');
  const to = moment().endOf('day');
  return { from, to };
};

export const getCustom = (fromDate: string, toDate: string) => {
  const from = moment(fromDate).startOf('day');
  const to = moment(toDate).endOf('day');
  return { from, to };
};

export const getDateFromFilter = (
  dateFilter: string,
): { from: Moment; to: Moment } => {
  switch (dateFilter) {
    case dateFilterConstant.today:
      return getToday();
      break;
    case dateFilterConstant.last7Days:
      return getLast7Days();
      break;
    case dateFilterConstant.last30Day:
      return getLast30Days();
      break;
    default:
      // compute all time
      return { from: moment('2000/1/1'), to: moment() };
      break;
  }
};

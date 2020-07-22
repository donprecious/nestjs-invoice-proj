import moment = require('moment');

export const invoiceExcelSchema = {
  'INVOICE NUMBER': {
    prop: 'invoiceNo',
    required: true,
    type: String,
  },
  AMOUNT: {
    prop: 'amount',
    type: Number,
    required: true,
  },

  'DUE DATE': {
    prop: 'dueDate',
    required: true,
    parse(value) {
      const valid = moment(
        value,
        ['DD-MM-YYYY', 'DD/MM/YYYY', 'DDMMMMY', 'MMMMDDY'],
        true,
      ).isValid();
      if (!valid) {
        throw new Error(
          `invalid date format, requires any of this values 'DD-MM-YYYY', 'DD/MM/YYYY', 'DDMMMMY', 'MMMMDDY'`,
        );
      }
      const date = moment(value, [
        'DD-MM-YYYY',
        'DD/MM/YYYY',
        'DDMMMMY',
        'MMMMDDY',
      ]).format();
      console.log('parsed date', date);
      return date;
    },
  },
  'CURRENCY CODE': {
    prop: 'currencyCode',
    type: String,
    required: true,
  },
  'SUPPLIER CODE': {
    prop: 'supplierCode',
    type: String,
    required: true,
  },
};

import { roleTypes } from '../../shared/app/roleTypes';
import * as _ from 'lodash';
const supplierPaymentMessage = `
Congratulations {username}! Your invoice number: {invoiceNo} for {buyerName} has been paid early for {payoutAmount} by Front Edge.
<br>
<strong>Transaction Breakdown </strong> <br>
Invoice Amount: {invoiceAmount} <br>
Discount: {discount}
`;

export const getSupplierPaymenMessage = (
  username,
  buyerName,
  invoiceNo,
  payoutAmount,
  invoiceAmount,
  discount,
) => {
  const message = supplierPaymentMessage;

  let replaced = _.replace(message, '{username}', username);
  replaced = _.replace(replaced, '{invoiceNo}', invoiceNo);
  replaced = _.replace(replaced, '{buyerName}', buyerName);
  replaced = _.replace(replaced, '{payoutAmount}', payoutAmount);
  replaced = _.replace(replaced, '{invoiceAmount}', invoiceAmount);
  replaced = _.replace(replaced, '{discount}', discount);
  return replaced;
};

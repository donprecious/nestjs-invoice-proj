import { roleTypes } from '../../shared/app/roleTypes';
import * as _ from 'lodash';
const supplierPaymentMessage = `
Congratulations {username}! Your invoice number: <b> {invoiceNo} </b> for {buyerName} has been paid early for {payoutAmount} by Front Edge.
<br>
<strong>Transaction Breakdown </strong> <br> 
X<br/>
Invoice Amount: {invoiceAmount} <br>  
X<br/>
  
Days Financed: {tenor} <br>  
X<br/>
Daily Rate: {apr} <br> 
X 
<br/>
_____________________________ 
<br/>
Discount Amount: {discount} 
<br/> 

<br/>
Payout Amount: {payoutAmount} 
<br/>
`;

export const getSupplierPaymenMessage = (
  username,
  buyerName,
  invoiceNo,
  payoutAmount,
  discountedAmount,
  invoiceAmount,
  apr,
  tenor,
) => {
  const message = supplierPaymentMessage;

  let replaced = _.replace(message, '{username}', username);
  replaced = _.replace(replaced, '{invoiceNo}', invoiceNo);
  replaced = _.replace(replaced, '{buyerName}', buyerName);
  replaced = _.replace(replaced, /{payoutAmount}/g,  payoutAmount);
  replaced = _.replace(replaced, '{invoiceAmount}', invoiceAmount);
  replaced = _.replace(replaced, '{discount}', discountedAmount);
  replaced = _.replace(replaced, '{apr}', apr);
  replaced = _.replace(replaced, '{tenor}', tenor);
  return replaced;
};

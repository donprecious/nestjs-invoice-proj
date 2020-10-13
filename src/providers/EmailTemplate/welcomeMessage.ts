import { roleTypes } from './../../shared/app/roleTypes';
import * as _ from 'lodash';
const welcomeMessage = `
Hello {username},
<br /><br />
 You are invited to join ARM's Early Payment's Program provided by Front Edge. This is a program where preferred ARM suppliers can receive accelerated financing on their invoices. In order to get early payment on all of your outstanding and ongoing invoices please click the link below to activate your account.
  {link}
 <br /><br />
  {moreInfo}
`;

const welcomeMessageForUser = `
Hi {username},
<br/>
{inviteeName} has added you to the {companyName} Front Edge account where you can monitor invoicing and payments. Please click the link below to activate your account by entering this OTP.
<br>
{link}
<br /><br /> 
{moreInfo}
<br/>
Thanks.
`;

const welcomeMessageForSupplier = `
Hello {username},

You are invited to join {companyName}'s Early Payment's Program provided by Front Edge. This is a program where preferred {companyName} suppliers can receive accelerated financing on their invoices.
 In order to get early payment on all of your outstanding and ongoing invoices please click the link below to activate your account. 
 {link}
 <br /><br /> 
 {moreInfo}
`;
const welcomeMessageForBuyer = `
Hello {username},

You are invited to join Early Payment's Program provided by Front Edge. This is a program where preferred {companyName} suppliers can receive accelerated financing on their invoices.
<br/> In order to enable your supplier to get early payment your invoices please click the link below to activate your account. 
{link}
<br /><br /> 
{moreInfo}

`;
export const getWelcomeMessage = (
  username,
  link,
  type,
  inviteeCompaniesName,
  moreInfo = '',
  inviteeName = '',
) => {
  let message = welcomeMessage;
  if (type == roleTypes.buyer || type == roleTypes.supplier) {
    message = welcomeMessageForUser;
  }
  if (type == roleTypes.supplierAdmin) {
    message = welcomeMessageForSupplier;
  }
  if (type == roleTypes.buyerAdmin) {
    message = welcomeMessageForBuyer;
  }
  let replaced = _.replace(message, '{username}', username);
  replaced = _.replace(replaced, '{link}', link);
  if (moreInfo) {
    replaced = _.replace(replaced, '{moreInfo}', moreInfo);
  } else {
    replaced = _.replace(replaced, '{moreInfo}', ' ');
  }
  replaced = _.replace(replaced, '{inviteeName}', inviteeName);
  replaced = _.replace(replaced, '{companyName}', inviteeCompaniesName);
  return replaced;
};

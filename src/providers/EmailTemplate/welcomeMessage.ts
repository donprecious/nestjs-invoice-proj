import * as _ from 'lodash';
const welcomeMessage = `
Hello {username},
<br /><br />
 You are invited to join ARM's Early Payment's Program provided by Front Edge. This is a program where preferred ARM suppliers can receive accelerated financing on their invoices. In order to get early payment on all of your outstanding and ongoing invoices please click the link below to activate your account.
  {link}
 <br /><br />
  {moreInfo}
`;

export const getWelcomeMessage = (username, link, moreInfo = '') => {
  const message = welcomeMessage;
  let replaced = _.replace(message, '{username}', username);
  replaced = _.replace(replaced, '{link}', link);
  if (moreInfo) {
    replaced = _.replace(replaced, '{moreInfo}', moreInfo);
  } else {
    replaced = _.replace(replaced, '{moreInfo}', ' ');
  }
  return replaced;
};

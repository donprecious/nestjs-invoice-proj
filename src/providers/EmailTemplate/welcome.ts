import * as _ from 'lodash';

const template = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<title>Frontedge </title>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
</head>
<body style="margin: 0; padding: 0;">
    <table border="0" cellpadding="0" cellspacing="0" width="100%">
         
        <tr>
            <td style="padding: 10px 0 10px 0;">
                <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="border: 1px solid #cccccc; border-collapse: collapse;">
                    <tr>
                        <td bgcolor="#fff" style="padding: 10px 10px 10px 10px;">
                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="">
                                <tr>
                                    <td style="color: #333; font-family: Arial, sans-serif; font-size: 14px;" width="75%">
                                   <a href="https://portalstaging.frontedgegroup.com/"> <img style=" width: 60px; height: 60px;" src="https://frontedge-assets.s3-eu-west-1.amazonaws.com/logo.png"/>
                                   </a>
                                    <img style="width: 100px; height: 20px; margin-bottom: 20px;" src="https://frontedge-assets.s3-eu-west-1.amazonaws.com/FrontEdge-text.png"/>
                                    </td>
                                    <td align="right" width="25%">
                                        <table border="0" cellpadding="0" cellspacing="0">
                                            <tr>
                                                 <td style="font-family: Arial, sans-serif; font-size: 12px; width: 60px; height: 30px; background-color: #EEC124;; font-weight: bold;">
                                                    <!-- <a href="http://www.twitter.com/" style="color: #ffffff;">
                                                        <img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/210284/tw.gif" alt="Twitter" width="38" height="38" style="display: block;" border="0" />
                                                    </a> -->
                                                </td>
                                                <td style="font-size: 0; line-height: 0;" width="20">&nbsp;</td>
                                                <td style="font-family: Arial, sans-serif; font-size: 12px; font-weight: bold;">
                                                    <a href="http://www.twitter.com/" style="color: #ffffff;">
                                                        
                                                    </a>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td align="center" style="padding: 1px 0px 1px 0px; margin-top: 60px; color: #153643; font-size: 28px; font-weight: bold; font-family: Arial, sans-serif; height: 300px; background-color: #358EE1;">
                            <img src="https://frontedge-assets.s3-eu-west-1.amazonaws.com/Vector.png" alt="FRONT EDGE " width="62" height="55" style="display: block; padding: 1em; background-color: white; border-radius: 2.6em;" />
                            <a style="display: block; margin:auto; font-weight: 100; margin-top: 10px; color: white;">WELCOME ON BOARD</a>
                        </td>
                    </tr>
                    <tr>
                        <td bgcolor="#ffffff" style="padding: 40px 30px 40px 30px;">
                            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                               
                                </tr>
                                <tr>
                                    <td style="padding: 10px 0 30px 0; line-height: 18px; font-size: 13px; font-weight: normal; text-align: justify; color: #626060; font-family: Arial, sans-serif; font-size: 14px; line-height: 20px;">
                                    {message}
                               
                                          </td>
                                </tr>
                                <tr>
                                    <td>
            
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td bgcolor="#fff"  style="padding: 30px 30px 30px 30px; border-top: 1px solid #7dd7d7; ">
                            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                
                                 
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;
export const getTemplate = message => {
  const temp = template;
  const replaced = _.replace(temp, '{message}', message);
  return replaced;
};

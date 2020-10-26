import { organizationType } from './organizationType';
export const roleTypes = {
  supplier: 'supplier',
  supplierAdmin: 'supplier_admin',
  buyerAdmin: 'buyer_admin',
  buyer: 'buyer',
  admin: 'admin',
};

export const getDefaultOrganizationRoleType = orgType => {
  if (orgType == organizationType.buyer) {
    return [roleTypes.buyer, roleTypes.buyerAdmin];
  }
  if (orgType == organizationType.supplier) {
    return [roleTypes.supplier, roleTypes.supplierAdmin];
  }
  if (orgType == organizationType.admin) {
    return [roleTypes.admin];
  }
  return [];
};

export const getOrganizationAdminRoleType = orgType => {
  if (orgType == organizationType.buyer || orgType == roleTypes.buyerAdmin) {
    return roleTypes.buyerAdmin;
  }
  if (orgType == organizationType.supplier || roleTypes.supplierAdmin) {
    return roleTypes.supplierAdmin;
  }
  if (orgType == organizationType.admin) {
    return roleTypes.admin;
  }
  return '';
};

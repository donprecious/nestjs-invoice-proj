export const permissionTypes = {
  read: 'read',
  create: 'create',
  update: 'update',
  delete: 'delete',
};

export enum BuyerPermissions {
  createBuyer = 'Create_Buyer',
  editBuyer = 'Edit_Buyer',
  ViewBuyer = 'View_Buyer',
  listBuyer = 'List_Buyer',
  deleteBuyer = 'Delete_Buyer',
  viewSuppliers = 'View_Own_Supplier',
  addBuyerUser = 'Add_Buyer_User',
  BuyerAdminAccess = 'Buyer_AdminAccess',
}
export enum SupplierPermissions {
  createSuppier = 'Create_Suppier',
  editSuppier = 'Edit_Suppier',
  viewSuppier = 'View_Suppier',
  listSuppier = 'List_Suppier',
  deleteSuppier = 'Delete_Suppier',
  viewBuyers = 'View_Own_Buyer',
  addSupplierUser = 'Add_Suppier_User',
  SuppierAdminAccess = 'Suppier_AdminAcess',
}

export enum InvoicePermissions {
  create = 'Create_Invoice',
  edit = 'Edit_Invoice',
  delete = 'Delete_Invoice',
  list = 'List_Invoice',
  view = 'View_Invoice',
}

export enum AdminPermissions {
  any = 'Any',
}
export enum UserPermissions {
  create = 'Create_User',
  list = 'List_User',
  delete = 'Delete_User',
  view = 'View_User',
}

export const DefaultBuyerPermissions = [
  BuyerPermissions.viewSuppliers,
  BuyerPermissions.ViewBuyer,
  InvoicePermissions.view,
  InvoicePermissions.list,
  UserPermissions.view,
  UserPermissions.list,
];
export const DefaultSupplierPermissions = [
  SupplierPermissions.viewBuyers,
  SupplierPermissions.viewSuppier,
  InvoicePermissions.view,
  InvoicePermissions.list,
  UserPermissions.view,
  UserPermissions.list,
];

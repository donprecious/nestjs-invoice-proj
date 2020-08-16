export enum BuyerPermissions {
  createBuyer = 'Create_Buyer',
  editBuyer = 'Edit_Buyer',
  ViewBuyer = 'View_Buyer',
  listBuyer = 'List_Buyer',
  deleteBuyer = 'Delete_Buyer',
  viewSuppliers = 'View_Own_Supplier',
  addBuyerUser = 'Add_Buyer_User',
  
}
export enum SupplierPermissions {
  createSuppier = 'Create_Suppier',
  editSuppier = 'Edit_Suppier',
  viewSuppier = 'View_Suppier',
  listSuppier = 'List_Suppier',
  deleteSuppier = 'Delete_Suppier',
  viewBuyers = 'View_Own_Buyer',
  addSupplierUser = 'Add_Suppier_User',
}

export enum InvoicePermissions {
  create = 'Create_Invoice',
  edit = 'Edit_Invoice',
  delete = 'Delete_Invoice',
  list = 'List_Invoice',
  view = 'View_Invoice',
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

export const DefaultSupplierAdminPermissions = [
  ...DefaultSupplierPermissions,
  SupplierPermissions.createSuppier,
  SupplierPermissions.addSupplierUser,
  SupplierPermissions.editSuppier,
  InvoicePermissions.create,
  InvoicePermissions.edit,
  InvoicePermissions.delete,
];
export const DefaultBuyerAdminPermissions = [
  ...DefaultBuyerPermissions,
  BuyerPermissions.createBuyer,
  BuyerPermissions.addBuyerUser,
  BuyerPermissions.editBuyer,
  InvoicePermissions.create,
  InvoicePermissions.edit,
  InvoicePermissions.delete,
];

export const DefaultAdminPermission = [
  BuyerPermissions.ViewBuyer,
  BuyerPermissions.addBuyerUser,
  BuyerPermissions.createBuyer,
  BuyerPermissions.deleteBuyer,
  BuyerPermissions.editBuyer,
  BuyerPermissions.listBuyer,
  BuyerPermissions.viewSuppliers,

  SupplierPermissions.addSupplierUser,
  SupplierPermissions.createSuppier,
  SupplierPermissions.deleteSuppier,
  SupplierPermissions.editSuppier,
  SupplierPermissions.listSuppier,
  SupplierPermissions.viewBuyers,
  SupplierPermissions.viewSuppier,


  InvoicePermissions.create,
  InvoicePermissions.delete,
  InvoicePermissions.edit,
  InvoicePermissions.list,
  InvoicePermissions.view,

  UserPermissions.create,
  UserPermissions.delete,
  UserPermissions.list,
  UserPermissions.view,
];

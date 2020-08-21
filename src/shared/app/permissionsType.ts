export enum BuyerPermissions {
  createBuyer = 'Create_Buyer',   // post /organization , post /organization/user
  editBuyer = 'Edit_Buyer',     // put /organization/:orgId
  ViewBuyer = 'View_Buyer',   // get /organization/:orgId
  listBuyer = 'List_Buyer',   // get /organization 
  deleteBuyer = 'Delete_Buyer', //delete /organization/:orgId 
  viewSuppliers = 'View_Own_Supplier', // get /api/scf/organization/suppliers/buyer/{buyerId}
  addBuyerUser = 'Add_Buyer_User',  // post /api/scf/organization/add-user
  
}
export enum SupplierPermissions {
  createSuppier = 'Create_Suppier',    // post /organization , post /organization/user
  editSuppier = 'Edit_Suppier',  // put /organization/:orgId
  viewSuppier = 'View_Suppier',  // get /organization/:orgId
  listSuppier = 'List_Suppier',    // get /organization 
  deleteSuppier = 'Delete_Suppier',  //delete /organization/:orgId 
  viewBuyers = 'View_Own_Buyer', // get /api/scf/organization/buyers/supplier/{supplierId}
  addSupplierUser = 'Add_Suppier_User',   // post /api/scf/organization/add-user
}

export enum InvoicePermissions {
  create = 'Create_Invoice',  // Post  /api/scf/invoice
  edit = 'Edit_Invoice',   //Put /api/scf/invoice/:invoiceId
  delete = 'Delete_Invoice', // delete  /api/scf/invoice/:invoiceId
  list = 'List_Invoice',  // Get   /api/scf/invoice/,  /api/scf/invoice/supplier,   ​/api​/scf​/invoice​/buyer
  view = 'View_Invoice', // get /api/scf/invoice/:invoiceId
}

export enum UserPermissions {
  create = 'Create_User',  //Post /api/scf/organization/user , /api/scf/organization/add-user 
  list = 'List_User',  ///api​/scf​/organization​/{organizationId}​/users
  ​
  delete = 'Delete_User', //delete /api/scf/organization/delete-user/{userId}
  view = 'View_User', // view ​/api​/scf​/organization​/users​/{userId}
  edit = "Edit_User" // /api/scf/organization/edit-user/{userId}
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

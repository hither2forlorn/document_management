import docImages from "admin/views/BulkUpload/routes";
import documents from "admin/views/DocumentManagement/routes";
import users from "admin/views/Users/routes";
import ldapUsers from "admin/views/UsersLdap/routes";
import customerUsers from "admin/views/UsersCustomer/routes";
import branches from "admin/views/Branches/routes";
import memosAndForms from "admin/views/Memo/routes";
import departments from "admin/views/Departments/routes";
import documentConditions from "admin/views/DocumentConditions/routes";
import documentTypes from "admin/views/DocumentTypes/routes";
import documentIndex from "admin/views/IndexType/routes";
import languages from "admin/views/Language/routes";
import locationMaps from "admin/views/LocationMap/routes";
import locationTypes from "admin/views/LocationTypes/routes";
import watermark from "admin/views/Watermark/routes";
import roles from "admin/views/Roles/routes";
import hierarchy from "admin/views/SecurityHierarchy/routes";
import log from "admin/views/AppLog/routes";

const adminMETA = {
  adminPanel: "/admin/",
  adminDashboard: "/admin/dashboard",
  adminLogin: "/admin/login",
  reporting: "/admin/reporting",
  ...docImages,
  ...documents,
  ...users,
  ...customerUsers,
  ...ldapUsers,
  ...branches,
  ...memosAndForms,
  ...departments,
  ...documentConditions,
  ...documentTypes,
  ...documentIndex,
  ...locationMaps,
  ...locationTypes,
  ...languages,
  ...watermark,
  ...roles,
  ...hierarchy,
  ...log,
};

export default adminMETA;

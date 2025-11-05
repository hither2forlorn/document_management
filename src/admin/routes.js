import React from "react";
import metaRoutes from "./meta_routes";
import { VIEW, VIEW_EDIT, VIEW_EDIT_DELETE } from "config/values";

const Dashboard = React.lazy(() => import("admin/views/Dashboard"));

const Users = React.lazy(() => import("admin/views/Users/UserDashboard"));
const AddUser = React.lazy(() => import("admin/views/Users/AddUser"));
const EditUser = React.lazy(() => import("admin/views/Users/EditUser"));
const ViewUser = React.lazy(() => import("admin/views/Users/Profile"));
const ChangePassword = React.lazy(() => import("admin/views/Users/ChangePassword"));

const LdapUsers = React.lazy(() => import("admin/views/UsersLdap/Users"));
const AddLdapUser = React.lazy(() => import("admin/views/UsersLdap/AddUser"));
const EditLdapUser = React.lazy(() => import("admin/views/UsersLdap/EditUser"));

const ListCustomer = React.lazy(() => import("admin/views/UsersCustomer/ListCustomer"));
const ViewCustomer = React.lazy(() => import("admin/views/UsersCustomer/ViewCustomer"));
const EditCustomer = React.lazy(() => import("admin/views/UsersCustomer/EditCustomer"));
const AddCustomer = React.lazy(() => import("admin/views/UsersCustomer/AddCustomer"));

const Roles = React.lazy(() => import("admin/views/Roles/Roles"));
const Log = React.lazy(() => import("admin/views/AppLog/LogsPage"));
const AddRole = React.lazy(() => import("admin/views/Roles/AddRole"));
const EditRole = React.lazy(() => import("admin/views/Roles/EditRole"));

const Branches = React.lazy(() => import("admin/views/Branches/BranchList"));
const AddBranch = React.lazy(() => import("admin/views/Branches/AddBranch"));
const EditBranch = React.lazy(() => import("admin/views/Branches/EditBranch"));
const ViewBranch = React.lazy(() => import("admin/views/Branches/ViewBranch"));

const Departments = React.lazy(() => import("admin/views/Departments/DepartmentDashboard"));
const Reporting = React.lazy(() => import("admin/views/Reporting"));
const AddDepartment = React.lazy(() => import("admin/views/Departments/AddDepartment"));
const EditDepartment = React.lazy(() => import("admin/views/Departments/EditDepartment"));

const HierarchyDashboard = React.lazy(() => import("admin/views/SecurityHierarchy/HierarchyDashboard"));

const AddHierarchy = React.lazy(() => import("admin/views/SecurityHierarchy/AddHierarchy"));

const EditHierarchy = React.lazy(() => import("admin/views/SecurityHierarchy/HierarchyEdit"));

const Attachments = React.lazy(() => import("admin/views/DocumentManagement/AttachmentDashboard"));

const Documents = React.lazy(() => import("admin/views/DocumentManagement/DocumentDashboard"));
const AddDocument = React.lazy(() => import("admin/views/DocumentManagement/AddDocument"));
const ViewDocument = React.lazy(() => import("admin/views/DocumentManagement/ViewDocument"));

const DocumentRedaction = React.lazy(() => import("admin/views/DocumentManagement/components/Redaction"));
const EditDocument = React.lazy(() => import("admin/views/DocumentManagement/EditDocument"));
const PendingDocuments = React.lazy(() => import("admin/views/DocumentManagement/PendingDocumentList"));
const RejectedDocuments = React.lazy(() => import("admin/views/DocumentManagement/RejectedDocumentList"));
const SavedDocuments = React.lazy(() => import("admin/views/DocumentManagement/SavedDocumentList"));
const ExpiringDocuments = React.lazy(() => import("admin/views/DocumentManagement/ExpiredDocumentList"));
const ArchiveDocuments = React.lazy(() => import("admin/views/DocumentManagement/ArchivedDocumentList"));
const FavouriteList = React.lazy(() => import("admin/views/DocumentManagement/FavouriteList"));

const BulkAttachmentUpload = React.lazy(() => import("admin/views/BulkUpload/BulkAttachmentUpload"));
const CodeScanner = React.lazy(() => import("admin/views/DocumentManagement/CodeScanner"));
// const PaperScanner = React.lazy(() => import('admin/views/DocumentManagement/PaperScanner'));
const ViewDocumentInformation = React.lazy(() => import("admin/views/DocumentManagement/ViewDocumentInformation"));

const FormBuilder = React.lazy(() => import("admin/views/Memo/FormBuilder"));
const FormList = React.lazy(() => import("admin/views/Memo/FormList"));
const MemoNew = React.lazy(() => import("admin/views/Memo/MemoNew"));
const MemoView = React.lazy(() => import("admin/views/Memo/MemoView"));
const MemoList = React.lazy(() => import("admin/views/Memo/MemoList"));
const MemoRequestList = React.lazy(() => import("admin/views/Memo/MemoRequestList"));

const DocumentTypes = React.lazy(() => import("admin/views/DocumentTypes/DocumentTypeDashboard"));

const AddDocumentType = React.lazy(() => import("admin/views/DocumentTypes/AddDocumentType"));
const EditDocumentType = React.lazy(() => import("admin/views/DocumentTypes/EditDocumentType"));
const DocumentIndex = React.lazy(() => import("admin/views/IndexType/IndexType"));
const AddDocumentIndex = React.lazy(() => import("admin/views/IndexType/AddIndexType"));
const EditDocumentIndex = React.lazy(() => import("admin/views/IndexType/EditIndexType"));
const DocumentConditions = React.lazy(() => import("admin/views/DocumentConditions/DocumentConditionList"));
const AddDocumentCondition = React.lazy(() => import("admin/views/DocumentConditions/AddDocumentCondition"));
const EditDocumentCondition = React.lazy(() => import("admin/views/DocumentConditions/EditDocumentCondition"));

const LocationMaps = React.lazy(() => import("admin/views/LocationMap/LocationDashboard"));
const AddLocationMap = React.lazy(() => import("admin/views/LocationMap/AddLocation"));
const EditLocationMap = React.lazy(() => import("admin/views/LocationMap/EditLocation"));

const LocationTypes = React.lazy(() => import("admin/views/LocationTypes/LocationTypesList"));
const AddLocationType = React.lazy(() => import("admin/views/LocationTypes/AddLocationType"));
const EditLocationType = React.lazy(() => import("admin/views/LocationTypes/EditLocationType"));

const Languages = React.lazy(() => import("admin/views/Language/LanguageList"));
const AddLanguage = React.lazy(() => import("admin/views/Language/AddLanguage"));
const EditLanguage = React.lazy(() => import("admin/views/Language/EditLanguage"));

const Watermark = React.lazy(() => import("admin/views/Watermark"));

const routes = [
  // { path: metaRoutes.adminHome, exact: true, name: "Home" },
  {
    path: [metaRoutes.adminDashboard],
    exact: true,
    name: "Admin Brief",
    component: Dashboard,
  },
  {
    path: [metaRoutes.adminPanel],
    exact: true,
    name: "Dashboard",
    component: Dashboard,
  },
  // LDAP USERS
  {
    path: metaRoutes.adminLdapUsers,
    exact: true,
    name: "Ldap Users",
    component: LdapUsers,
    permission: {
      name: "ldapUser",
      level: [VIEW, VIEW_EDIT, VIEW_EDIT_DELETE],
    },
  },
  {
    path: metaRoutes.adminLdapUsersAdd,
    exact: true,
    name: "Add User",
    component: AddLdapUser,
    permission: { name: "ldapUser", level: [VIEW_EDIT, VIEW_EDIT_DELETE] },
  },
  {
    path: metaRoutes.adminLdapUsersEdit,
    name: "Edit User",
    component: EditLdapUser,
    permission: { name: "ldapUser", level: [VIEW_EDIT, VIEW_EDIT_DELETE] },
  },
  // USERS
  {
    path: metaRoutes.adminUsers,
    exact: true,
    name: "Users",
    component: Users,
    permission: {
      name: "user",
      level: [VIEW, VIEW_EDIT, VIEW_EDIT_DELETE],
    },
  },
  {
    path: metaRoutes.adminUsersAdd,
    exact: true,
    name: "Add User",
    component: AddUser,
    permission: { name: "user", level: [VIEW_EDIT, VIEW_EDIT_DELETE] },
  },
  {
    path: metaRoutes.adminUsersChangePassword,
    exact: true,
    name: "Change Password",
    component: ChangePassword,
  },
  {
    path: metaRoutes.adminUsersEdit,
    exact: true,
    name: "Edit User",
    component: EditUser,
    permission: { name: "user", level: [VIEW_EDIT, VIEW_EDIT_DELETE] },
  },
  {
    path: metaRoutes.adminUsersView,
    name: "View User",
    component: ViewUser,
  },
  // ROLES
  {
    path: metaRoutes.adminRoles,
    exact: true,
    name: "Roles",
    component: Roles,
    permission: { name: "role", level: [VIEW, VIEW_EDIT, VIEW_EDIT_DELETE] },
  },
  {
    path: metaRoutes.logsList,
    exact: true,
    name: "Logs",
    component: Log,
    permission: { name: "role", level: [VIEW, VIEW_EDIT, VIEW_EDIT_DELETE] },
  },
  {
    path: metaRoutes.adminRolesAdd,
    exact: true,
    name: "Add Role",
    component: AddRole,
    permission: { name: "role", level: [VIEW_EDIT, VIEW_EDIT_DELETE] },
  },
  {
    path: metaRoutes.adminRolesEdit,
    name: "Edit Role",
    component: EditRole,
    permission: { name: "role", level: [VIEW_EDIT, VIEW_EDIT_DELETE] },
  },
  // BRANCHES
  {
    path: metaRoutes.adminBranches,
    exact: true,
    name: "Branches",
    component: Branches,
    permission: { name: "branch", level: [VIEW, VIEW_EDIT, VIEW_EDIT_DELETE] },
  },
  {
    path: metaRoutes.adminBranchesAdd,
    exact: true,
    name: "Add Branch",
    component: AddBranch,
    permission: { name: "branch", level: [VIEW_EDIT, VIEW_EDIT_DELETE] },
  },
  {
    path: metaRoutes.adminBranchesEdit,
    exact: true,
    name: "Edit Branch",
    component: EditBranch,
    permission: { name: "branch", level: [VIEW_EDIT, VIEW_EDIT_DELETE] },
  },
  {
    path: metaRoutes.adminBranchesView,
    name: "View Branch",
    component: ViewBranch,
    permission: { name: "branch", level: [VIEW, VIEW_EDIT, VIEW_EDIT_DELETE] },
  },
  // DEPARTMENTS
  {
    path: metaRoutes.adminDepartments,
    exact: true,
    name: "Departments",
    component: Departments,
    permission: {
      name: "department",
      level: [VIEW, VIEW_EDIT, VIEW_EDIT_DELETE],
    },
  },
  {
    path: metaRoutes.adminDepartmentsAdd,
    exact: true,
    name: "Add Department",
    component: AddDepartment,
    permission: { name: "department", level: [VIEW_EDIT, VIEW_EDIT_DELETE] },
  },
  {
    path: metaRoutes.adminDepartmentsEdit,
    name: "Edit Department",
    component: EditDepartment,
    permission: { name: "department", level: [VIEW_EDIT, VIEW_EDIT_DELETE] },
  },
  // DOCUMENTS

  {
    path: metaRoutes.attachmentsList,
    exact: true,
    name: "Attachments",
    component: Attachments,
    permission: {
      name: "document",
      level: [VIEW, VIEW_EDIT, VIEW_EDIT_DELETE],
    },
  },

  {
    path: metaRoutes.documentsList,
    exact: true,
    name: "Documents",
    component: Documents,
    permission: {
      name: "document",
      level: [VIEW, VIEW_EDIT, VIEW_EDIT_DELETE],
    },
  },
  {
    path: metaRoutes.documentsPending,
    exact: true,
    name: "Pending Documents",
    component: PendingDocuments,
    permission: { name: "document", level: [VIEW, VIEW_EDIT, VIEW_EDIT_DELETE] },
  },
  {
    path: metaRoutes.documentsSaved,
    exact: true,
    name: "Saved Documents",
    component: SavedDocuments,
    permission: { name: "document", level: [VIEW, VIEW_EDIT, VIEW_EDIT_DELETE] },
  },
  {
    path: metaRoutes.documentsRejected,
    exact: true,
    name: "Rejected Documents",
    component: RejectedDocuments,
    permission: { name: "document", level: [VIEW, VIEW_EDIT, VIEW_EDIT_DELETE] },
  },
  {
    path: metaRoutes.documentsExpiring,
    exact: true,
    name: "Expiring Document",
    component: ExpiringDocuments,
    permission: { name: "document", level: [VIEW, VIEW_EDIT, VIEW_EDIT_DELETE] },
  },
  {
    path: metaRoutes.documentsArchived,
    exact: true,
    name: "Archived Document",
    component: ArchiveDocuments,
    permission: { name: "document", level: [VIEW, VIEW_EDIT, VIEW_EDIT_DELETE] },
  },

  {
    path: metaRoutes.favouriteList,
    exact: true,
    name: "Favourite List",
    component: FavouriteList,
    permission: { name: "document", level: [VIEW, VIEW_EDIT, VIEW_EDIT_DELETE] },
  },
  {
    path: metaRoutes.documentsCodeScanner,
    exact: true,
    name: "Code Scanner",
    component: CodeScanner,
    permission: {
      name: "document",
      level: [VIEW, VIEW_EDIT, VIEW_EDIT_DELETE],
    },
  },
  // { path: metaRoutes.documentsPaperScanner, exact: true, name: "Paper Scanner", component: PaperScanner, permission: { name: "document", level: [VIEW, VIEW_EDIT, VIEW_EDIT_DELETE] } },
  // {
  //   path: metaRoutes.documentsBulkUpload,
  //   exact: true,
  //   name: "Bulk Upload",
  //   component: BulkUpload,
  //   permission: { name: "document", level: [VIEW_EDIT, VIEW_EDIT_DELETE] },
  // },
  {
    path: metaRoutes.documentsBulkAttachmentUpload,
    exact: true,
    name: "Bulk Attachment Upload",
    component: BulkAttachmentUpload,
    permission: { name: "document", level: [VIEW_EDIT, VIEW_EDIT_DELETE] },
  },
  {
    path: metaRoutes.documentsAdd,
    exact: true,
    name: "Add Document",
    component: AddDocument,
    permission: { name: "document", level: [VIEW, VIEW_EDIT, VIEW_EDIT_DELETE] },
  },
  {
    path: metaRoutes.documentsPreview,
    exact: true,
    name: "Preview Document",
    component: ViewDocumentInformation,
  },
  {
    path: metaRoutes.documentsEdit,
    exact: true,
    name: "Edit Document",
    component: EditDocument,
    permission: { name: "document", level: [VIEW_EDIT, VIEW_EDIT_DELETE] },
  },
  {
    path: metaRoutes.documentsView,
    name: "View Document",
    component: ViewDocument,
    permission: {
      name: "document",
      level: [VIEW, VIEW_EDIT, VIEW_EDIT_DELETE],
    },
  },
  {
    path: metaRoutes.documentsRedaction,
    name: "Redact Document",
    component: DocumentRedaction,
    permission: {
      name: "document",
      level: [VIEW, VIEW_EDIT, VIEW_EDIT_DELETE],
    },
  },
  // DOCUMENT TYPES
  {
    path: metaRoutes.adminDocumentTypes,
    exact: true,
    name: "Document Types",
    component: DocumentTypes,
    permission: {
      name: "documentType",
      level: [VIEW, VIEW_EDIT, VIEW_EDIT_DELETE],
    },
  },
  {
    path: metaRoutes.adminDocumentTypesAdd,
    exact: true,
    name: "Add Document Type",
    component: AddDocumentType,
    permission: { name: "documentType", level: [VIEW_EDIT, VIEW_EDIT_DELETE] },
  },
  {
    path: metaRoutes.adminDocumentTypesEdit,
    exact: true,
    name: "Add Document Type",
    component: EditDocumentType,
    permission: { name: "documentType", level: [VIEW_EDIT, VIEW_EDIT_DELETE] },
  },
  // INDEX TYPE
  {
    path: metaRoutes.adminIndexType,
    exact: true,
    name: "Index Type",
    component: DocumentIndex,
    permission: { name: "documentType", level: [VIEW, VIEW_EDIT, VIEW_EDIT_DELETE] },
  },
  {
    path: metaRoutes.adminIndexTypeAdd,
    exact: true,
    name: "Add Index Type",
    component: AddDocumentIndex,
    permission: { name: "documentType", level: [VIEW_EDIT, VIEW_EDIT_DELETE] },
  },
  {
    path: metaRoutes.adminIndexTypeEdit,
    exact: true,
    name: "Edit Index Type",
    component: EditDocumentIndex,
    permission: { name: "documentType", level: [VIEW_EDIT, VIEW_EDIT_DELETE] },
  },
  // DOCUMENT CONDITIONS
  {
    path: metaRoutes.adminDocumentConditions,
    exact: true,
    name: "Document Conditions",
    component: DocumentConditions,
    permission: {
      name: "documentCondition",
      level: [VIEW, VIEW_EDIT, VIEW_EDIT_DELETE],
    },
  },
  {
    path: metaRoutes.adminDocumentConditionsAdd,
    exact: true,
    name: "Add Document Condition",
    component: AddDocumentCondition,
    permission: {
      name: "documentCondition",
      level: [VIEW_EDIT, VIEW_EDIT_DELETE],
    },
  },
  {
    path: metaRoutes.adminDocumentConditionsEdit,
    name: "Edit Document Condition",
    component: EditDocumentCondition,
    permission: {
      name: "documentCondition",
      level: [VIEW_EDIT, VIEW_EDIT_DELETE],
    },
  },
  // LOCATION MAP
  {
    path: metaRoutes.adminLocationMaps,
    exact: true,
    name: "Location Maps",
    component: LocationMaps,
    permission: {
      name: "locationMap",
      level: [VIEW, VIEW_EDIT, VIEW_EDIT_DELETE],
    },
  },
  {
    path: metaRoutes.adminLocationMapsAdd,
    exact: true,
    name: "Add Location Maps",
    component: AddLocationMap,
    permission: { name: "locationMap", level: [VIEW_EDIT, VIEW_EDIT_DELETE] },
  },
  {
    path: metaRoutes.adminLocationMapsEdit,
    name: "Edit Location Map",
    component: EditLocationMap,
    permission: { name: "locationMap", level: [VIEW_EDIT, VIEW_EDIT_DELETE] },
  },
  // LOCATION TYPE
  {
    path: metaRoutes.adminLocationTypes,
    exact: true,
    name: "Location Types",
    component: LocationTypes,
    permission: {
      name: "locationType",
      level: [VIEW, VIEW_EDIT, VIEW_EDIT_DELETE],
    },
  },
  {
    path: metaRoutes.adminLocationTypesAdd,
    exact: true,
    name: "Add Location Type",
    component: AddLocationType,
    permission: { name: "locationType", level: [VIEW_EDIT, VIEW_EDIT_DELETE] },
  },
  {
    path: metaRoutes.adminLocationTypesEdit,
    name: "Edit Location Type",
    component: EditLocationType,
    permission: { name: "locationType", level: [VIEW_EDIT, VIEW_EDIT_DELETE] },
  },
  // MEMO with FORM BUILDER
  {
    path: metaRoutes.formList,
    exact: true,
    name: "Form List",
    component: FormList,
    permission: { name: "form", level: [VIEW, VIEW_EDIT, VIEW_EDIT_DELETE] },
  },
  {
    path: metaRoutes.formBuilder,
    name: "Form Builder",
    component: FormBuilder,
    permission: { name: "form", level: [VIEW_EDIT, VIEW_EDIT_DELETE] },
  },
  {
    path: metaRoutes.memoList,
    exact: true,
    name: "Memo List",
    component: MemoList,
    permission: { name: "memo", level: [VIEW, VIEW_EDIT, VIEW_EDIT_DELETE] },
  },
  {
    path: metaRoutes.memoRequestList,
    exact: true,
    name: "Request Memo",
    component: MemoRequestList,
    permission: { name: "memo", level: [VIEW, VIEW_EDIT, VIEW_EDIT_DELETE] },
  },
  {
    path: metaRoutes.memoNew,
    name: "New Memo",
    component: MemoNew,
    permission: { name: "memo", level: [VIEW, VIEW_EDIT, VIEW_EDIT_DELETE] },
  },
  {
    path: metaRoutes.memoView,
    name: "View Memo",
    component: MemoView,
    permission: { name: "memo", level: [VIEW, VIEW_EDIT, VIEW_EDIT_DELETE] },
  },
  // LANGUAGE
  {
    path: metaRoutes.adminLanguages,
    exact: true,
    name: "Language",
    component: Languages,
    permission: {
      name: "language",
      level: [VIEW, VIEW_EDIT, VIEW_EDIT_DELETE],
    },
  },
  {
    path: metaRoutes.adminLanguagesAdd,
    exact: true,
    name: "Add Language",
    component: AddLanguage,
    permission: { name: "language", level: [VIEW_EDIT, VIEW_EDIT_DELETE] },
  },
  {
    path: metaRoutes.adminLanguagesEdit,
    name: "Edit Language",
    component: EditLanguage,
    permission: { name: "language", level: [VIEW_EDIT, VIEW_EDIT_DELETE] },
  },
  // WATERMARK
  {
    path: metaRoutes.adminWatermarks,
    exact: true,
    name: "Watermark",
    component: Watermark,
    permission: { name: "watermark", level: [true] },
  },
  //CUSTOMERS
  {
    path: metaRoutes.adminCustomerList,
    exact: true,
    name: "Customer",
    component: ListCustomer,
    permission: {
      name: "customerUser",
      level: [VIEW_EDIT, VIEW_EDIT_DELETE],
    },
  },
  {
    path: metaRoutes.adminCustomerAdd,
    exact: true,
    name: "Add Customer",
    component: AddCustomer,
    permission: {
      name: "customerUser",
      level: [VIEW, VIEW_EDIT, VIEW_EDIT_DELETE],
    },
  },
  {
    path: metaRoutes.adminCustomerEdit,
    exact: true,
    name: "Edit Customer",
    component: EditCustomer,
    permission: {
      name: "customerUser",
      level: [VIEW, VIEW_EDIT, VIEW_EDIT_DELETE],
    },
  },
  {
    path: metaRoutes.adminCustomerView,
    name: "View Customer",
    component: ViewCustomer,
    permission: {
      name: "customerUser",
      level: [VIEW, VIEW_EDIT, VIEW_EDIT_DELETE],
    },
  },
  // Hierarchy
  {
    path: metaRoutes.adminSecurityHierarchy,
    exact: true,
    name: "Security Hierarchy",
    component: HierarchyDashboard,
    permission: {
      name: "document",
      level: [VIEW, VIEW_EDIT, VIEW_EDIT_DELETE],
    },
  },
  {
    path: metaRoutes.adminAddSecurityHierarchy,
    exact: true,
    name: "Add Hierarchy",
    component: AddHierarchy,
    permission: {
      name: "securityHierarchy",
      level: [VIEW_EDIT, VIEW_EDIT_DELETE],
    },
  },
  {
    path: metaRoutes.adminEditSecurityHierarchy,
    exact: true,
    name: "Edit Hierarchy",
    component: EditHierarchy,
    permission: { name: "document", level: [VIEW_EDIT, VIEW_EDIT_DELETE] },
  },

  //Reporing

  {
    path: metaRoutes.reporting,
    exact: true,
    name: "Reporting",
    component: Reporting,
    permission: {
      name: "reporting",
      level: [true],
    },
  },
];

export default routes;

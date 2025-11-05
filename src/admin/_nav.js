import { banks, dms_features, excludeThisVendor, includeThisFeature, onlyForThisVendor } from "config/bank";
import metaRoutes from "config/meta_routes";

const showUsers = process.env.REACT_APP_SHOW_USERS === "true" ? true : false;

const navItems = [
  {
    name: "Dashboard",
    url: metaRoutes.adminDashboard,
    icon: "fas fa-chart-pie",
  },
  {
    name: "Documents",
    wrapper: {
      // optional wrapper object
      element: "", // required valid HTML5 element tag
      attributes: {}, // optional valid JS object with JS API naming ex: { className: "my-class", style: { fontFamily: "Verdana" }, id: "my-id"}
    },
    class: "", // optional class names space delimited list for title item ex: "text-center"
    icon: "fas fa-copy",
    permission: ["document"],
    children: [
      {
        name: "Add Document",
        url: metaRoutes.documentsAdd,
        icon: "fa fa-plus",
        permission: ["document", "maker", "isAdmin"],
      },
      {
        name: "Drafted",
        url: metaRoutes.documentsSaved,
        icon: "fas fa-save",
        permission: ["document", "maker", "isAdmin"],
      },
      {
        name: "Pending",
        url: metaRoutes.documentsPending,
        icon: "fas fa-hourglass-start",
        permission: ["document"],
      },
      {
        name: "Approved",
        url: metaRoutes.documentsList,
        icon: "fas  fa-file-alt",
        permission: ["document"],
      },
      {
        ...(includeThisFeature(dms_features.UPLOAD_ATTACHMENT_MODAL) && {
          name: "Attachments",
          url: metaRoutes.attachmentsList,
          icon: "fas fa-paperclip",
          permission: ["document"],
       }),
      },
      {
        name: "Rejected",
        url: metaRoutes.documentsRejected,
        icon: "fas fa-ban",
        permission: ["document"],
      },
      {
        name: "Expiring",
        url: metaRoutes.documentsExpiring,
        icon: "fa fa-clock-o",
        permission: ["document"],
      },
      {
        name: "Archived",
        url: metaRoutes.documentsArchived,
        icon: "fas  fa-archive",
        permission: ["archived"],
      },
      {
        name: "Favourite List",
        url: metaRoutes.favouriteList,
        icon: "fas  fa-star",
        permission: ["document"],
      },
      {
        name: "Code Scanner",
        url: metaRoutes.documentsCodeScanner,
        icon: "fas  fa-qrcode",
        permission: ["document"],
      },
      // {
      //   ...(excludeThisVendor(banks.bok.name) && {
      //     name: "Bulk Upload",
      //     url: metaRoutes.documentsBulkUpload,
      //     icon: "icon-docs",
      //     permission: ["document"],
      //   }),
      // },
      // {
      //   name: "Bulk Upload",
      //   url: metaRoutes.documentsBulkAttachmentUpload,
      //   icon: "fas  fa-upload",
      //   permission: ["document"],
      // },
    ],
  },
  // {
  //   name: "Memo/Form Requests",
  //   wrapper: {
  //     // optional wrapper object
  //     element: "", // required valid HTML5 element tag
  //     attributes: {}, // optional valid JS object with JS API naming ex: { className: "my-class", style: { fontFamily: "Verdana" }, id: "my-id"}
  //   },
  //   class: "", // optional class names space delimited list for title item ex: "text-center"
  //   permission: ["form", "memo"],
  //   icon: "icon-docs",
  //   children: [
  //     {
  //       name: "Request Memo",
  //       url: metaRoutes.memoRequestList,
  //       icon: "icon-doc",
  //       permission: ["form"],
  //     },
  //     {
  //       name: "Request Lists",
  //       url: metaRoutes.memoList,
  //       icon: "icon-doc",
  //       permission: ["memo"],
  //     },
  //   ],
  // },
  {
    // title: true,
    name: "Settings",
    wrapper: {
      // optional wrapper object
      element: "", // required valid HTML5 element tag
      attributes: {}, // optional valid JS object with JS API naming ex: { className: "my-class", style: { fontFamily: "Verdana" }, id: "my-id"}
    },
    class: "", // optional class names space delimited list for title item ex: "text-center",
    icon: "fas fa-cog",
    permission: ["role", "branch", "user", "department", "alert", "form", "securityHierarchy", "documentType"],
    children: [
      {
        name: "Role",
        url: metaRoutes.adminRoles,
        icon: "fas fa-user-shield",
        permission: ["role"],
      },
      {
        name: "Branch",
        url: metaRoutes.adminBranches,
        icon: "fas  fa-code-branch",
        permission: ["branch"],
      },
      // {
      //   name: "Forms",
      //   url: metaRoutes.formList,
      //   icon: "icon-doc",
      //   permission: ["form"],
      // },
      {
        name: "Departments",
        url: metaRoutes.adminDepartments,
        icon: "fas fa-building",
        permission: ["department"],
      },
      {
        name: "Security Hierarchy",
        url: metaRoutes.adminSecurityHierarchy,
        icon: "fas fa-sitemap",
        permission: ["securityHierarchy"],
      },
      ...(showUsers
        ? [
          {
            name: "Users",
            url: metaRoutes.adminUsers,
            icon: "fas fa-user",
            permission: ["user"],
          },
        ]
        : []),

      {
        name: "AD Users",
        url: metaRoutes.adminLdapUsers,
        icon: "fas fa-users",
        permission: ["ldapUser"],
      },
      // {
      //   name: "Customers",
      //   url: metaRoutes.adminCustomerList,
      //   icon: "icon-user",
      //   permission: ["customerUser"],
      // },
      {
        name: "Document Types",
        url: metaRoutes.adminDocumentTypes,
        icon: "fas  fa-folder",
        permission: ["documentType"],
      },
      {
        name: "Document Index",
        url: metaRoutes.adminIndexType,
        icon: "fas fa-address-book",
        permission: ["documentType"],
      },
      {
        name: "Location Types",
        url: metaRoutes.adminLocationTypes,
        icon: "fas fa-map-marker-alt",
        permission: ["locationType"],
      },
      {
        name: "Location Maps",
        url: metaRoutes.adminLocationMaps,
        icon: "fas fa-map-marked",
        permission: ["locationMap"],
      },
      {
        name: "Languages",
        url: metaRoutes.adminLanguages,
        icon: "fas  fa-language",
        permission: ["language"],
      },
      {
        name: "Document Conditions",
        url: metaRoutes.adminDocumentConditions,
        icon: "fas fa-award",
        permission: ["documentCondition"],
      },
      {
        ...(onlyForThisVendor(banks.bok.name) && {
          name: "Reporting",
          url: metaRoutes.reporting,
          icon: "fas fa-file",
          permission: ["role"],
        }),
      },

      // {
      //   name: "Watermark",
      //   url: metaRoutes.adminWatermarks,
      //   icon: "icon-briefcase",
      //   permission: ["watermark"],
      // },
    ],
  },
  {
    // title: true,
    name: "Others",
    wrapper: {
      // optional wrapper object
      element: "", // required valid HTML5 element tag
      attributes: {}, // optional valid JS object with JS API naming ex: { className: "my-class", style: { fontFamily: "Verdana" }, id: "my-id"}
    },
    class: "", // optional class names space delimited list for title item ex: "text-center",
    icon: "fas fa-history",
    permission: ["reporting"],
    children: [
      {
        name: "Logs",
        url: metaRoutes.logsList,
        icon: "fas fa-file",
        permission: ["reporting"],
      },
      {
        // ...(onlyForThisVendor(banks.bok.name) && {
        name: "Reporting",
        url: metaRoutes.reporting,
        icon: "fas fa-bug",
        permission: ["reporting"],
        // }),
      },
    ],
  },
];

function getChildren(permissions, children) {
  const items = [];
  children.forEach((nav) => {
    const permission = nav.permission;

    if (permission) {
      let isAccessible = false;

      // Handle exclusive permission for "maker" on "Saved"
      if (nav.name === "Drafted" || nav.name === "Add Document" && permission.includes("maker")) {
        isAccessible = permissions["maker"]; // Allow only if "maker" is true
      } else {
        // General permission check
        permission.forEach((r) => {
          if (permissions[r]) {
            isAccessible = true;
          }
        });
      }

      if (isAccessible) items.push(nav);
    } else {
      if (Object.keys(nav).length !== 0) items.push(nav);
    }
  });
  return items;
}

function getNavbarItems(permissions) {
  const items = [];
  navItems.forEach((nav) => {
    const permission = nav.permission;
    if (permission) {
      let isAccessible = false;
      permission.forEach((r) => {
        if (permissions[r]) {
          isAccessible = true;
        }
      });
      if (isAccessible) {
        nav.children = nav.children ? getChildren(permissions, nav.children) : null;
        items.push(nav);
      }
    } else {
      items.push(nav);
    }
  });
  return {
    items: items,
  };
}

export default getNavbarItems;

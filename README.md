# PaperBank Documentation

PaperBank © 2020 is a integration of following systems .

- Document Management System
- Business Process Automation

**Business Process Automation** is the solution for digital transformation of complex business
processes. Overall benefits of the BPMS are:

- Digital Transformation
- Better Organizational Control
- Workflow Automation
- Centralized Management of Documents
- Optimized Processes
- Increased Agility
- Ensured Compliance
- Risks Reduction
- Transparency

# Document Management Component

- System provides features of document download, upload, retrieve, view, print, delete, zoom in / zoom out, rotate-up, rotate-down, rotate-right, rotate-left, etc.
- System also facilitates the file size compression features to maintain the storage capacity of the file.
- System allows Search Engines with filter and fuzzy text search.
- System supports watermarking to discourage users from a screen capture or mobile capture from the computer or device screens. Watermarks can be configured to appear through viewing, printouts, e-mails, or in a downloaded copy.
- System supports Microsoft Office, .Pdf, .Jpeg, .png etc.
- System provides the native feature of Document View inclusive of various Metadata of document. Audit Logs, check out logs and Hourly Access are also provided to the system user.
- System provides a workflow for maker and checker for uploading and validating of document, configuration, publish, and management of documents.
- System provides a separate module for expiring and pending documents list.
- System provides bulk upload of documents features.
- System provides retention policy features.
- System provides the capabilities to trace the physical filing location within the system. This feature supports users to know the physical location of the stored file easily.

# Business Process Automation Component

- System provides the dynamic form and workflow creation features.
- System enables the dynamic creation of a Forms from the admin side and can be activated and deactivated as per the admin requirement.
- System provides a tabular list of currently operating Approval Request and its Flow in between users while maintaining workflow logs.
- System provides a feature of document attachment within the workflow and backed with encrypted file system.
- System provides unique features of a group or single approval system.
- System has metadata for the attachments considering load balancing of bandwidth usage.
- System provides the standard and summary-based Approval Report to print and preserves as sign copy.
- System provides a unique identifier for each request that can be used to track the Approval Request.
- System provides highly secure password policy features.
- System provides the user authentication to be secure i.e. even without the IP blocking the system is secure and client-side will not be able to request the admin side details.
- System provides the rich-text comment box feature that enables the users to work as in word documents.
- System provides Approval monitoring and tracking features.
- System provides document attachment features integrated with workflow and its supports Microsoft Office, PDF, JEPG, PNG etc.
- System allows the user to preview the attached document inside the application and can give feedback or write an opinion on assigned request.
- System supports secure and efficient storage thus ensures scalability.
- System supports encryption of documents and can be stored in server farm environments.
- System provides highly secure portal for Customer Onboarding Services through internet.
- System Provides customer login, which enables the customer to request, which also has another layer of OTP authentication.
- System provides the customer request execution portal for bank, which is integrated with the Forms and workflow within the bank environment.
- System provides a separate user interface for customer and bank users in the HTML forms which has a secure window to provide integrated relation between both the parties.
- System provides to-and-fro of the request for the customer and bank, which is fluent and robust.
- System provides the features of email notification, alerts or can be integrate with SMS gateway.
- System provides API integration with third-party solution.
- System is device responsive and supports both the Windows and Linux environment.

# Documentation

To generate documentation we are using JSDOC plugin

```sh
npm run jsdoc
```

# Resources for development!

**Security**

- [Web security essentials - Security perspective](https://www.sohamkamani.com/blog/2017/01/16/web-security-essentials/)
- [High order components - for Route Authorization](https://reactjs.org/docs/higher-order-components.html)
- [Handling authentication with nodejs](https://medium.freecodecamp.org/learn-how-to-handle-authentication-with-node-using-passport-js-4a56ed18e81e)
- [Using high order components for Authenticated Routing](https://www.codementor.io/sahilmittal/using-higher-order-components-for-authenticated-routing-i1hcp6pc6)
- [Role based authorization REACT](https://hackernoon.com/role-based-authorization-in-react-c70bb7641db4)

**Document management**

- [React file upload - easy way](https://programmingwithmosh.com/javascript/react-file-upload-proper-server-side-nodejs-easy/)
- [FTP upload library - used by us](https://programmingwithmosh.com/javascript/react-file-upload-proper-server-side-nodejs-easy/)
- [React image viewer](https://github.com/xiabingwu/react-viewerjs)
- [Fuzzy search implementation in nodejs](https://fusejs.io/)

**Active Directory**

- [Active directory attributes list](https://docs.secureauth.com/display/KBA/Active+Directory+Attributes+List)
- [Setting up LDAP on windows server](https://blogs.msdn.microsoft.com/microsoftrservertigerteam/2017/04/10/step-by-step-guide-to-setup-ldaps-on-windows-server/)
- [LDAPjs - AD authentication library for nodejs](http://ldapjs.org/)

**Database**

- [Sequelize ORM](http://docs.sequelizejs.com/)

**GUI**

- [Material Page layout examples](https://material-ui.com/getting-started/page-layout-examples/)
- [Core UI](https://coreui.io/demo/#icons/coreui-icons.html)
- [React bootstrap 4 library](https://reactstrap.github.io/)
- [FontAwesome4 cheatsheet](https://fontawesome.com/v4.7.0/cheatsheet/)

**REDUX**

- [Redux guide](https://medium.com/free-code-camp/understanding-redux-the-worlds-easiest-guide-to-beginning-redux-c695f45546f6)

**Production Guide**

- [Express Tutorial Part 7: Deploying to production](https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs/deployment)
- [NodeJS: Best Practices for Production](https://www.freecodecamp.org/news/nodejs-best-practices-for-production-5b173983d14b/)
- [Node.js Production Environment - a Step-By-Step Guide for Startups](https://blog.risingstack.com/nodejs-production-environment-for-startups/)

**Documentation & Reporting**

- [JSDOC for documentation](https://devhints.io/jsdoc)
- [DocumentationJS for documentation](https://github.com/documentationjs/documentation#documentation)
- [TableToExcel in React Component](https://www.npmjs.com/package/@linways/table-to-excel)

**Database Changes**
| Date | Table | Column |
| :------------ | :----------: | --------: |
| `2022-2-1` | security_hierarchy | `departmentId` |
| `2022-2-15` | documents| `returnedbychecker` `returnedMessage` |
| `2022-2-15` | documents| `sendtochecker` |
| `2022-3-23` | documents| `branchId` |
| `2022-3-28` | security_hierarchy| `type` |
| `2022-4-28` | location_map| `multiple_hierarchy`
| `2022-5-9` | security_hierarchy| `branchId` |
| `2022-5-9` | logs| `body` |
| `2022-5-9` | documents| `note` |
| `2022-5-9` | documents| `description` |
| `2022-5-9` | document_indicies| `validation` |
| `2022-5-9` | document_indicies| `condition` |
| `2022-5-9` | document_audits| `type` |
| `2022-5-9` | document_audits| `message` |
| `2022-5-9` | documents| `userGroupId` |
| `2022-5-9` | users| `userGroupId` |
| `2022-9-9` | security_hierarchy| `multipleHierarchy` |


**Application Changes**

**Frontend Navigation**
_nav.js -> permission control the view / hide -show the navigation
routes.js -> controls the view - blanks if permission do not match.

**Notes**
Logs
Document logs -> document_audits table, approval, reject with message, approval cycle - attachment and document
Attachment logs -> logs table

**Document View**
Audit logs Nav bar => Visible for ['user'] permission
Reporting => Visible for ['role'] permission

**BOK deployment**
Add this package in package.json
"oracledb": "^5.2.0",
And in document.js route uncomment oracledb import

for switching to pnpm
pnpm i cropperjs draft-js react-draft-wysiwyg
#   d o c u m e n t _ m a n a g e m e n t  
 
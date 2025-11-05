# Document Management System Docs for Bank of Kathmandu(BOK)
1. **Navbar**: 
   - User profile:
      - My profile :
      - Ability to Change Logged User Password
      - View User Profile
      - View User Detailed Login time and logout Time

      - Edit user:
         1. Ability to Change the Role of user such as[Super Admin,Department Admin,Branch Admin,Branch Maker,Branch Checker]
         2. Change User Status.
         3. Change User profile Picture.
         4. Change The Status of User.
         5. Change The Department 
         6. Expiry Date of User
         7. Change Security Hierarchy 

   - User Manual: 
        - Ability to Download General DMS User Manual in pdf Format.
   - Logout: 
         - Logout From Document Management System.2. Dashboard**:
     - Front Page
     - Ability to View Document Type, Delete logs, Most Used Tags, Total 
Document,
    - Notification
2. **Dashboard**:
     - Front Page
     - Ability to View Document Type, Delete logs, Most Used Tags, Total Document,
       
3. **Documents:**
     - Documents Section
       1. Add Document
          - Enter BOKID or Search through Bok CBS. 
          - Customer Name,URL,ApproveDate,TBOKID,Identifier and Document Name will be auto populated from CBS once BOKID is Added.
          - Archive The Document 
          - Assign Location map, Department, Checker, Language, Status,Document Condition and Security Hierarchy.
          - Assign the document type.
          - Once Document is submitted, user can upload an attachment also download the access log report in excel format.
          - Ability to preview PDF file, Image file or documents file.
          - Change The Security level of Document 
             - Note: If security Level is low on document Then it is visible to all department. 
             - If Security Level is Medium only Selected Department can view the document
             - If Security level is set to High then only specific user can view the document.
       2. Document Listing
       3. Document Filtering of Document listing
           - Ability To filter Document list based on Document Type,Asociated ID,OCR Search, Department, Status, Their Status, Document added from to Document by picking date.
      - Expiring Section
         - It shows Expired Document list as well as ability to assign the weeks for the expiry of documents.
      - Pending Section
          - It show the Pending Document list
      - Rejected Document List
          - It show the Rejected Document List
      - Saved Documents
         - It shows Saved Document List.
      - Archived Document List
         - Shows list of archived documents.
      - Favourite Document List
         - Shows Favourite Document List
      - Code Scanner
         - Ablility to Scan the Document.
         - Ability to find by entering identifier.
      - Bulk upload
         - Ability to upload multiple file.
         - Supports Drag And Drop multiple files.
         - can upload multiple files with multiple indexing.
         - click the arrow sign to put in different Indexing.
         - you can rejoin by clicking join button.
         - once that click index to create document. 

4. **Settings:**
   - Roles
       1. List the Role of the User
       2. Add Roles, Give or change permission based on roles type.
   - Branches
       1. Add branch(Note: only admin or central head is allowed to add branch)
          - Add Branch by Name, Address, District, Branch Code, Province, Postal Code, Contact, Website.
          - Add to add branch logo.
       2. List Branch
          - Show branch list.
          - Ability to Edit and Delete Branch.
          - Search Branch 
   - Department
       1.  Shows the list of Parent departments.
       2.  Add Department 
            - If Parent Category is set to none it becomes Parent Department.
            - User can add sub department by selecting respective parent Category 
            - User can add color to the department for easy identification
       3. Ability to edit and delete parent departments
          - In order to edit and delete sub departments user have to manually select  parent department 
   - Users
       1. Add Users, their role, branch,Identity No(example:-Super Admin,Maker,Checker)
       2. Edit user info and Delete user.
       3. Ability to filter users list by their status, role, branch and department
   - AD Users(Active Directory)
          - ( Note: Active Directory (AD) is Microsoft's proprietary directory service. It runs on Windows Server and enables administrators to manage permissions and access to network resources. LDAP is a tool for extracting and editing data stored in Active Directory and other compatible directory service providers. LDAP’s primary function is enabling users to find data about organizations, persons, and more. It accomplishes this goal by storing data in the LDAP directory and authenticating users to access the directory. A user cannot access information stored within an LDAP database or directory without first authenticating (proving they are who they say they are). The database typically contains user, group, and permission information and delivers requested information to connected applications. LDAP authentication involves verifying provided usernames and passwords by connecting with a directory service that uses the LDAP protocol Such as Active Directory. )
       1. Add and Manage LADP Users
       2. List LADP users
   - Document Types
       1. Add Document Types.(example:- kyc, Account Opening , Debit slip, Bank Statement.)
       2. Add Sub Document Types.(example:- Kyc subtypes:- Password, Identity Card, Driving License)
       2. View List, Edit and Delete Document Types.
   - Document Index
       1. Add Document Index to Document Type
       2. list Document Index
       3. Filter Document Index type
   - Location Types
       - ( Note: The location type describes one or more locations within a department. )
       1. Add Location Types such as where document is located in department.(Example:- Top floor, Locker no, Drawer)
       2. Edit or Delete Location types
   - Location Map
       1. List added location map
       2. Add location Map by their name, location type, parent category and security hierarchy.
          - If security hierarchy is set to none then all users will able to view location.
   - Languages
       1. Add Languages
       2. View List, Edit and Delete languages.
   - Document Condition
       1. Add document condition.
       2. View Document condition, Edit and Delete Language.





 **Other Important Technical Notes**:  
 - In CONSTANT everyone can see the doc
 - KYC (Know Your Customer)
    - KYC check is the mandatory process of identifying and verifying the client's identity when opening an account and periodically over time.


- Basic DMS FLOW
   - user---->Application(FrontEnd)----->(dms server,ftpserver,database) -- Locker

- Maker & checker flow(RBB)
   - Maker---->Creates,Uploads,Sends_to_checker 
   - Checker----->Accepts,reject,message
   - doc->if approved by checker attachment/can't be uploaded..

- Ability to Switch Vendor:
   - change default section: 

     - #####gentech-dms-api####
      - >selectVendor.js  
         - default: selectedVendor = banks.bok; or banks.rbb;

     - #####gentech-dms####
      - >bank.js    
         - default: selectedVendor = banks.bok.name; or banks.rbb.name;

    - ######Important in BOK(Bank of Kathmandu)####
         - execute view.sql query for Bok manually



      
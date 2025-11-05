# Document Management System Docs
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
          - Add Document Name, Change Document Status, Location map, Expiry Date, Language, Assign the Department, Change Document Condition, Change Document Condition, Security Hierarchy, Checker. 
          - Can't Change Identity Number and Email an
          - Document identifier
          - Ability to add Document tags to easily identify document
          - OTP(One Type Password) verification
          -Quick OCR, Ability to Encrypt files, Archive The Document 
          - Change The Security level of Document 
             - Note: If security Level is low on document Then it is visible to all department. 
             - If Security Level is Medium only Selected Department can view the document
             - If Security level is set to High then only specific user can view the document.
       2. Document Listing
       3. Document Filtering of Document listing
           - Ability To filter Document list based on Document Type, Department, Status, Their Status, Document added from to Document by picking date.
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
         - Supports Drag And Drop multiple files
         - Manually uploading files using file browser dialog box.
4. **Settings:**
   - Roles
       1. Manage the Role of the User
       2. Give permission based on roles type.
   - Branches
       1. Add branch(Note: only admin or central head is allowed to add branch)
         - Add Branch by Name, Address, District, Branch Code, Province, Postal Code, Contact, Website.
         - Add to add branch logo
       2. List Branch
          - Show branch list.
          - Ability to Edit and Delete Branch.
          - Search Branch 
       3. Department
          - Shows the list of Parent departments.
          - Add Department 
            - If Parent Category is set to none it becomes Parent Department.
            - User can add sub department by selecting respective parent Category  
          - Ability to edit and delete parent departments
          - In order to edit and delete sub departments user have to manually select  parent department 
       5. Security Hierarchy
          - Add Security Hierarchy
          - Edit or Delete Security hierarchy
             -Two Hierarchy
                -Super Hierarchy
                   -Root Hieratchy
                -CONSTANT
                   -Everyone can See 
       6. Users
          - Add Users, their role, branch,Identity No
          - Edit user info and Delete user.
          - Ability to filter users list by their status, role, branch and department
       7. AD Users(Active Directory)
          - ( Note: Active Directory (AD) is Microsoft's proprietary directory service. It runs on Windows Server and enables administrators to manage permissions and access to network resources. )
          - ( Note: LDAP is a tool for extracting and editing data stored in Active Directory and other compatible directory service providers. )
          - ( Note: LDAP’s primary function is enabling users to find data about organizations, persons, and more. It accomplishes this goal by storing data in the LDAP directory and authenticating users to access the directory. )
          - ( Note: A user cannot access information stored within an LDAP database or directory without first authenticating (proving they are who they say they are). The database typically contains user, group, and permission information and delivers requested information to connected applications. )
          - ( Note: LDAP authentication involves verifying provided usernames and passwords by connecting with a directory service that uses the LDAP protocol Such as Active Directory. )
          - Add and Manage LADP Users
          - List LADP users
       8. Document Types
          - Add Document Types for eg. Customer information,Account Opening ,Bank Statement.
       9. Doument Index
          - Add Document Index to Document Type
          - list Document Index
          - Filter Document Index type
      10. Location Types
          - ( Note: The location type describes one or more locations within a organization. )
          - Add Location Types
      11. Location Map
          - List added location map
          -  Add location Map by their name, location type, parent category and security hierarchy.
          -If security hierarchy is set to none then all users will able to view location.
      12. Languages
          - Add Languages
      13. Document Condition
          - Add document condition








Note:- In CONSTANT everyone can see 
     -Root Hierarchy 

         -head branch
           -bagmati_Province
               -kritipur branch
                   -unit_Db_23
                     -file [File on unit is access by kritipur_branch,head branch and rooot hierarchy.]

           -Thamel branch


      KYC (Know Your Customer) is today a significant element in the fight against financial crime and money laundering, and customer identification is the most critical aspect as it is the first step to better perform in the other stages of the process.


user-------->Application(FrontEnd)--------------->(dms server,ftpserver,database) -- Locker

Maker & checker flow(RBB)

Maker---->Creates,Uploads,Sends_to_checker 
Checker----->Accepts,reject,message

doc->if approved by checker attachment/can't be uploaded..

-vendor selection:
change default section: 1.selectVendor.js    ---gentech-dms-api

                       -> default: selectedVendor = banks.bok; or banks.rbb;


                        2.2.bank.js    --- gentech-dms

                        ->default: selectedVendor = banks.bok.name; or banks.rbb.name;
  

  ----------------------------IN BOK(Bank of Kathmandu)------------------------
  1.Can create Document from bulk upload 
        - can be upload document with multiple indexing.
        - click the arrow sign to put in different Indexing.
        - you can rejoin by clicking join button.
        - once that click index to create document 
        - You can do with other for indexing..

  2.Document info Can be populated from BOK CBS system
        -Search through cbsid by typeik BOK and click search through cbs and select desire id then click store on select one.
        -once id found type the bokid and click + plus button
        -Data will be auto populated...


        execute view.sql query for Bok
        ----------------------------------------------------------------------------

        npm install querystring
        debugger;   to check error



      
# Centralized and Decentralized in Document Management System

1. **Centralized**: Centralization refers to the process in which activities involving planning and decision-making within an organization are concentrated to a specific leader or location. In a centralized organization, the decision-making powers are retained in the head office, and all other offices receive commands from the main office. It has ability to create user, assign the role, manage the document.
   example: Bank of Kathmandu(BOK).

2. **Decentralized**: Decentralization is the process by which the activities of an organization, particularly those regarding planning and decision making, are distributed or delegated away from a central, authoritative location or group. It has multiple Branches, Province and Departments. In DMS Document created from one branch can't be view by other branches. For example Document created in Kritipur Branch Can be accessible by its head branch but cannot be viewed by other branch like thamel branch or any other province. In Decentralized it is in hierarchical order. If a document need to be accessed by other department then unit it created.
   example: Rastriya Banijya Bank(RBB).

# Difference Features between Rbb and bok features

| RBB                                                                  |                                        BOK                                         |
| :------------------------------------------------------------------- | :--------------------------------------------------------------------------------: |
| Decentralized                                                        |                                    Dentralized                                     |
| Tags                                                                 |                                      No Tags                                       |
| It has Features such as Encryption files,Quick OCR, OTP verification | Document data is populated by Api, It has CBS System and Data is poulated by BOKID |
| Does not have reporting                                              |                                     Reporting                                      |
| Security Level                                                       |                        security hierarchy & security level                         |

# Code files for onlyForThisVendor, excludedThisVendor for this vendor.

**1. selectVendor.js(general-dms-api)** -> It has switch case for selection of vendor where user can switch the vendor. for eg. [default: selectedVendor = banks.rbb.name;]
It has function to include or exclude features for the vendor and to get Full name and domain name of selected Bank.

**2. bank.js(general-dms)** -> It is frontend. It is needed alongside selectVendor.js to switch the bank or to include and exclude features for the vendor.

**3. BulkAttachmentUpload.js(general-dms)** -> Uploads multiple Documents as well as well as indexing. Only For This Vendor. When indexing..

- Only BOK ID is visible when the vendor bok is selected but is invisible for rbb. Bokid can search throuh CBS.
- Customer name, Approved Date, URL, TBOKID,Document Name are only visible to vendor BOK and they are not implemented on RBB and they are autopopulated once correct bokid is inserted.

**4. AddBranch.js(general-dms)** -> It includes functions to add branch. SQl Branch id is excluded in rbb but is required and necessary field in BOK.
**5. BranchList.js(general-dms** -> This js includes branchlist. Only admin or centeral head is allowed to add branch and this only applies to RBB. SOL branch id is excluded in RBB.
**6. ViewBranch.js(general-dms)** -> bok.png image is displayed if the vendor is bok other wise in rbb rbb.png is displayed.
**7. DocumentForm.js** -> It is Add Document Form

- Only BOK ID is visible when the vendor BOK is selected but is invisible for rbb. Bokid can search throuh CBS.
- Customer name, Approved Date, URL, TBOKID,Document Name are only visible to vendor BOK and they are not implemented on RBB and they are autopopulated once correct bokid is inserted.
- Tags is only Visible to RBB but are excluded in BOK.
- Expiry Date is excuded in BOK vendor.
- Encryption Files, Quick OCR, Require OPT Verification is included only in RBB.

**8. DocumentTypeIndex.js(general-dms)** ->
**9. SearchDocument.js** -> This js includes function to search,filter the documents. If Vendor is BOK(banks.bok.name) then associative ID is visible to BOK else only on RBB the Suggested Tags section is displayed where user can search document using tags. is Archived? selection is only enabled on BOK bank.

**10. AttachmentListTable.js(general-dms)** -> It is a component which shows documents name once document is uploaded.
Section such as Document Type, Indexes, Associated IDs only available on vendor BOK. Document can be downloaded once name is clicked. Edit button is excluded is RBB. Scan is only implemented in Rbb.

**11. DocumentInformation.js(general-dms)** -> It is a component which show documents information once document information is submitted. only in rbb there is feature section where it shows information about once Quick OCR,Encrypted,OTP is selected.

**12. DocumentListTable.js(general-dms)** -> It is the important component shows the list of document created. BOK ID table data is only available on BOK vendor. Action Section is only available on RBB vendor.

**13. AddDocumentType.js(general-dms)** -> This component is needed for creating document type. Associate ID is only available on BOK vendor. Associate id has boolean value(true or false). They are required or optional.

**14. EditDocumentType.js(general-dms)** -> It is used to edit document type. Associate ID is only available and editable on BOK vendor.

**15. LocationMapForm.js(general-dms)** -> Shows the List of location map documents. Hierarchy section is only available on rbb.

**16. Roles.js(general-dms)** -> Shows the List of roles created and roles can be searched. Hierarchy section is filtered from BOK. So it is not available.

**17. UserForm.js(general-dms)** -> This component includes Form to create user. Custom Input Form is used.

- Date of Birth, Gender, Phone Number, Security Hirarchy are excluded in vendor BOK.
- Ability to upload profile picture is removed in Bok Vendor.
- Every user is department in BOK.
- If branch id is not found then department section is visible to BOK.
- If department id is not found then branch section is visible to BOK.

// import React, { useState, useEffect } from "react";
// import DocumentTypeIndex from "../../DocumentManagement/DocumentTypeIndex";
// import { Form, ListGroup, ModalHeader, Progress } from "reactstrap";
// import {
//   Card,
//   CardHeader,
//   CardBody,
//   CardFooter,
//   Label,
//   Button,
//   Modal,
//   ModalBody,
//   ModalFooter,
// } from "reactstrap";

// const DocIndexTypeModel = (props) => {
//   const [uploadModal, setUploadModal] = useState(false);
//   const [indexValues, setIndexValues] = useState([]);
//   const [editModal, setEditModal] = useState(false);
//   const [associatedBokIDS, setAssociatedBokIDS] = useState([]);
//   const [associatedBokIDSEdit, setAssociatedIDSEdit] = useState([]);
//   const [docTypeChildren, setDocTypeChildren] = useState([]);
//   const [documentTypeId, setDocumentTypeId] = useState("");
//   const [docIndexValuesforEdit, setDocIndexValuesforEdit] = useState([]);
//   const [hasChildrenDocument, setHasChildrenDocument] = useState(false);
//   const [state, setState] = useState({
//     loading: null,
//     selectedFiles: [],
//   });
//   //   const isUploadingDocument = state.loading !== null;
//   const tempDocData = props.documentData || {};

//   const closeModal = () => {
//     setUploadModal(false);
//     setEditModal(false);
//     setAssociatedIDSEdit([]);
//     setDocumentTypeId("");
//     setDocIndexValuesforEdit([]);
//   };

//   const handleSetIndexValues = (listValues) => {
//     setIndexValues(listValues);
//   };

//   const handleAssociatedId = (listValues) => {
//     setAssociatedIDSEdit(listValues);
//     setAssociatedBokIDS(listValues);
//   };

//   const handleChange = (event) => {
//     const name = event.target.name;
//     const value = event.target.value;
//     if (name === "documentTypeId") {
//       setDocumentTypeId(value);
//       hasChilderen(value);
//       setHasChildrenDocument(hasChilderen(value));
//     }
//   };

//   function hasChilderen(documentTypeId) {
//     const data = props.documentTypes.filter(
//       (doc) => doc.parentId == documentTypeId
//     );
//     return data.length > 0 ? true : false;
//   }

//   return (
//     <div>
//       <Modal isOpen={uploadModal}>
//         <ModalHeader>DOCUMENT TYPE</ModalHeader>
//         <div
//           style={
//             showPreview
//               ? {
//                   display: "grid",
//                   gridTemplateColumns: "repeat(5, 1fr)",
//                   gridTemplateRows: "repeat(5, 1fr)",
//                 }
//               : { padding: 20 }
//           }
//         >
//           <div className="left-modal" style={{ gridArea: " 1 / 1 / 6 / 3" }}>
//             <Form onSubmit={uploadFile}>
//               <ModalBody id="attachment">
//                 <DocumentTypeIndex
//                   disableDocumentTypeSelectFromEditIndex={editModal}
//                   //   associatedBokIDSEdit={associatedBokIDSEdit}
//                   fromAttachmentModal={docTypeChildren}
//                   setIndexValues={handleSetIndexValues}
//                   setAssociatedBokIDS={handleAssociatedId}
//                   associatedBokIDS={associatedBokIDS}
//                   documentData={tempDocData}
//                   forAttachment={true}
//                   handleDocumentTypeChange={handleChange}
//                   documentTypeId={documentTypeId}
//                   indexValues={docIndexValuesforEdit}
//                 />

//                 {!hasChildrenDocument && (
//                   <>
//                     <CustomInput
//                       label="Notes"
//                       name="notes"
//                       type="textarea"
//                       defaultValue={notes ? notes : ""}
//                       onChange={notesChange}
//                     />

//                     <div className="alert alert-primary mt-2">
//                       * note : if document type is empty then you must add sub
//                       document type from document type sidebar
//                     </div>
//                   </>
//                 )}
//               </ModalBody>
//               <ModalFooter>
//                 <CustomSubmit
//                   color="primary"
//                   // isDisabled={isUploadingDocument}
//                 >
//                   {editModal ? "Update" : "Submit"}
//                 </CustomSubmit>

//                 <Button color="secondary" onClick={closeModal}>
//                   Cancel
//                 </Button>
//               </ModalFooter>
//             </Form>
//           </div>

//           {/* {showPreview ? (
//             <div
//               className="right-modal"
//               style={{ padding: 20, gridArea: "1 / 3 / 6 / 6" }}
//             >
//               <embed src={src} width="100%" height="100%" />
//             </div>
//           ) : null} */}
//         </div>
//       </Modal>
//     </div>
//   );
// };

// export default DocIndexTypeModel;

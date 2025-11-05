import React, { useState, useEffect, useMemo, useRef } from "react";
import { Form, ListGroup, ModalHeader, Progress } from "reactstrap";
import { downloadAttachment, deleteAttachment } from "../../api";
import _, { split } from "lodash";
import { SERVER_URL } from "admin/config/server";
import { toast } from "react-toastify";
import DocumentTypeIndex from "../../DocumentTypeIndex";
import { banks, dms_features, excludeThisVendor, includeThisFeature, onlyForThisVendor } from "config/bank";
import { connect } from "react-redux";
import { Card, CardHeader, CardBody, CardFooter, Label, Button, Modal, ModalBody, ModalFooter } from "reactstrap";
import { getOneAttachments, postAttachment, previewAttachment, updateAttachment, updateParentDocumentIndex } from "../../api/attachment";

import { CustomInput, CustomSelect } from "admin/components";
import { fetchAttachmentVersions, handleScanOcr, sendAttachmentToChecker, sendOtp, sendToChecker } from "../../api/document";
import OTPVerification from "../OTPVerification";
import { Chip, LinearProgress } from "@mui/material";
import LinearProgressWithLabel from "admin/components/CustomProgressBar";
import CustomTable from "../CustomTable";
import CustomSubmit from "admin/components/CustomSubmit";
import { VIEW, VIEW_EDIT, VIEW_EDIT_DELETE } from "config/values";
import { background, Menu, MenuButton, MenuList } from "@chakra-ui/react";
import { InputGroup, InputGroupAddon, Input } from "reactstrap";
import { ChevronDownIcon, DeleteIcon } from "@chakra-ui/icons";
import useAttachmentColumns from "./useAttachmentColumns";
import validateIndexValues from "admin/views/Util/validateIndexes";
import { Row, Col } from "reactstrap";
import AttachmentMakerChecker from "./AttachmentMakerChecker";
import { CloseCircleOutlined } from "@ant-design/icons";
import getSortedItems from "admin/views/Util/filterHierarchyData";
import { ButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem } from "reactstrap";
import useUnsavedChangesWarning from "admin/hooks/useUnsavedChangesWarning";
import VersionModel from "utils/versionModel";

const AttachmentListTable = (props) => {
  const p = props.permissions || {};
  const { showInAttachment } = props.showInAttachment ? props : [];
  const userIsChecker = props.userProfile.id == props.makerOrChecker?.assignedTo;
  const userIsMaker = props.userProfile.id == props.makerOrChecker?.initiatorId;
  const options_maker = props.options_maker;
  const isSuperAdmin = props.userProfile.id === 1 || props.userProfile.hierarchy == "Super-001";
  const tempDocData = props.documentData || {};
  const doc = props.documentData ? props.documentData : {};
  const docTypeChildren = getSortedItems(props.documentTypes, props.documentData?.documentTypeId) || [];
  const [textInput, setTextInput] = useState("");
  const [indexValues, setIndexValues] = useState([]);
  const [redactFile, setRedactFile] = useState(false);
  const [associatedBokIDS, setAssociatedBokIDS] = useState([]);
  const [attachmentId, setAttachmentId] = useState("");
  const [hasChildrenDocument, setHasChildrenDocument] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [autoCompleteValue, setautoCompleteValue] = React.useState("BOK");
  let [ocrDetail, setOcrDetail] = useState("");
  const [documentTypeId, setDocumentTypeId] = useState("");
  let attachments = props.attachments || props.allAttachments;
  const isPrimary = props.isPrimary;
  const [dropdownOpen, setdropdownOpen] = useState(false);
  const [state, setState] = useState({
    loading: null,
    selectedFiles: [],
  });

  const [showPreview, setshowPreview] = useState(false);
  const [checkerId, setCheckerId] = useState(null);
  const [modal, setModal] = useState(false);
  const [uploadModal, setUploadModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [attachmentModel, setAttachmentModel] = useState(false);
  const [associatedBokIDSEdit, setAssociatedIDSEdit] = useState([]);
  const [docIndexValuesforEdit, setDocIndexValuesforEdit] = useState([]);
  const [userDetails, setUserDetails] = React.useState({});
  const [OTPModal, setOTPModal] = useState(false);
  const [verifiedOTP, setVerifiedOTP] = useState(false);
  const [notes, setNotes] = useState("");
  const [selectedImage, setSelectedImage] = useState();
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const isUploadingDocument = state.loading !== null;
  const [src, setSrc] = useState("");
  const [Prompt, setDirty, setPristine] = useUnsavedChangesWarning("Are you sure want to exit ?");
  const [opened, setOpened] = useState(false);
  const [watermarkPosition, setWatermarkPosition] = useState(1);
  const [versionData, setVersionData] = useState([])

  const handleInputChange = async (event) => {
    await setTextInput(event.target.value);
  };

  attachments.forEach((ele, index) => {
    ele.serial = index + 1;
  });

  const toggle = () => setModal(!modal);

  function startLoading() {
    document.getElementById("loading").style.display = "unset";
  }
  function finishLoading() {
    document.getElementById("loading").style.display = "none";
  }

  // checker list filter
  let checkers_list = [];
  props.allFields.checkerList?.map((row) => {
    const foundSameName = props.allFields.checkerList.filter((data) => data.name === row.name);
    if (foundSameName.length >= 2) {
      return checkers_list.push({
        ...row,
        name: row.name + " - " + row.email,
      });
    }
    if (row.id != props.userProfile.id) return checkers_list.push(row);
  });

  // Browse file
  const onSelectedFile = (event) => {
    event.preventDefault();
    let files = event.target.files;

    const selectedFilesLength = Object.keys(state.selectedFiles).length;
    if (selectedFilesLength > 0) {
      Object.entries(files).map(([key, value], index) => {
        files = {
          ...state.selectedFiles,
          [selectedFilesLength + 1]: value,
        };
      });
    }
    Object.entries(files).map(([key, value], index) => {
      const uppercaseName = value.name.toUpperCase();
      const splitName = uppercaseName.split(".").slice(0, -1).join(".");
      let filterDocType = docTypeChildren.filter((ele) => ele.name == splitName);
      if (filterDocType.length > 0 && value) {
        let assignTo = _.assignIn(value, { docType: filterDocType[0] });
        files = {
          ...files,
          [key]: assignTo,
        };
      }
    });

    if (!props.documentData.isApproved) setDirty();

    setState({
      ...state,
      selectedFiles: files,
    });
  };

  // Document send to checker
  const handleSendDocumentToChecker = (message = "") => {
    if (!window.confirm("Do you want to Sent this file to Checker?")) {
      return;
    }
    const id = props.documentData.id;
    sendToChecker({ id, message }, (err, json) => {
      if (json?.success) {
        toast.success("Document has been send to Checker.");
        window.history.back();
      } else {
        toast.error(json.message);
      }
      setPristine();
    });
  };

  // Attachment send to checker
  const handleSendAttachmentToChecker = (message = "") => {
    if (!window.confirm("Do you want to Sent attachment this file to Checker?")) {
      return;
    }

    if (!checkerId) return toast.warn("Please select checker Id");

    const id = props.documentData.id;
    sendAttachmentToChecker({ id, userId: checkerId, message }, (err, json) => {
      if (json.success) {
        toast.success("Document has been send to Checker.");
        window.history.back();
      } else {
        toast.error(json.message);
      }
    });
  };

  const downloadFile = (id) => {
    const p = props.permissions;
    const cw = props.customWatermarkId;

    if (p.download) {
      if (window.confirm("Do you want to download the file?")) {
        // Start loading indicator
        startLoading();

        // Fetch the file details
        previewAttachment(id, cw, async (err, json) => {
          finishLoading(); // Stop loading indicator

          if (err) {
            console.error("Error fetching file:", err);
            toast.warn("Failed to fetch the file details. Please try again.");
            return;
          }

          if (json.success) {
            const downloadLink = SERVER_URL + json.filePath; // Construct the file URL

            try {
              // Use fetch to download the file as a Blob
              const response = await fetch(downloadLink, {
                method: "GET",
                headers: {
                  "Content-Type": "application/octet-stream", // Ensure correct content type
                },
              });

              if (!response.ok) {
                throw new Error("Failed to fetch the file.");
              }

              // Convert the response into a Blob
              const blob = await response.blob();
              const urlObject = window.URL.createObjectURL(blob);

              // Create a temporary link to trigger the download
              const link = document.createElement("a");
              link.href = urlObject;
              link.download = json.filePath.split("/").pop(); // Extract the file name from the path
              document.body.appendChild(link);
              link.click(); // Trigger the download
              document.body.removeChild(link); // Clean up
              window.URL.revokeObjectURL(urlObject); // Clean up URL object
            } catch (error) {
              console.error("Error downloading the file:", error);
              toast.warn("Failed to download the file. Please try again.");
            }
          } else {
            toast.warn(json.message); // Show warning message if download fails
          }

          props.loadDocument(); // Refresh the document list
        });
      } else {
        window.alert("File download canceled.");
      }
    } else {
      window.alert("You do not have permission to download this file.");
    }
  };


  const deleteFile = (id) => {
    if (window.confirm("Do you want to delete the file?")) {
      deleteAttachment(id, (err, json) => {
        if (!err && json && json.success) {
          toast.success("Success!");
          props.loadDocument();

          if (props.afterDelete) {
            props.afterDelete();
          }
          window.location.reload();
        } else {
          if (!json.success) {
            toast.error(json.message);
          } else toast.error("Error occurred!");
        }
      });
    }
  };

  // send otp and open OTP modal if
  const otpSend = () => {
    if (
      state.selectedFiles.length > 0 ||
      (typeof state.selectedFiles == "object" && Object.keys(state.selectedFiles)?.length > 0)
    ) {
      uploadFile();
    } else {
      toast.warn("Please select a file");
    }
  };

  // open default scanner
  const ScanOcr = () => {
    // handleScanOcr((err, data) => {
    setIsScannerOpen(true);
    toast.info("Opening Scanner");

    document.getElementById("file_upload_normal").click();
    // open scanenr with electron app
    if (window?.electron?.dms?.openScanner) {
      window?.electron?.dms?.openScanner();
    }

    setTimeout(() => {
      setIsScannerOpen(false);
    }, 10000);
    // });
  };

  const uploadModalToggler = () => {
    setUploadModal(!uploadModal);
    setAssociatedIDSEdit([]);
    setDocumentTypeId("");
    setDocIndexValuesforEdit([]);
  };
  const closeModal = () => {
    setUploadModal(false);
    setEditModal(false);
    setAssociatedIDSEdit([]);
    setDocumentTypeId("");
    setDocIndexValuesforEdit([]);
  };

  const handleVerifyOtp = (value) => {
    setVerifiedOTP(value);
    uploadFile();
    setUploadModal(false);
  };

  const handleWatermarkChange = (e) => {
    console.log("change of value in function", e.target.value);
    setWatermarkPosition(e.target.value);
  };

  function setLoadingState(percentage) {
    setState({
      loading: percentage,
    });
  }

  const notesChange = (e) => {
    const { name, value } = e.target;
    setNotes(value);
  };

  // react-table columns
  const columns = useAttachmentColumns({
    downloadFile,
    deleteFile,
    handleEditButton,
    props,
    isPrimary,
    userIsMaker,
    p,
    showInAttachment,
    handleModelView
  });

  const uploadFile = (e) => {
    if (e) e.preventDefault();
    const fileData = new FormData();

    // validation for indexes
    const { exit, errorMessages } = validateIndexValues(documentTypeId, indexValues, props.allFields.documentTypes);
    if (exit) {
      setValidationErrors(errorMessages);
      setState({
        ...state,
        loading: null,
      });
      setshowPreview(false);
      return;
    }

    const DocumentTypeObject = props?.documentTypes.find((doc) => doc.id == documentTypeId);

    // Add Indexes parent - indexed for parent BOK only without any attachment file
    if (hasChildrenDocument || (DocumentTypeObject?.uploadOptional && state.selectedFiles.length == 0)) {
      fileData.append("itemId", props.documentId);
      fileData.append("documentTypeId", documentTypeId);
      fileData.append("documentType", DocumentTypeObject.name);
      fileData.append("associatedIds", JSON.stringify(associatedBokIDS) || "");
      fileData.append("indexValues", JSON.stringify(indexValues));
      updateParentDocumentIndex(props.documentId, fileData, (err, data) => {
        if (err) {
          toast.error("Error uploading parent id");
          setUploadModal(false);
        } else {
          toast.success("Sucessfully updated");
          setUploadModal(false);
          setHasChildrenDocument(false);
        }
      });
      setNotes("");
      setDocIndexValuesforEdit([]);

      props.loadDocument();

      return;
      // Runs when uploading or eding attachment
    } else if (
      state.selectedFiles.length > 0 ||
      (typeof state.selectedFiles == "object" && Object.keys(state.selectedFiles).length > 0) ||
      editModal
    ) {
      fileData.append("fileType", "");
      fileData.append("itemId", props.documentId);
      fileData.append("documentTypeId", documentTypeId);
      fileData.append("redaction", redactFile);
      fileData.append("itemType", "document");
      fileData.append("notes", notes);

      fileData.append("customerName", userDetails.NAME || "");
      fileData.append("url", userDetails.URL || "");
      fileData.append("approvedDate", userDetails.ApprovedDate || "");
      fileData.append("attachmentId", attachmentId);
      fileData.append("indexValues", JSON.stringify(indexValues));
      fileData.append("associatedIds", JSON.stringify(editModal ? associatedBokIDSEdit : associatedBokIDS) || "");

      // update new indexes only for BOK
      if (editModal) {
        updateAttachment(props.documentId, fileData, (err, data) => {
          if (err) {
            toast.error("Error updating attachment");
            setUploadModal(false);
          } else {
            toast.success("Sucessfully updated");
            setUploadModal(false);
          }
        });
        setOTPModal(false);
        setEditModal(false);
        setNotes("");
        setDocIndexValuesforEdit([]);

        props.loadDocument();

        return;
      }
      // apend files data in formdata
      for (var file in state.selectedFiles) {
        fileData.append("file", state.selectedFiles[file]);
      }

      // validation if Associated id is required
      if (
        includeThisFeature(dms_features.ASSOCIATED_IDS) &&
        DocumentTypeObject?.isAssociatedIDReq &&
        associatedBokIDS?.length < 1
      ) {
        setState({
          ...state,
          loading: 0,
        });
        return toast.warn("Please select valid associated bokid");
      } else {
        //upload files to ftp
        postAttachment(fileData, setLoadingState, (err, data) => {
          if (err) {
            toast.error(err?.response?.data?.message || "Failed to upload");

            return setState({
              ...state,
              // selectedFiles: [],
              loading: null,
            });
          } else if (!data?.success) {
            toast.error(data?.message);
            props.loadDocument();
          } else {
            setState({
              ...state,
              selectedFiles: [],
              loading: null,
            });
            setUploadModal(false);
            toast.success("File upload success");
            props.loadDocument();
          }
        });
      }
    } else {
      return toast.warn("No files selected!");
    }
    setState({
      ...state,
      selectedFiles: [],
      loading: null,
    });
    setshowPreview(false);
    setDocIndexValuesforEdit([]);

    setNotes("");
    setOTPModal(false);
  };

  const handleSetIndexValues = (listValues) => {
    setIndexValues(listValues);
  };
  const handleAssociatedId = (listValues) => {
    setAssociatedIDSEdit(listValues);
    setAssociatedBokIDS(listValues);
  };
  const toggleFilePreview = (e) => {
    // e.preventDefault(); // preventing document upload on file upload
    setshowPreview(!showPreview);
    setSrc(URL.createObjectURL(e));
  };

  const handleChange = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    if (name === "documentTypeId") {
      setDocumentTypeId(value);
      hasChilderen(value);
      setHasChildrenDocument(hasChilderen(value));
    }
  };

  // maker and checker selection
  const handleChangeMakerChecker = (event) => {
    const { name, value } = event.target;
    setCheckerId(value);
  };

  const handleDropdown = () => {
    setdropdownOpen(!dropdownOpen);
  };

  function hasChilderen(documentTypeId) {
    const data = props.documentTypes.filter((doc) => doc.parentId == documentTypeId);
    return data.length > 0 ? true : false;
  }

  // handleEdit button
  async function handleEditButton(id) {
    setEditModal(true);
    uploadModalToggler();
    getOneAttachments(id, (error, data) => {
      if (error) alert("error");
      else {
        setAttachmentId(id);
        setNotes(data?.attachment[0]?.notes || "");
        const newAssociatedID = data?.associatedIds.map((row) => {
          return { ...row, label: row.value };
        });
        setAssociatedIDSEdit(newAssociatedID || []);
        setDocumentTypeId(data?.attachment[0]?.documentTypeId);

        // fileter only valid data. Example data.attachment includes null or undeifned data
        const result = data.attachment.filter((att) => att.documentIndexValueId);
        setDocIndexValuesforEdit(result);
      }
    });
  }
  // handleEdit button
  async function handleModelView(attachmentId, attachmentName) {
    setAttachmentModel(true)
    fetchAttachmentVersions(attachmentId, attachmentName)
      .then((result) => {
        // Set version data
        setVersionData(result?.data);
      })
      .catch((error) => {
        if (error.status = 404) {
          toast.info("This Attachment has no versioning");
        }
        console.error("Error fetching versions:", error);
      });
  }

  const handleAttachmentClose = () => {
    setAttachmentModel(false)
    setVersionData([])
  }

  const removeImage = (params) => {
    const filtervalue = Object.values(state?.selectedFiles).filter((newVal) => newVal.name != params);
    setState({ ...state, selectedFiles: filtervalue });
    setSrc("");
  };

  /* Display file before uploading */
  function imagePreview() {
    if (state.selectedFiles && state.selectedFiles.length !== 0) {
      return (
        <div className="d-flex d-inline" style={{ gap: "1rem" }}>
          {Object.values(state.selectedFiles).map((file) => {
            var ext = file.name.split(".").pop();
            const fileTypes = ["png", "jpeg", "jpg"];
            return (
              <div style={{ position: "relative" }}>
                <img
                  src={
                    fileTypes.includes(ext)
                      ? URL.createObjectURL(file)
                      : ext == "pdf"
                        ? "img/900px-Pdf-2127829.png"
                        : "img/file.png"
                  }
                  onClick={() => toggleFilePreview(file)}
                  alt="Thumb"
                  height={60}
                  className="rounded"
                />
                <CloseCircleOutlined
                  style={{
                    position: "absolute",
                    color: "#f35269",
                  }}
                  onClick={() => removeImage(file.name)}
                  type="button"
                  id="removeImage1"
                  className="btn-rounded"
                />
                <p className="mt-2">{file.name}</p>
              </div>
            );
          })}
        </div>
      );
    }
  }

  //
  // With Model - bok and cititzen
  //
  const indexTypeModal = (
    <Modal isOpen={uploadModal}>
      <ModalHeader>Upload Attachment</ModalHeader>
      <div
        style={
          showPreview
            ? {
              display: "grid",
              gridTemplateColumns: "repeat(5, 1fr)",
              gridTemplateRows: "repeat(5, 1fr)",
            }
            : { padding: 20 }
        }
      >
        <div className="left-modal" style={{ gridArea: " 1 / 1 / 6 / 3" }}>
          <Form onSubmit={uploadFile}>
            <ModalBody id="attachment">
              <DocumentTypeIndex
                disableDocumentTypeSelectFromEditIndex={editModal}
                associatedBokIDSEdit={associatedBokIDSEdit}
                fromAttachmentModal={docTypeChildren}
                setIndexValues={handleSetIndexValues}
                setAssociatedBokIDS={handleAssociatedId}
                associatedBokIDS={associatedBokIDS}
                documentData={tempDocData}
                forAttachment={true}
                validationErrors={validationErrors}
                handleDocumentTypeChange={handleChange}
                documentTypeId={documentTypeId}
                indexValues={docIndexValuesforEdit}
              />
              {!hasChildrenDocument && !editModal && (
                <>
                  <div className="custom-file mb-4" style={{ zIndex: 0, marginTop: "1rem" }}>
                    <Input
                      onChange={onSelectedFile}
                      type="file"
                      className="custom-file-input"
                      name="file"
                      multiple
                      id="file"
                      aria-describedby="inputGroupFileAddon01"
                    />

                    <Label style={{ cursor: "pointer" }} className="custom-file-label" id="file-label" htmlFor="file">
                      {state.selectedFiles && state.selectedFiles.length !== 0
                        ? Object.values(state.selectedFiles).map((file) => {
                          return file.name + ", ";
                        })
                        : "Choose a file..."}
                    </Label>
                  </div>

                  {/* preview file */}
                  {state.selectedFiles && state.selectedFiles.length !== 0 && (
                    <>
                      <div className="d-flex d-inline">
                        {Object.values(state.selectedFiles).map((file) => {
                          var ext = file.name.split(".").pop();
                          const uppercaseName = file?.name.toUpperCase();
                          const splitName = uppercaseName.split(".").slice(0, -1).join(".");
                          const fileTypes = ["png", "jpeg", "jpg"];
                          return (
                            <>
                              {/* preview */}
                              <div
                                style={{
                                  textAlign: "center",
                                  width: "150px",
                                  margin: "0 8px",
                                }}
                              >
                                {/* button */}
                                {/* <input
                                  onClick={() => removeImage(file.name)}
                                  type="button"
                                  id="removeImage1"
                                  value="x"
                                  className="btn-rounded"
                                /> */}

                                {/* img */}
                                {/* <div onClick={toggleFilePreview} className="imagebox"  style={image}> */}
                                <img
                                  style={{
                                    width: "100px",
                                    height: "100px",
                                    objectFit: "cover",
                                    position: "relative",
                                  }}
                                  onClick={() => toggleFilePreview(file)}
                                  src={
                                    fileTypes.includes(ext)
                                      ? URL.createObjectURL(file)
                                      : ext == "pdf"
                                        ? "img/900px-Pdf-2127829.png"
                                        : "img/file.png"
                                  }
                                  alt="Thumb"
                                  className="img-rounded "
                                />
                                <CloseCircleOutlined
                                  style={{
                                    color: "#f35269",
                                    position: "absolute",
                                  }}
                                  onClick={() => removeImage(file.name)}
                                  type="button"
                                  id="removeImage1"
                                  className="btn-rounded"
                                />
                                {/* </div> */}
                                <p
                                  className="mt-2"
                                  style={{
                                    textAlign: "center",
                                  }}
                                >
                                  {file.name}
                                </p>

                                {/* feature for Everest */}
                                {/* <strong>
                                                                        {file?.docType
                                                                            ? "Doc Type:" +
                                                                              splitName
                                                                            : "Doc Type:Not Available"}
                                                                    </strong> */}
                              </div>
                              <br></br>
                              {/* {imagePreview()} */}
                              {/* <Button onClick={toggleFilePreview} type="primary" >
                      Preview File
                    </Button> */}
                            </>
                          );
                        })}
                      </div>
                    </>
                  )}

                  {/* loading  */}
                  {isUploadingDocument && <LinearProgress variant="determinate" value={state.loading} />}
                </>
              )}

              {!hasChildrenDocument && (
                <>
                  <CustomInput
                    label="Notes"
                    name="notes"
                    type="textarea"
                    defaultValue={notes ? notes : ""}
                    onChange={notesChange}
                  />

                  <div className="alert alert-primary mt-2">
                    * note : if document type is empty then you must add sub document type from document type sidebar
                  </div>
                </>
              )}
            </ModalBody>
            <ModalFooter>
              <CustomSubmit color="primary" isDisabled={isUploadingDocument}>
                {editModal ? "Update" : "Submit"}
              </CustomSubmit>

              <Button color="secondary" onClick={closeModal}>
                Cancel
              </Button>
            </ModalFooter>
          </Form>
        </div>
        {showPreview ? (
          <div className="right-modal" style={{ padding: 20, gridArea: "1 / 3 / 6 / 6" }}>
            <embed src={src} width="100%" height="100%" />
          </div>
        ) : null}
      </div>
    </Modal>
  );

  //
  // without Model
  //
  return (
    <>
      <Card className="shadow">
        {attachmentModel && versionData.length > 0 &&
          <VersionModel
            open={attachmentModel}
            onClose={handleAttachmentClose}
            data={versionData} // Pass the attachments
          />}
        {Prompt}
        {/* HEADING START */}
        <CardHeader>
          <p className="h5">
            <i className="fa fa-paperclip" /> Attachments
          </p>
        </CardHeader>

        {/* HEADING END */}
        <CardBody>
          {/* Modal for OCR*/}
          <Modal isOpen={modal} toggle={toggle}>
            <ModalBody id="attachment">
              {ocrDetail}
              {/* {attachments.find(x=>x.id == row.id).attachmentDescription} */}
              {/* {attachments[index].attachmentDescription} */}
            </ModalBody>
            <ModalFooter>
              <Button color="secondary" onClick={toggle}>
                Cancel
              </Button>
            </ModalFooter>
          </Modal>

          {/* React Table */}
          <CustomTable columns={columns} data={attachments} />
        </CardBody>

        {includeThisFeature(dms_features.UPLOAD_ATTACHMENT_MODAL) && indexTypeModal}

        {/* Dont let user upload attachment in RBB */}
        {(p.attachment === VIEW_EDIT || p.attachment === VIEW_EDIT_DELETE) &&
          (includeThisFeature(dms_features.DEFAULT_MAKER_CHECKER_DOCUMENTS) && !isSuperAdmin
            ? !props.documentData.isApproved || p?.maker
            : true) && (
            <CardFooter>
              {/* if document is archived then upload is hidden */}

              {isPrimary &&
                // permission for opening document.
                // document properties => isArchived =false, props.isApproved =fasle  && checker doesnot need to ,
                //  dont allow cheker to upload files when

                props.documentData.isArchived == false ? (
                <>
                  {props.documentData.isApproved == false && userIsChecker ? null : (
                    <>
                      {!includeThisFeature(dms_features.UPLOAD_ATTACHMENT_MODAL) && (
                        <>
                          <div className="custom-file mb-4" style={{ zIndex: 0 }}>
                            <Input
                              onChange={onSelectedFile}
                              multiple
                              type="file"
                              className="custom-file-input"
                              name="file"
                              id="file_upload_normal"
                              aria-describedby="inputGroupFileAddon01"
                            />
                            <Label
                              style={{
                                cursor: "pointer",
                              }}
                              className="custom-file-label"
                              id="file-label"
                              htmlFor="file"
                            >
                              {state.selectedFiles && state.selectedFiles.length !== 0
                                ? Object.values(state.selectedFiles).map((file) => file.name + ", ")
                                : "Choose a file..."}
                            </Label>
                          </div>
                          {imagePreview()}

                          {isUploadingDocument && (
                            <div className="mb-2">
                              <LinearProgressWithLabel value={state.loading} />
                            </div>
                          )}
                        </>
                      )}

                      {/* Fake scanner only for rbb*/}
                      {/* {onlyForThisVendor([banks.rbb.name]) && p?.scanning ? ( */}
                      {window?.electron?.dms?.openScanner ? (
                        <button onClick={ScanOcr} disabled={isScannerOpen} className="btn btn-sm ml-3 float-right">
                          <i className="fas fa-qrcode"></i> Scan
                        </button>
                      ) : null}
                      {/* ) : null} */}

                      <CustomSubmit
                        onClick={!includeThisFeature(dms_features.UPLOAD_ATTACHMENT_MODAL) ? otpSend : uploadModalToggler}
                        className="btn btn-sm btn-primary text-white float-right"
                        isDisabled={isUploadingDocument}
                      >
                        <i className="fas fa-upload"></i> Upload
                      </CustomSubmit>
                    </>
                  )}
                </>
              ) : null}

              {OTPModal && <OTPVerification handleVerifyOtp={handleVerifyOtp} />}

              {/* Attachment maker and checker */}
              {includeThisFeature(dms_features.DEFAULT_MAKER_CHECKER_DOCUMENTS) &&
                doc.isApproved &&
                (options_maker.attachmentMakerChecker?.length > 0 || options_maker.pendingApprovalAttachments?.length > 0) &&
                p?.maker && (
                  <AttachmentMakerChecker
                    functionProps={{
                      handleChangeMakerChecker,
                      handleSendAttachmentToChecker,
                      doc,
                      options_maker,
                      checkers_list,
                      props,
                    }}
                  />
                )}
              {showPreview ? (
                <div style={{ height: "100vh", marginTop: "10px" }}>
                  <embed src={src} width="100%" height="100%" />
                </div>
              ) : null}
            </CardFooter>
          )}

        {/* </div> */}
      </Card>

      {/* Resubmit for attachment*/}
      <div>
        {!props.documentData.sendToChecker &&
          !props.documentData.isApproved &&
          // attachments.length > 0 &&
          !props.documentData.returnedByChecker &&
          userIsMaker && (
            <div>
              <div className="d-flex justify-content-between px-2 py-10 my-10">
                <label>Send Document to Checker</label>
                {onlyForThisVendor([banks.citizen.name, banks.epf.name]) && (
                  // <Button
                  //   title="Send to Checker"
                  //   className="btn-primary text-white"
                  //   onClick={() => handleSendDocumentToChecker()}
                  // >

                  //   Send to Checker
                  // </Button>
                  // <ButtonDropdown isOpen={dropdownOpen} toggle={handleDropdown}>
                  //   <DropdownToggle caret>Button Dropdown</DropdownToggle>
                  //   <DropdownMenu>
                  //     <DropdownItem header>Header</DropdownItem>
                  //     <DropdownItem disabled>Action</DropdownItem>
                  //     <DropdownItem>Another Action</DropdownItem>
                  //     <DropdownItem divider />
                  //     <DropdownItem>Another Action</DropdownItem>
                  //   </DropdownMenu>
                  // </ButtonDropdown>
                  <>
                    <ButtonDropdown isOpen={dropdownOpen} toggle={handleDropdown}>
                      <Button id="caret" color="primary" onClick={() => handleSendDocumentToChecker(textInput)}>
                        <i className="fa fa-paper-plane" style={{ marginRight: "6px" }}></i>
                        Send To Checker
                      </Button>
                      <DropdownToggle caret color="primary" />
                      <DropdownMenu
                        style={{
                          marginLeft: "-6rem",
                          marginRight: "2rem",
                        }}
                      >
                        <InputGroup>
                          <Input placeholder="Your Review..." onChange={handleInputChange} />
                          <Button color="primary" onClick={() => handleSendDocumentToChecker(textInput)}>
                            <i className="fa fa-paper-plane" style={{ marginRight: "6px" }}></i>
                            Send
                          </Button>
                        </InputGroup>
                      </DropdownMenu>
                    </ButtonDropdown>
                  </>
                )}
              </div>
            </div>
          )}
      </div>
    </>
  );
};

export default connect((state) => ({
  userProfile: state.userProfile,
  users: state.allFields.users,
  allFields: state.allFields,
}))(AttachmentListTable);

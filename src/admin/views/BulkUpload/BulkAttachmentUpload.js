import React, { useState, useEffect } from "react";
import ImageDropzone from "./components/ImageDropzone";
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  CardFooter,
  Form,
  Modal,
  ModalBody,
  ModalFooter,
  Label,
  Input,
  Col,
  Row,
  FormGroup,
} from "reactstrap";
import Select from "react-select";

import _ from "lodash";
import ImageCropper from "./components/ImageCropper";
import { useDrag, useDrop } from "react-dnd";
import { toast } from "react-toastify";
import { server } from "admin/config/server";
import { connect } from "react-redux";
import { CustomInput, CustomSelect } from "admin/components";
import { getIdentifier } from "config/form";
import metaRoutes from "config/meta_routes";
import { ItemTypes } from "./item";
import CustomCancel from "admin/components/CustomCancel";

import DocumentTypeIndex from "../../views/DocumentManagement/DocumentTypeIndex";
import { banks, dms_features, includeThisFeature, onlyForThisVendor } from "config/bank";
import CustomAutoComplete from "admin/components/CustomAutoComplete";
import { convertDate } from "utils/converDate";
import { useSelector } from "react-redux";
function startLoading() {
  document.getElementById("loading").style.display = "unset";
}

function finishLoading() {
  document.getElementById("loading").style.display = "none";
}

//handler to change position of the options in select input from current to desired index
// const defaultSelectHandler = (from, to, arr) => {
//   arr.splice(to, 0, arr.splice(from, 1)[0]);
// };

// Form Strat Here
const IndexForm = (props) => {
  // extract current user's department id.
  let document = props.document || {};
  // hide security high
  const securityLevels = props.securityLevels;

  // let tempDepartment;
  let users = props.checkerList;

  if (props.document.securityLevel == 2) {
    users = users.filter((user) => user.departmentId == document.departmentId);
  }
  // // setting departments in state according to the user's department

  // const indexIs = props.departments.findIndex(
  //   (dept) => dept.id === tempDepartment
  // );
  // const [departments, setDepartments] = useState(props.departments);
  // defaultSelectHandler(indexIs, 0, departments);

  const index = props.document.index;
  // added label, value for react select
  props.users.forEach((user) => {
    user.label = user.name;
    user.value = user.id;
  });
  const [documentTypeId, setDocumentTypeId] = useState(document.documentTypeId ? String(document.documentTypeId) : "");
  const [dataAll, setDataAll] = useState(props);
  const [userDetails, setUserDetails] = React.useState({});

  // defaultSelectHandler(1, 0, dataAll.securityLevels);

  const handleChange = (e) => {
    e.preventDefault();
    const value = e.target.value ? e.target.value : e.target.checked;
    props.onChange({
      name: e.target.name,
      value: value,
      index: index,
    });
  };
  function handleSelectChange(value, { action, removedValue }) {
    switch (action) {
      case "remove-value":
      case "pop-value":
        if (removedValue && removedValue.id) {
          return;
        }
        break;
      case "clear":
        value = [];
        break;
      default:
        break;
    }

    props.onChange({
      name: "userAccess",
      value: value,
      index: index,
    });
  }
  const setIndexValues = (listValues) => {
    props.documentSetIndex({
      documentIndexList: listValues,
    });

    props.onChange({
      name: "documentIndex",
      value: listValues,
      index: index,
    });
  };
  const handleDocumentChange = (e) => {
    setDocumentTypeId(e.target.value);

    props.onChange({
      name: e.target.name,
      value: e.target.value,
      index: index,
    });
  };

  const generateUserFromCBS = async (autoCompleteValue, option) => {
    if (autoCompleteValue !== "BOK") {
      setUserDetails(option);

      // const include_attribute = ["CPRno", "ApprovedDate", "CustName"];
      option.name = option.BOKID;
      option.approved_date = convertDate(option.ApprovedDate);
      option.url = option.URL;
      option.customer_name = option.CustName;
      option.isApproved = true;
      option.otherTitle = option?.BOKID + "-" + option?.CustName + "-" + option?.ApprovedDate + "-" + option?.CPRno;

      props.onChange({
        name: "all_values",
        value: option,
        index: index,
        add_all_value: true,
      });
    }
  };
  return (
    <Form>
      <Card>
        <Row>
          <Col md={7}>
            <CardBody className="component-content-container">
              <input className="d-none" type="text" name="index" defaultValue={index} />

              {onlyForThisVendor(banks.bok.name) && (
                <>
                  <CustomAutoComplete
                    // object={document}
                    // isEdit={true}
                    label="BOK ID"
                    value="BOK"
                    generateUserFromCBS={generateUserFromCBS}
                    name="name"
                    // errors={validationErrors ? validationErrors.name : null}
                    onChange={handleChange}
                    documentFormBata
                  />
                  <CustomInput
                    // object={document}
                    required
                    label="Customer Name"
                    defaultValue={userDetails?.CustName}
                    name="customer_name"
                    // errors={validationErrors ? validationErrors.identifier : null}
                    readOnly
                  />
                  {/* {console.log(dateFormat(userDetails.ApprovedDate, "yyyy-MM-dd"))} */}

                  <CustomInput
                    // object={document}

                    type="date"
                    defaultValue={convertDate(userDetails.ApprovedDate)}
                    label="Approved Date"
                    name="approved_date"
                    // errors={validationErrors ? validationErrors.identifier : null}
                    readOnly
                  />
                  <CustomInput
                    // object={document}

                    defaultValue={userDetails?.URL}
                    label="URL"
                    name="url"
                    // errors={validationErrors ? validationErrors.identifier : null}
                    readOnly
                  />
                  <CustomInput
                    // object={document}

                    defaultValue={userDetails?.CPRno}
                    label="TBOKID"
                    name="CPRno"
                    // errors={validationErrors ? validationErrors.identifier : null}
                    readOnly
                  />
                  <CustomInput
                    required
                    label="Document Name"
                    name="otherTitle"
                    readOnly={onlyForThisVendor(banks.bok.name)}
                    defaultValue={
                      userDetails?.BOKID &&
                      userDetails?.CustName &&
                      userDetails?.ApprovedDate &&
                      userDetails?.CPRno &&
                      userDetails?.BOKID +
                        "-" +
                        userDetails?.CustName +
                        "-" +
                        userDetails?.ApprovedDate +
                        "-" +
                        userDetails?.CPRno
                    }
                    onChange={props.handleChange}
                  />
                </>
              )}

              <CustomInput
                object={document}
                isEdit={true}
                label="Identifier"
                name="identifier"
                value={document.identifier}
                readOnly
              />
              {onlyForThisVendor([banks.rbb.name, banks.citizen.name]) && (
                <>
                  {/* <CustomInput
                    object={document}
                    isEdit={true}
                    label="Organization Name"
                    name="name"
                    onChange={handleChange}
                  /> */}

                  <CustomInput
                    required
                    object={document}
                    isEdit={true}
                    label="Document Name"
                    name="otherTitle"
                    onChange={handleChange}
                  />
                </>
              )}
              <CustomSelect
                label="Language"
                name="languageId"
                options={dataAll.languages}
                object={document}
                isEdit={true}
                hasDefaultValue
                defaultValue
                onChange={handleChange}
              />

              <CustomSelect
                label="Document Condition"
                name="documentConditionId"
                options={dataAll.documentConditions}
                object={document}
                hasDefaultValue
                defaultValue
                isEdit={true}
                onChange={handleChange}
              />

              <CustomSelect
                required
                label="Status"
                name="statusId"
                options={props.statuses}
                hasDefaultValue
                defaultValue
                object={document}
                isEdit={true}
                // defaultValueOnlyForCombobox={props.statuses[0].id}
                onChange={handleChange}
              />

              <CustomSelect
                required
                label="Location Map"
                name="locationMapId"
                options={props.locationMaps}
                object={document}
                isEdit={true}
                defaultValue={props.defaultValues.locationMapId ? props.defaultValues.locationMapId : null}
                onChange={handleChange}
              />

              {!props.defaultValues.branchId ? (
                <CustomSelect
                  label="Department"
                  name="departmentId"
                  options={props.departments}
                  object={document}
                  isEdit={true}
                  defaultValue={props.defaultValues.departmentId ? props.defaultValues.departmentId : null}
                  required={document.securityLevel == 2 ? true : false}
                  onChange={handleChange}
                />
              ) : (
                ""
              )}
              {!props.defaultValues.departmentId ? (
                <CustomSelect
                  label="Branch"
                  name="branchId"
                  options={props.branches}
                  object={document}
                  isEdit={true}
                  defaultValue={props.defaultValues.branchId ? props.defaultValues.branchId : null}
                  onChange={handleChange}
                />
              ) : (
                ""
              )}
              {!props.document.hierarchy && (
                <CustomSelect
                  label="Security Level"
                  name="securityLevel"
                  options={securityLevels}
                  object={document}
                  isEdit={true}
                  defaultValue={props.defaultValues.securityLevel ? props.defaultValues.securityLevel : null}
                  onChange={handleChange}
                  // defaultValueOnlyForCombobox={securityLevels[1].value}
                />
              )}
              {document.securityLevel == 4 && (
                <>
                  <Col md={7}>
                    <CustomSelect
                      label="User Group"
                      name="userGroupId"
                      required
                      options={props.userGroup}
                      onChange={props.handleChange}
                    />
                  </Col>
                </>
              )}

              {/* {document.securityLevel == 3 && (
                  <>
                    <FormGroup>
                      <Label>User Access</Label>
                      <Select
                        isMulti
                        onChange={handleSelectChange}
                        name="userAccess"
                        options={props.users}
                        className="basic-multi-select react-select-style"
                        classNamePrefix="select"
                      />
                    </FormGroup>
                  </>
                )} */}

              {!props.document.securityLevel && (
                <CustomSelect
                  label="Security Hierarchy"
                  name="hierarchy"
                  options={props.hierarchy}
                  object={document}
                  isEdit={true}
                  onChange={handleChange}
                  defaultValue={props.defaultValues.hierarchy ? props.defaultValues.hierarchy : null}
                  // defaultValueOnlyForCombobox={securityLevels[1].value}
                />
              )}
              <Col md={7}>
                <Row>
                  <Col md={4}>
                    <CustomInput
                      // object={doc}
                      isEdit={true}
                      type="checkbox"
                      name="isArchived"
                      onChange={handleChange}
                      value={true}
                      // errors={
                      //   validationErrors ? validationErrors.hasEncryption : null
                      // }
                    >
                      Archive
                    </CustomInput>
                  </Col>
                  {/* <Col md={4}>
                  <CustomInput
                    // object={doc}
                    isEdit={true}
                    type="checkbox"
                    name="hasQuickQcr"
                    onChange={handleChange}
                    // errors={
                    //   validationErrors ? validationErrors.hasQuickQcr : null
                    // }
                  >
                    Quick OCR
                  </CustomInput>
                 </Col> */}
                  <Col md={4}>
                    <CustomInput
                      // object={doc}
                      isEdit={true}
                      type="checkbox"
                      name="hasOtp"
                      onChange={handleChange}
                      // errors={validationErrors ? validationErrors.hasOtp : null}
                    >
                      Require OTP Verification
                    </CustomInput>
                  </Col>
                </Row>
              </Col>

              <CustomSelect
                required
                object={document}
                label="Checker"
                name="checker"
                options={users}
                isEdit={true}
                onChange={handleChange}
              />
            </CardBody>
          </Col>
          <Col md={5}>
            <DocumentTypeIndex
              {...props}
              setIndexValues={setIndexValues}
              noValidationCondition
              indexValues={props.document.documentIndex}
              handleDocumentTypeChange={handleDocumentChange}
              documentTypeId={documentTypeId}
              fromBulkAttachmentUploads={true}
            />
          </Col>
        </Row>
      </Card>
    </Form>
  );
};

const Container = (props) => {
  const { image, childIndex, parentIndex, setSelectedImage, moveCard } = props;
  const [{ isDragging }, drag] = useDrag({
    item: { type: ItemTypes.CARD, image },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: ItemTypes.CARD,
    hover: (item, monitor) => {
      monitor.isOver({ shallow: true });
      const dragIndex = item.image.index;
      const hoverIndex = image.index;
      moveCard(dragIndex, hoverIndex, childIndex, parentIndex);
      if (dragIndex === hoverIndex) {
        return;
      }
      item.image.index = hoverIndex;
    },
  });

  return (
    <div ref={drop}>
      <div
        className="m-2"
        style={{
          contain: "content",
          opacity: isDragging ? 0.3 : 1,
          cursor: "move",
          transition: "0.1s",
          height: 160,
          width: 130,
          objectFit: "cover",
          border: "1px solid grey",
          boxShadow: "6px 6px #e0dada",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
        }}
        ref={drag}
      >
        {image.type.includes("image") ? (
          <ImageContainer
            drop={drop}
            drag={drag}
            isDragging={isDragging}
            image={{ ...image, index: childIndex }}
            onClickImage={(image) => setSelectedImage({ ...image, parentIndex })}
          />
        ) : (
          <Attachment attachment={image} />
        )}
        {props.children}
      </div>
    </div>
  );
};

const ImageContainer = (props) => {
  const image = props.image;
  const imageName = image.name;
  return (
    <>
      <img className="img-fluid" onClick={() => props.onClickImage(image)} src={image.src} alt={image.name} />
      <span>{imageName}</span>
    </>
  );
};

const Attachment = (props) => {
  const att = props.attachment || {};
  const attExt = att.name.split(".").pop();
  return (
    <>
      {attExt === "pdf" || attExt === "PDF" ? (
        <>
          <i
            className=" fa fa-file-pdf"
            style={{
              fontSize: "5rem",
              color: "rgb(232 85 65)",
            }}
          />
          <p style={{ width: "90%", marginTop: "1rem" }}>{att.name}</p>
        </>
      ) : attExt === "docx" || attExt === "DOCX" ? (
        <>
          <i
            className=" fa fa-file-word"
            style={{
              fontSize: "5rem",
              color: "#0000FF",
            }}
          />
          <p style={{ width: "90%", marginTop: "1rem" }}>{att.name}</p>
        </>
      ) : attExt === "xls" || attExt === "XLS" || attExt === "xlsx" || attExt === "XLSX" ? (
        <>
          <i
            style={{
              fontSize: "5rem",
              color: "#1E6E42",
            }}
            className="fa fa-file-excel"
          ></i>
          <p style={{ width: "90%", marginTop: "1rem" }}>{att.name}</p>
        </>
      ) : attExt === "txt" || attExt === " TXT" ? (
        <>
          <i
            style={{
              fontSize: "5rem",
              color: "#ccc",
            }}
            className="fa fa-file-text-o"
          ></i>
          <p style={{ width: "90%", marginTop: "1rem" }}>{att.name}</p>
        </>
      ) : attExt === "mp4" || attExt === "mkv" || attExt === "flv" || attExt === "3gp" ? (
        <>
          <i
            style={{
              fontSize: "5rem",
              color: "#ccc",
            }}
            className="fa fa-file-video"
          ></i>
          <p style={{ width: "90%", marginTop: "1rem" }}>{att.name}</p>
        </>
      ) : attExt === "mp3" || attExt === "aac" || attExt === "wav" ? (
        <>
          <i
            style={{
              fontSize: "5rem",
              color: "#ccc",
            }}
            className="fa fa-music"
          ></i>
          <p style={{ width: "90%", marginTop: "1rem" }}>{att.name}</p>
        </>
      ) : null}
    </>
  );
};

const BulkAttachmentUpload = (props) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedImage, setSelectedImage] = useState({});
  const [selectedDocument, setSelectedDocument] = useState();
  const [documentIndexList, setDocumentIndexList] = useState([]);

  const onSplit = (parentIndex, childIndex) => {
    const firstFiles = _.filter(selectedFiles, (o, i) => (i < parentIndex ? 1 : 0));

    const lastFiles = _.filter(selectedFiles, (o, i) => (i > parentIndex ? 1 : 0));
    const splitFile = selectedFiles[parentIndex];
    const splitFiles = [
      {
        document: splitFile.document,
        attachments: _.filter(splitFile.attachments, (o, i) => (i <= childIndex ? 1 : 0)),
      },
      {
        document: { identifier: getIdentifier() },
        attachments: _.filter(splitFile.attachments, (o, i) => (i > childIndex ? 1 : 0)),
      },
    ];
    const files = [...firstFiles, ...splitFiles, ...lastFiles];
    setSelectedFiles(files);
  };

  const onJoin = (parentIndex) => {
    const newArr = [];
    for (let i = 0; i < selectedFiles.length; i++) {
      if (parentIndex === i) {
        newArr.push({
          document: selectedFiles[i].document,
          attachments: [...selectedFiles[i].attachments, ...selectedFiles[i + 1].attachments],
        });
        i++;
      } else {
        newArr.push(selectedFiles[i]);
      }
    }
    setSelectedFiles(newArr);
  };

  const onSubmit = () => {
    let exit = false;

    //validation for document
    selectedFiles.forEach((item) => {
      if (includeThisFeature(dms_features.DEFAULT_MAKER_CHECKER_DOCUMENTS)) {
        if (!item.document.checker) {
          toast.warn("Please select checker!");
          exit = true;
        }

        if (!item.document.locationMapId) {
          toast.warn("Please select location Map!");
          exit = true;
        }
        if (!item.document.documentTypeId) {
          toast.warn("Please select Document Type");
          exit = true;
        }
        if (!item.document.otherTitle) {
          toast.warn("Please provide Document Name");
          exit = true;
        }
      }
    });

    if (exit) {
      return;
    }

    let isIndexed = true;

    // Document index is checked
    selectedFiles.forEach(({ document }) => {
      if (
        !document.identifier ||
        !document.documentTypeId ||
        (onlyForThisVendor(banks.bok.name) && !document.securityLevel)
      ) {
        isIndexed = false;
      }
    });

    if (isIndexed) {
      startLoading();
      //assigning checker for each attachment
      selectedFiles.forEach((item) => {
        if (item.document.checker) item.document.checker = [{ userId: item.document.checker, isApprover: true }];
      });

      console.log(selectedFiles, "this is selected files");

      server
        .post(
          "/attachment/bulk-attachment-upload",
          {
            selectedFiles,
          },
          {
            onUploadProgress: (progressEvent) => {
              // TO DISPLAY THE PROGRESS OF UPLOAD PERCENTAGE VALUE USE IT AS YOU SEE IT FIT
              //eslint-disable-next-line
              const percentage = parseInt(Math.round((progressEvent.loaded / progressEvent.total) * 100));
            },
          }
        )
        .then((_) => {
          console.log(_);
          window.location.reload();
          finishLoading();
          toast.success("Success!");
          props.history.push(metaRoutes.BulkAttachmentUpload);
        })
        .catch((err) => {
          console.log(err.response);
          if (err.response.status === 409) {
            toast.error(err.response.data);
            finishLoading();
          } else {
            finishLoading();
            toast.error("Error!");
          }
        });
    } else {
      toast.warn("You have not indexed the document!");
    }
  };

  const onCrop = (image) => {
    const parentIndex = Number(image.parentIndex);
    const attachments = selectedFiles.map((file, i) => {
      if (i === parentIndex) {
        return {
          document: file.document,
          attachments: file.attachments
            ? file.attachments.map((img) => {
                if (img.name === image.name) {
                  return image;
                } else {
                  return img;
                }
              })
            : [],
        };
      }
      return file;
    });
    setSelectedImage({});
    setSelectedFiles([...attachments]);
  };

  const onChangeIndex = ({ name, value, index, add_all_value }) => {
    const files = _.map(selectedFiles, (o, i) => {
      if (Number(index) === i) {
        //spread document to add value
        const newDoc = {
          ...o.document,
          ...(add_all_value ? value : { [name]: value }),
        };
        setSelectedDocument({ ...newDoc, index });
        return {
          document: newDoc,
          attachments: o.attachments,
        };
      } else {
        return o;
      }
    });
    setSelectedFiles([...files]);
  };

  const moveCard = (dragI, hoverI, childIndex, parentIndex) => {
    setSelectedFiles([
      ...selectedFiles.map((f, pI) => {
        if (pI === parentIndex) {
          return {
            document: f.document,
            attachments: f.attachments.map((img, i, imImgs) => {
              let imggg;
              // console.log(i, hoverI, dragI);
              if (dragI < hoverI) {
                if (i === hoverI) {
                  imggg = imImgs[dragI];
                } else if (i >= dragI && i < hoverI) {
                  imggg = imImgs[i + 1];
                } else {
                  imggg = img;
                }
              } else {
                if (i === hoverI) {
                  imggg = imImgs[dragI];
                } else if (i <= dragI && i > hoverI) {
                  imggg = imImgs[i - 1];
                } else {
                  imggg = img;
                }
              }
              return imggg || img;
            }),
          };
        }
        return f;
      }),
    ]);
  };

  return (
    <>
      <Modal isOpen={selectedDocument ? true : false} toggle={() => setSelectedDocument(false)}>
        <ModalBody>
          <IndexForm //this
            document={selectedDocument}
            documentSetIndex={setDocumentIndexList}
            onChange={onChangeIndex}
            {...props.allFields}
          />
        </ModalBody>
        <ModalFooter>
          <Button color="primary" size="sm" onClick={() => setSelectedDocument(false)}>
            Done
          </Button>
        </ModalFooter>
      </Modal>

      {/* <div ref={drag}>
        <Card>
          <p>test</p>
        </Card>
      </div> */}
      <ImageDropzone setSelectedFiles={setSelectedFiles} selectedFiles={selectedFiles}>
        {selectedFiles.length !== 0 ? (
          <>
            {selectedImage.src ? (
              <ImageCropper image={selectedImage} onCancel={() => setSelectedImage({})} onCrop={onCrop} />
            ) : null}
            {selectedFiles.map((selectedFile, parentIndex) => (
              <Card key={parentIndex}>
                <CardHeader className="d-flex">
                  Document (Please all required fields * ){" "}
                  {!selectedFile.document.identifier ||
                  !selectedFile.document.documentTypeId ||
                  (onlyForThisVendor(banks.rbb.name) && !selectedFile.document.otherTitle) ||
                  !selectedFile.document.locationMapId ||
                  !selectedFile.document.documentTypeId ||
                  (onlyForThisVendor(banks.bok.name) && !selectedFile.document.securityLevel) ? (
                    <p className="text-danger ml-2 h5">Not Indexed</p>
                  ) : (
                    <p className="text-success ml-2 h5">Indexed</p>
                  )}
                </CardHeader>
                <CardBody>
                  <div
                    style={{
                      flex: 1,
                      flexWrap: "wrap",
                      display: "flex",
                    }}
                  >
                    {selectedFile.attachments.map((image, childIndex) => {
                      return (
                        <div className="d-flex" key={childIndex}>
                          <Container
                            childIndex={childIndex}
                            parentIndex={parentIndex}
                            setSelectedImage={setSelectedImage}
                            moveCard={moveCard}
                            image={{ ...image, index: childIndex }}
                            key={childIndex}
                          />{" "}
                          {selectedFile.attachments.length - 1 === childIndex ? null : (
                            <Button size="sm" color="white" onClick={() => onSplit(parentIndex, childIndex)}>
                              <i className="fa fa-caret-right fa-2x" />
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardBody>
                <CardFooter className="d-flex justify-content-end">
                  {selectedFiles.length - 1 === parentIndex ? null : (
                    <Button size="sm" color="primary" onClick={() => onJoin(parentIndex)} className="mr-1">
                      Join
                    </Button>
                  )}
                  <Button
                    color="primary"
                    size="sm"
                    onClick={() =>
                      setSelectedDocument({
                        index: parentIndex,
                        ...(selectedFile.document || {}),
                      })
                    }
                  >
                    Index
                  </Button>
                </CardFooter>
              </Card>
            ))}
            <div className="d-flex justify-content-end mb-4 mr-4">
              <CustomCancel onClick={() => setSelectedFiles([])} />
              <Button onClick={onSubmit} size="md" color="success">
                Submit
              </Button>
            </div>
          </>
        ) : null}
      </ImageDropzone>
    </>
  );
};

export default connect((state) => ({
  allFields: state.allFields,
  userProfile: state.userProfile,
}))(BulkAttachmentUpload);

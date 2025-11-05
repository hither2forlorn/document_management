import CustomAutoComplete from "admin/components/CustomAutoComplete";
import React, { useState } from "react";
import {
  Col,
  Row,
  Card,
  CardHeader,
  CardBody,
  Table,
  CardFooter,
  Input,
  Label,
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  FormGroup,
} from "reactstrap";
import Select from "react-select";

import DocumentTypeIndex from "../DocumentTypeIndex";
export default function EditIndexAttachment({
  docIndexValuesforEdit,
  tempDocData,
  editModal,
  setEditModal,
  setDocumentTypeId,
}) {
  const [indexValues, setIndexValues] = useState([]);
  const handleChange = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    if (name === "documentTypeId") {
      setDocumentTypeId(value);
    }
    // console.log(editModal,docIndexValuesforEdit, );
    // if (name === "securityLevel") {
    //   const securityLevel = _.find(
    //     this.state.securityLevels,
    //     (sL) => sL.id === Number(value)
    //   );
    //   if (securityLevel) {
    //     this.setState({
    //       securityLevelCheck: securityLevel.value,
    //     });
    //   } else {
    //     this.setState({
    //       securityLevelCheck: 0,
    //     });
    //   }
    // }
  };
  console.log();
  const editAttachmentModalToggler = () => {
    setEditModal(!editModal);
  };

  const handleSetIndexValues = (listValues) => {
    setIndexValues(listValues);
  };

  return (
    <div>
      {/*modal for editing attachments*/}

      <Modal isOpen={editModal} toggle={editAttachmentModalToggler}>
        <ModalBody id="attachment">
          <DocumentTypeIndex
            setIndexValues={handleSetIndexValues}
            documentData={tempDocData}
            forAttachment={true}
            handleDocumentTypeChange={handleChange}
            documentTypeId={docIndexValuesforEdit || docIndexValuesforEdit[0].documentIndexId}
            docIndexValues={docIndexValuesforEdit}
          />
          {/* <React.Fragment>
            <FormGroup>
              <p className="mb-1">
                <b>Associated BokID</b>
              </p>
              <hr className="mt-0" />
              <CustomAutoComplete
                label="BOK ID"
                defaultValue="BOK"
                generateUserFromCBS={generateUserFromCBS}
                onIdexTypeChange={onChange}
                // errors={validationErrors ? validationErrors.name : null}
              />
              {props?.associatedBokIDS?.length !== 0 && (
                <Select
                  value={props.associatedBokIDS}
                  onChange={onChangeReactSelect}
                  isMulti
                  name="AssociatedBokIds"
                  className="basic-multi-select"
                  classNamePrefix="select"
                />
              )}
            </FormGroup>
          </React.Fragment> */}
          {/*
<DocumentTypeIndex
            documentData={tempDocData}
                  setIndexValues={this.setIndexValues}
                  handleDocumentTypeChange={this.handleChange}
                  documentTypeId={this.state.documentData.documentTypeId}
                  indexValues={this.state.documentData.document_index_values}
                /> */}
        </ModalBody>
        <ModalFooter>
          <Button color="primary">Add</Button>
          <Button color="secondary" onClick={editAttachmentModalToggler}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}

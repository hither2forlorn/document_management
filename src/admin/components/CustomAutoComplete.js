import React, { useState } from "react";
import { getBOKIDs, getBOKIDsFromCBS } from "./api/bokApi";
import CustomInput from "admin/components/CustomInput";

import { Col, Button, Table, ModalHeader, ModalBody, Input, Row } from "reactstrap";
import Axios from "axios";
import Modal from "./Modal";
export default function CustomAutoComplete({
  object,
  isEdit,
  label,
  name,
  defaultValue,
  errors,
  generateUserFromCBS,
  attachmentModalBata,
  onIdexTypeChange,
  documentIndexBata,
  required,
  documentFormBata,
  hasAssociatedId,
  disabled,
}) {
  const [open, setOpen] = React.useState(false);
  const [options, setOptions] = React.useState([]);
  const [autoCompleteValue, setautoCompleteValue] = React.useState(defaultValue || "BOK");
  const [isLoading, setIsLoading] = useState(false);
  const [TBOKIDDetails, setTBOKIDDetails] = useState({});
  const [TBOKid, setTBOKid] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [saveCBSdetails, setSaveCBSdetails] = useState(false);

  // Closes the modal
  const handleClose = () => {
    setIsOpen(false);
    setSaveCBSdetails(false);
  };
  const loading = open;

  const CancelToken = Axios.CancelToken;
  const source = CancelToken.source();
  React.useEffect(() => {}, [defaultValue, isEdit]);

  /**
   *
   * @param {*} active
   * @param {*} tbokID accepts true
   * @param {*} tbokDetails contains details for
   * @returns
   */
  async function handleBOKID(active = true, tbokID, tbokDetails) {
    setIsLoading(true);
    let response;
    // pull from cbs
    if (tbokID) {
      console.log(tbokDetails);
      response = await getBOKIDsFromCBS(autoCompleteValue, TBOKid, tbokDetails, source);
    } else {
      // get data from lms
      if (!autoCompleteValue || autoCompleteValue == "" || autoCompleteValue == "BOK") {
        setIsLoading(false);

        return undefined;
      }
      response = await getBOKIDs(autoCompleteValue, source, attachmentModalBata, documentIndexBata);
    }
    if (active) {
      setOptions(response?.data || []);
    }
    setIsLoading(false);
  }

  const handleInputChange = (e) => {
    const value = e.target.value;
    setTBOKid(value);
  };

  const onChange = (e) => {
    setautoCompleteValue(e.target.value);
  };

  const Loading = (
    <tr>
      <td colspan="7">
        <div className="jumbotron jumbotron-fluid p-3 mb-0">
          <div className="container text-center">
            <p className="lead m-0">Loading . . .</p>
          </div>
        </div>
      </td>
    </tr>
  );

  const NotFound = (
    <tr>
      <td colspan="7">
        <div className="jumbotron jumbotron-fluid p-3 mb-0">
          <div className="container text-center">
            <p className="lead m-0">
              Not Found in LMS ! Please provide appropriate BOKID
              {/* <Button
          color="primary"
          onClick={() => handleBOKID(true, true)}
          className="btn-sm ml-4"
        >
          <i className="fa fa-search" /> Search in CBS
        </Button> */}
            </p>
          </div>
        </div>
      </td>
    </tr>
  );

  const modal = (
    <Modal open={isOpen} close={handleClose} name="Select BOKID" className="updateStatus__modal">
      <ModalBody>
        <Table responsive bordered hover>
          <thead>
            <tr>
              <th scope="col">BOKID</th>
              <th scope="col">Name</th>
              <th scope="col">Type</th>
              <th scope="col">{hasAssociatedId ? "Account Number" : "TBOKID"}</th>
              <th scope="col">{hasAssociatedId ? "GROUP NAME" : "Action Taken"}</th>
              <th scope="col">{hasAssociatedId ? "PRIMARY EMAIL" : "Approved Date"}</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? Loading : options?.length == 0 && NotFound}
            {!isLoading &&
              options.map((option) => (
                <tr>
                  <td>{hasAssociatedId ? option.BOK_ID : option.BOKID}</td>
                  <td>{hasAssociatedId ? option.NAME : option.CustName}</td>
                  <td>{hasAssociatedId ? option.ACCOUNT_TYPE : option.type}</td>
                  <td>{hasAssociatedId ? option.ACCOUNT_NUMBER : option?.CPRno}</td>
                  <td>{hasAssociatedId ? option.GROUP_NAME : option.ActionTaken}</td>
                  <td>{hasAssociatedId ? option.PRIMARY_EMAIL : option.ApprovedDate}</td>
                  <td>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: "0.5em",
                      }}
                    >
                      {saveCBSdetails && documentFormBata && (
                        <Button
                          color="primary"
                          className="btn-sm"
                          onClick={() => {
                            setTBOKIDDetails(option);
                            setIsOpen(false);
                            setSaveCBSdetails(false);
                          }}
                        >
                          <i className="fa fa-archive" /> Store
                        </Button>
                      )}
                      {!saveCBSdetails && (
                        <Button
                          color="success"
                          className="btn-sm"
                          onClick={() => {
                            if (documentIndexBata) generateUserFromCBS(option.BOKID, name, option);
                            else {
                              // if tbokidetails is available then replace with
                              generateUserFromCBS(
                                TBOKIDDetails?.BOKID || option.BOKID,
                                TBOKIDDetails?.BOKID
                                  ? {
                                      ...option,
                                      BOKID: TBOKIDDetails?.BOKID,
                                      CustName: TBOKIDDetails?.CustName,
                                    }
                                  : option
                              );
                              document.getElementById(name || "name").value = TBOKIDDetails?.BOKID || option.BOKID;
                            }
                            setIsOpen(false);
                          }}
                        >
                          <i className="fa fa-check" /> Select
                        </Button>
                      )}
                    </div>

                    {/* <Button
                    color="primary"
                    onClick={() =>
                      handleBOKID(
                        true,
                        hasAssociatedId ? option.BOK_ID : option.BOKID
                      )
                    }
                    className="btn-sm ml-4"
                  >
                    <i className="fa fa-search" /> Search in CBS
                  </Button> */}
                  </td>
                </tr>
              ))}
          </tbody>

          {/* Search with TBOKID  */}
          {documentFormBata && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "25px",
              }}
            >
              <Input type="text" name="name" placeholder="Enter TBOK-ID" onChange={(e) => handleInputChange(e)} />
              <Button color="primary" onClick={() => handleBOKID(true, TBOKid)} className="btn-sm ml-4">
                <i className="fa fa-search" /> search
              </Button>
            </div>
          )}
        </Table>
      </ModalBody>
    </Modal>
  );

  return (
    <>
      <div className="form-group row w-90">
        {/* <FormGroup className="w-95" row> */}
        {/* <Col sm={3}>
          <Label>{label ? label : ""}</Label>
        </Col> */}
        <Col sm={12}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <CustomInput
              onChange={(e) => {
                onChange(e);
              }}
              object={object}
              disabled={disabled}
              isEdit={isEdit}
              defaultValue={defaultValue || "BOK"}
              placeholder="Enter Account Number"
              name={name || "name"}
              label="Account Number"
              // noLabel={documentFormBata ? false : true}
              required={required ? true : false}
              bokIdBata
              // errors={validationErrors ? validationErrors.identifier : null}
            />

            {modal}
            <Button
              disabled={disabled}
              color="primary"
              style={{
                height: "36px",
                marginTop: "25px",
              }}
              onClick={() => {
                setIsOpen(true);
                handleBOKID();
              }}
            >
              <i className="fa fa-plus" />
            </Button>
          </div>
          {documentFormBata && (
            <>
              <Button
                onClick={() => {
                  setIsOpen(true);
                  setSaveCBSdetails(true);
                  // to browse from cbs 3rd params must contain object.
                  const browse = { browseFromCBS: true };
                  setTBOKIDDetails(browse);
                  handleBOKID(true, true, browse);
                }}
              >
                Search through CBS
              </Button>
              <b>
                {TBOKIDDetails.BOKID} - {TBOKIDDetails.CustName}
              </b>
            </>
          )}
        </Col>
      </div>
    </>
  );
}

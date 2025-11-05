import axios from "axios";
import React, { useState } from "react";
import { Button, FormGroup, Label } from "reactstrap";
import Select from "react-select";

const RedactionPDF = (props) => {
  const handleClick = () => {
    window.open(
      `${process.env.REACT_APP_REDACTION_URL || "http://localhost:8181/api/redaction"}/${props.redactionValues}`,
      "_blank"
    );
  };

  return (
    <div>
      <FormGroup
        style={{
          marginBottom: "20px",
        }}
      >
        <Label>Select Attachment for Redaction</Label>
        <Select
          isDisabled={props.redactionModule ? true : false}
          onChange={props.handleRedactionAttachmentchange}
          value={props.redactionValue}
          name="userAccess"
          className="basic-multi-select react-select-style"
          classNamePrefix="select"
          options={
            props.attachments
              ? props.attachments
                  .filter((row) => !row.pendingApproval)
                  .map((row, index) => ({
                    value: row.id,
                    label: row.name,
                  }))
              : []
          }
        />
        <div
          style={{
            marginTop: "10px",
          }}
        >
          <Button
            style={{
              marginRight: "10px",
            }}
            onClick={props.handleRedactionSubmit}
          >
            Open Redaction Tool
          </Button>
        </div>
      </FormGroup>
      {/* <button onClick={handleSelectedAttachment}>Select Attachment</button> */}
    </div>
  );
};

export default RedactionPDF;

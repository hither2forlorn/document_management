import { CustomSelect } from "admin/components";
import CustomSubmit from "admin/components/CustomSubmit";
import React from "react";
import { Col } from "reactstrap";

export default function AttachmentMakerChecker({ functionProps }) {
  const { handleSendAttachmentToChecker, handleChangeMakerChecker, options_maker, doc, checkers_list } = functionProps;
  if (options_maker.attachmentMakerChecker?.length > 0) return "Already sent to checker";

  return (
    <form>
      <div className="d-flex">
        {/* select */}
        <Col md={3}>
          <CustomSelect
            required={true}
            object={doc}
            name="checker"
            options={checkers_list}
            onChange={handleChangeMakerChecker}
          />
        </Col>
        <Col md={2}>
          <CustomSubmit
            style={{
              marginTop: `3px`,
            }}
            onClick={() => handleSendAttachmentToChecker()}
            className="btn btn-sm btn-primary text-white float-right"
          >
            <i className="fa fa-paper-plane"></i> Send To Checker
          </CustomSubmit>
        </Col>
      </div>
    </form>
  );
}

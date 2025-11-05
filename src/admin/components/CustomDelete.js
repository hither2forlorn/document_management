import { VIEW_EDIT_DELETE } from "config/values";
import React from "react";
import { Button } from "reactstrap";

const CustomDelete = ({ onClick, permission, makerMistakeDoc, approve }) => {
  return (
    <>
      <Button type="button" className="text-white btn btn-sm btn-brand btn-danger mr-2 mb-2 mt-1" onClick={onClick}>
        <i className={`${approve ? "fa fa-times" : "fa fa-trash"}`} />
      </Button>
    </>
  );
};

export default CustomDelete;

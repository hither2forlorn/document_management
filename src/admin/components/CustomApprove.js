import React from "react";
import { Button } from "reactstrap";

const CustomApprove = ({ onClick }) => {
  return (
    <>
      <Button type="button" className="text-white btn btn-sm btn-brand btn-success mr-2 mb-2 mt-1" onClick={onClick}>
        <i className="fa fa-check" />
      </Button>
    </>
  );
};

export default CustomApprove;

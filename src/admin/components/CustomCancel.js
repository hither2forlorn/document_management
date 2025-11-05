import React from "react";
import { Button } from "reactstrap";

const CustomCancel = ({ onClick }) => {
  return (
    <>
      <Button type="button" className="text-white mr-1" onClick={onClick} color="danger">
        Cancel
      </Button>
    </>
  );
};

export default CustomCancel;

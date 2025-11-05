import React from "react";
import { Button } from "reactstrap";
import { Loader } from "@mantine/core";

const CustomSubmit = ({ children, isDisabled, ...rest }) => {
  return (
    <>
      <Button type="submit" color="primary" disabled={isDisabled || false} {...rest}>
        {isDisabled ? (
          <>
            <Loader color="dark" size="sm" variant="dots" /> {"  "} Loading...
          </>
        ) : (
          children || "Submit"
        )}
      </Button>
    </>
  );
};

export default CustomSubmit;

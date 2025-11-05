import { Loader } from "@mantine/core";

import React from "react";

export default function CustomLoading({ isLoading }) {
  if (isLoading)
    return (
      <>
        <Loader color="dark" size="sm" variant="oval" />
        {"  "}
        Loading..
      </>
    );

  return <> Proceed To Upload</>;
}

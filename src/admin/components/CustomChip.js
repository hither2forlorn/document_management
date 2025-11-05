import { Chip } from "@mui/material";
import React from "react";

export default function CustomChip({ ...rest }) {
  return <Chip {...rest} color="primary" size="small" />;
}

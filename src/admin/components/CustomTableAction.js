import { Divider } from "@mui/material";
import { VIEW_EDIT, VIEW_EDIT_DELETE } from "config/values";
import React from "react";
import { Link } from "react-router-dom";

const CustomTableAction = ({
  to,
  buttonType,
  icon,
  className,
  permission,
  children,
  makerMistakeDoc,
  doNotAllow,
  ...rest
}) => {
  if (doNotAllow) return null;

  // Managed Actions
  if (buttonType == "delete") {
    //allow permission
    if (!(makerMistakeDoc === true || permission == VIEW_EDIT_DELETE)) {
      return null;
    }
  }
  //
  if (buttonType == "edit") {
    if (!(permission == VIEW_EDIT_DELETE || permission == VIEW_EDIT)) {
      return null;
    }
  }

  if (buttonType == "approve" || buttonType == "cancel") {
    if (!permission) return null;
  }
  if (buttonType == "restore") {
    console.log("permission", permission);
    if (!permission) return null;
  }

  switch (buttonType) {
    case "edit":
      icon = "fa fa-pencil";
      className = "btn-primary";
      break;
    case "delete":
      className = "btn-danger";
      icon = "fas fa-trash";

      break;
    case "cancel":
      className = "btn-danger";
      icon = "fa fa-times";
      break;
    case "approve":
      className = "btn-success";
      icon = "fa fa-check";
      break;
    case "view":
      className = "btn-info";
      icon = "fa fa-eye"; // FontAwesome eye icon for view
      break;
    case "attachmentVersioning":
      className = "btn-secondary";
      icon = "fas fa-layer-group"; // FontAwesome icon for layers to represent versioningbreak;
      break;
    case "restore":
      className = "btn-dark";
      icon = "fa fa-undo";
      break;
    case "default":
      className = "btn-warning";
      icon = "fab fa-zhihu";
      break;
  }

  return (
    <>
      {to ? (
        <Link to={to} className={`btn btn-sm btn-brand text-white mr-2 mb-2 mt-1 ${className || "btn-primary"}`} {...rest}>
          {children || <i className={icon} />}
        </Link>
      ) : (
        <button className={`btn btn-sm btn-brand text-white mr-2 mb-2 mt-1 ${className || "btn-primary"}`} {...rest}>
          {children || <i className={icon} />}
        </button>
      )}
    </>
  );
};

export default CustomTableAction;

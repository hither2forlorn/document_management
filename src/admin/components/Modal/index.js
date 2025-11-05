import React from "react";
import "./modal.css";
import { IconButton } from "@mui/material";
// import CancelIcon from "@material-ui/icons/Cancel";

const MODAL_STYLES = {
  position: "fixed",
  top: "50%",
  height: "80%",
  width: "70%",
  left: "50%",
  transform: "translate(-50%,-50%)",
  backgroundColor: "#fff",
  zIndex: 1000,
};

const OVERLAY_STYLES = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(244,244,244,.7)",
  zIndex: 1000,
};

export default function Modal({ open, close, children, name }) {
  if (!open) return null;
  return (
    <>
      <div style={OVERLAY_STYLES} onClick={close} />
      <div className="custom_modal" style={MODAL_STYLES}>
        <div className="modal__header">
          <div></div>
          <h1>{name}</h1>
          <IconButton onClick={close}>
            <i className="fa fa-times" />
          </IconButton>
        </div>
        <div className="modal__body">{children}</div>
      </div>
    </>
  );
}

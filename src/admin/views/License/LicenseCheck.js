/* eslint-disable */
import React, { useState, useEffect } from "react";
import { Modal, ModalHeader, ModalBody, Button } from "reactstrap";
import { getFormData } from "config/form";
import { addLicense } from "./api";
import { toast } from "react-toastify";
import { connect } from "react-redux";
import CustomCancel from "admin/components/CustomCancel";
import CustomSubmit from "admin/components/CustomSubmit";

const onLicenseSubmit = (e) => {
  e.preventDefault();
  const formData = getFormData(e);
  toast.warn("Working on Submit");
  return;
  addLicense(formData, (err, data) => {
    if (err) return;
    if (data) {
      toast.success(data.message);
    }
  });
};

const LicenseCheck = (props) => {
  const isActivated = props.license.isActivated;
  const [isOpen, setOpen] = useState(false);
  const open = () => setOpen(!isActivated);
  const close = () => setOpen(false);
  useEffect(() => {
    open();
  }, [props.location, props.license.isLoading]);
  return (
    <Modal isOpen={isOpen} toggle={close}>
      <ModalHeader toggle={close}>License Expired</ModalHeader>
      <ModalBody>
        <h5>Your License has been expired. Please enter new License key to continue.</h5>
        <form onSubmit={onLicenseSubmit}>
          <label>Key</label>
          <input type="text" name="key" id="key" className="form-control"></input>
          <CustomCancel />
          <CustomSubmit />
        </form>
      </ModalBody>
    </Modal>
  );
};

export default connect((state) => ({
  license: state.license,
}))(LicenseCheck);

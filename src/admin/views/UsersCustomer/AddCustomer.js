import React from "react";
import CustomerForm from "./CustomerForm";
import { getFormData } from "config/form";
import { addUser } from "../Users/api";
import { toast } from "react-toastify";
import metaRoutes from "config/meta_routes";

const AddCustomer = (props) => {
  const onSubmit = (e) => {
    e.preventDefault();
    const formData = getFormData(e);
    if (!validatePasswordConf(formData.password, formData.confirmPassword)) {
      return;
    }
    addUser({ ...formData, userType: "customer" }, (err, data) => {
      if (err) {
        toast.error("Error!!");
        return;
      } else {
        toast.success("Successful.");
        props.history.push(metaRoutes.adminCustomerList);
      }
    });
  };

  const validatePasswordConf = (p, pConf) => {
    if (p !== pConf) {
      document.getElementById("confirmPassword").focus();
      toast.warn("Passwords do not match!");
      return false;
    } else {
      return true;
    }
  };
  return <CustomerForm onSubmit={onSubmit} {...props} />;
};

export default AddCustomer;

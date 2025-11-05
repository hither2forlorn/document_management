import React, { useState, useEffect } from "react";
import CustomerForm from "./CustomerForm";
import { getUser, editUser } from "../Users/api";
import query from "querystring";
import A from "config/url";
import metaRoutes from "config/meta_routes";
import { toast } from "react-toastify";

const EditCustomer = (props) => {
  const [user, setUser] = useState({});

  useEffect(() => {
    const qs = query.parse(props.location.search);
    const id = A.getId(qs["?i"]);
    if (!id) {
      props.history.push(metaRoutes.adminCustomerList);
    }
    getUser(id, (err, data) => {
      if (err) return;
      setUser(data.user);
    });
  }, []); //eslint-disable-line

  const onChange = ({ target: { name, value } }) => {
    user[name] = value;
    setUser({ ...user });
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (!window.confirm("Do you want to update this customer?")) {
      return;
    }
    if (user.password) {
      if (!validatePasswordConf(user.password, user.confirmPassword)) {
        return;
      }
    }
    editUser(user, (err, data) => {
      if (err) {
        toast.error("Error!!");
        return;
      }
      if (data.success) {
        toast.success("Update success.");
        props.history.push(metaRoutes.adminCustomerList);
      } else {
        toast.warn(data.message);
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

  return <CustomerForm isEdit user={user} onChange={onChange} onSubmit={onSubmit} {...props} />;
};

export default EditCustomer;

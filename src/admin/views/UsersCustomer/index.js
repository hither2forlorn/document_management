import React, { useState, useEffect } from "react";
import ListCustomer from "./ListCustomer";
import { getUsers } from "../Users/api";

const CustomerDashboard = (props) => {
  const [userList, setUserList] = useState([]);
  const type = { userType: props.permission.name };

  useEffect(() => {
    getData();
  }, []);

  const getData = () => {
    getUsers(type, (err, data) => {
      if (err) return;
      setUserList(data);
    });
  };
  return (
    <>
      <ListCustomer deleteUser={deleteCustomer} userList={userList} {...props} />
    </>
  );
};

export default CustomerDashboard;

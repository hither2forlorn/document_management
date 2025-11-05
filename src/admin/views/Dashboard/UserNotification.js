import React, { useState, useEffect } from "react";
import { getNotificationDocuments, getPendingDocuments } from "./api/document";
import NotificationList from "./components/NotificationList";
import { connect } from "react-redux";
import { useQuery } from "react-query";

var count = 0;
const UserNotification = (props) => {

  const { data, error } = useQuery("notificationList", () => getNotificationDocuments());

  if (error) {
    console.log(error);
  }
  if (!data?.success) {
    // window.alert(data?.message);

  }


  return (
    <NotificationList
      title="Pending Documents"
      documentList={data?.paginationDocument || []}
      totalNotification={data?.total}
      showControl={false}
      permissions={props.permissions}
    />
  );

}

export default connect((state) => ({ allFields: state.allFields }))(UserNotification);


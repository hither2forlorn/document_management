import React from "react";
import { connect } from "react-redux";

function AdminComponent({ children, userProfile }) {
  return <>{userProfile.id === 1 || userProfile.hierarchy === "Super-001" ? children : null}</>;
}

export default connect((state) => ({
  userProfile: state.userProfile,
}))(AdminComponent);

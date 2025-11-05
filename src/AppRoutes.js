import React, { useEffect, useState } from "react";
import { Switch, Route, Redirect } from "react-router-dom";
import { connect } from "react-redux";
import BaseLayout from "containers/BaseLayout";
import UserLayout from "containers/UserLayout";

import { loadAllFields, loadUserProfile } from "redux/actions/apiAction";
import { checkLicense, setAuth, setClientAuth } from "redux/actions/authAction";
import { server as adminServer } from "admin/config/server";
import { server as clientServer } from "client/config/server";
import metaRoutes from "config/meta_routes";
import Page404 from "Pages/Page404";
import Page500 from "Pages/Page500";
import AdminLogin from "Pages/AdminLogin/Login";
import ClientLogin from "Pages/ClientLogin/Login";
import SpecialPreview from "Pages/SpecialPreview";
import BPMSpecialPreview from "Pages/BPMSpecialPreview";
import DemoVideos from "Pages/DemoVideos/DemoVideos";

const AppRoutes = (props) => {
  const [isCompleted, setCompleted] = useState(false);
  useEffect(() => {
    Promise.all([
      adminServer
        .get("/isLoggedIn")
        .then((res) => {
          return res.data;
        })
        .catch(() => {}),
    ]).then(([admin]) => {
      if (admin && admin.success) {
        props.dispatch(setAuth({ isAuthenticated: true }));
        props.dispatch(loadAllFields());
        props.dispatch(loadUserProfile());
        props.dispatch(checkLicense());
      }

      setCompleted(true);
    });
  }, []); // eslint-disable-line
  if (!isCompleted) return null;
  return (
    
    <Switch>
      <Route exact path="/special-preview" name="Special Preview" render={(props) => <SpecialPreview {...props} />} />
      <Route
        exact
        path="/BPM-special-preview"
        name="BPM Special Preview"
        render={(props) => <BPMSpecialPreview {...props} />}
      />
      <Route exact path="/404" name="Page 404" render={(props) => <Page404 {...props} />} />
      <Route exact path="/500" name="Page 500" render={(props) => <Page500 {...props} />} />
      <Route path={metaRoutes.clientLogin} render={(props) => <ClientLogin {...props} />} />
      <Route path="/customer" name="User" render={(props) => <UserLayout {...props} />} />
      <Route path={metaRoutes.adminLogin} render={(props) => <AdminLogin {...props} />} />
      <Route path="/admin" name="Admin" render={(props) => <BaseLayout {...props} />} />
      <Route
  path="/demo-videos"
  render={(props) => <DemoVideos {...props} />}
/>
      <Redirect from="/" to="/admin" />
    </Switch>
  );
};

export default connect()(AppRoutes);

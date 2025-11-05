import React, { Component, Suspense } from "react";
import { Redirect, Switch } from "react-router-dom";
import * as router from "react-router-dom";
import { Container } from "reactstrap";

// sidebar nav config
import {
  AppFooter,
  AppHeader,
  AppSidebar,
  AppSidebarFooter,
  AppSidebarForm,
  AppSidebarHeader,
  AppSidebarMinimizer,
  AppBreadcrumb2 as AppBreadcrumb,
  AppSidebarNav2 as AppSidebarNav,
  AppAside,
} from "@coreui/react";
// import getNavigationItems from '../../_nav';
import getNavigationItems from "admin/_nav";
// routes config
import routes from "admin/routes";
// private route
import PrivateRoute from "admin/_authorize";
import { connect } from "react-redux";
import LicenseCheck from "admin/views/License/LicenseCheck";
import { server, TOKEN } from "admin/config/server";
import metaRoutes from "config/meta_routes";
import { CURRENT_USER_ID } from "config/values";
import UserNotification from "admin/views/Dashboard/UserNotification";

import VendorLogo from "admin/components/VendorLogo";

const BaseHeader = React.lazy(() => import("./BaseHeader"));
const BaseFooter = React.lazy(() => import("./BaseFooter"));

class BaseLayout extends Component {
  state = {
    permissions: null,
  };

  loading = () => <div className="animated fadeIn pt-1 text-center">Loading...</div>;

  async signOut(e) {
    e.preventDefault();
    await server.get("/user/logout");
    window.location.reload();
  }

  componentDidMount = () => {
    server
      .get("/permissions")
      .then((json) => {
        this.setState({
          permissions: json.data,
        });
      })
      .catch((err) => {
        this.setState({
          permissions: null,
        });
      });
  };

    render() {
    if (!this.props.auth.isAuthenticated) return <Redirect to={metaRoutes.adminLogin} />;
    if (!this.state.permissions) return null;
    return (
      <div className="app">
        <LicenseCheck {...this.props} />
        <AppHeader fixed>
          <Suspense fallback={this.loading()}>
            <BaseHeader onLogout={(e) => this.signOut(e)} permission={this.state} />
          </Suspense>
        </AppHeader>
        <div className="app-body">
          <AppSidebar fixed minimized={false} display="lg" style={{backgroundColor:'#135ebd'}}>
            <AppSidebarHeader />
            <AppSidebarForm />
            <Suspense>
              <AppSidebarNav
                navConfig={getNavigationItems(this.state.permissions)}
                {...this.props}
                dispatch={null}
                router={router}
              />
            </Suspense>
            <AppSidebarFooter />
            <VendorLogo />

            <AppSidebarMinimizer className="customSidebarCol" style={{backgroundColor:'#135ebd'}} />
          </AppSidebar>
          <main className="main mb-3">
            <AppBreadcrumb appRoutes={routes} router={router} />
            <Container fluid>
              <Suspense fallback={this.loading()}>
                <Switch>
                  {routes.map((route, idx) => {
                    return route.component ? (
                      <PrivateRoute
                        permission={route.permission}
                        key={idx}
                        path={route.path}
                        exact={route.exact}
                        name={route.name}
                        component={route.component}
                        permissions={this.state.permissions}
                      />
                    ) : null;
                  })}
                </Switch>
              </Suspense>
            </Container>
          </main>
          <AppAside fixed>
            <UserNotification />
          </AppAside>
        </div>
        <AppFooter>
          <Suspense fallback={this.loading()}>
            <BaseFooter />
          </Suspense>
        </AppFooter>
      </div>
    );
  }
}

export default connect((state) => ({
  auth: state.auth,
}))(BaseLayout);

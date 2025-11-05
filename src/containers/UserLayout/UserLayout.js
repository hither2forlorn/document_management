import React, { Component, Suspense } from "react";
import { Switch, Route, Redirect } from "react-router-dom";
import { Container } from "reactstrap";

// routes config
import routes from "client/routes";
import { connect } from "react-redux";
import metaRoutes from "config/meta_routes";
import { CLIENT_TOKEN } from "config/values";
import UserNavbar from "./UserNavbar";

class UserLayout extends Component {
  loading = () => <div className="animated fadeIn pt-1 text-center">Loading...</div>;

  logout = () => {
    localStorage.removeItem(CLIENT_TOKEN);
    window.location.href('/');
  };

  render() {
    if (!this.props.clientAuth.isAuthenticated) return <Redirect to={metaRoutes.clientLogin} />;
    return (
      <div className="app">
        <UserNavbar logout={this.logout} />
        <main className="main mb-3">
          <Container fluid>
            <Suspense fallback={this.loading()}>
              <Switch>
                {routes.map((route, idx) => {
                  return route.component ? (
                    <Route
                      permission={route.permission}
                      key={idx}
                      path={route.path}
                      exact={route.exact}
                      name={route.name}
                      component={route.component}
                      {...this.props}
                    />
                  ) : null;
                })}
              </Switch>
            </Suspense>
          </Container>
        </main>
      </div>
    );
  }
}

export default connect((state) => ({
  clientAuth: state.clientAuth,
}))(UserLayout);

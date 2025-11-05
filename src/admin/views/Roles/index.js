import React from "react";
import Roles from "./Roles";
import AddRole from "./AddRole";
import EditRole from "./EditRole";
import { NotFound } from "admin/components/NotFound/NotFound";

export default class RoleRoutes extends React.Component {
  constructor(props) {
    super(props);
    this.renderItems = this.renderItems.bind(this);
  }

  renderItems() {
    const url = this.props.match.params.url;
    const p = this.props.permissions;
    if (!p) return null;
    let Component;
    switch (url) {
      case undefined:
        Component = Roles;
        break;
      case "add":
        Component = AddRole;
        break;
      case "edit":
        Component = EditRole;
        break;
      default:
        Component = NotFound;
        break;
    }
    return <Component {...this.props} />;
  }

  render() {
    return this.renderItems();
  }
}

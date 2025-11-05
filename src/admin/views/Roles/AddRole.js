import React, { Component } from "react";
import { getFormData } from "config/form";
import { addRole, getRoleTypes } from "./api";
import RoleForm from "./RoleForm";
import metaRoutes from "config/meta_routes";
import { toast } from "react-toastify";
import titleCase from "utils/textCapital";
import { connect } from "react-redux";
import { loadAllFields } from "redux/actions/apiAction";

class AddRole extends Component {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  state = {
    isDisabled: false,
    role: { name: "" },
    roleTypes: [],
  };

  handleChange = (e) => {
    const name = e.target.name;
    let value = e.target.value;
    const [type, roleTypeId] = e.target.name.split("-");
    const role = this.state.role;
    if (name === "name") {
      value = titleCase(value);
    }

    if (type === "control") {
      let flagFound = false;
      role.role_controls = role.role_controls
        ? role.role_controls.map((rC) => {
            if (rC.roleTypeId === Number(roleTypeId)) {
              flagFound = true;
              rC.value = value;
            }
            return rC;
          })
        : [];
      if (!flagFound) {
        role.role_controls.push({
          roleId: role.id,
          roleTypeId: Number(roleTypeId),
          value: value,
        });
      }
    } else {
      switch (e.target.type) {
        case "radio":
          role[e.target.name] = e.target.checked;
          break;
        case "checkbox":
          role[e.target.name] = e.target.checked;

          break;
        default:
          role[e.target.name] = value;
          break;
      }
    }
    this.setState({
      role: { ...role },
    });
  };

  componentDidMount() {
    getRoleTypes((err, roleTypes) => {
      if (err) return;
      this.setState({ roleTypes: roleTypes });
    });
  }

  handleSubmit = (e) => {
    e.preventDefault();
    const role = this.state.role;

    const form = getFormData(e);
    addRole(role, (err, data) => {
      if (err) {
        toast.error(err?.response?.data?.message || "Errr Creating Roles");
        return;
      }
      this.props.dispatch(loadAllFields());
      toast.success(data.message);
      this.props.history.push(metaRoutes.adminRoles);
      this.setState({ isDisabled: true });
    });
  };

  render() {
    return (
      <RoleForm
        handleChange={this.handleChange}
        title="Add Role"
        roleTypes={this.state.roleTypes}
        handleSubmit={this.handleSubmit}
        isDisabled={this.state.isDisabled}
        role={this.state.role}
        {...this.props}
      />
    );
  }
}

export default connect((state) => ({ allFields: state.allFields }))(AddRole);

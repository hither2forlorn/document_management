import React, { Component } from "react";
import { getRole, editRole, getRoleTypes } from "./api";
import A from "config/url";
import RoleForm from "./RoleForm";
import metaRoutes from "config/meta_routes";
import query from "querystring";
import { toast } from "react-toastify";
import { loadAllFields } from "redux/actions/apiAction";
import { connect } from "react-redux";
import titleCase from "utils/textCapital";

const formId = "edit-role-form";
class EditRole extends Component {
  state = {
    id: null,
    role: {},
    roleTypes: [],
    role_controls: [],
  };

  componentDidMount() {
    const qs = query.parse(this.props.location.search);
    const id = A.getId(qs["?i"]);
    A.getId(this.props.match.params.id);
    getRole(id, (err, json) => {
      if (err) return;
      this.setState({
        role: json.data,
        role_controls: json.data.role_controls,
      });
    });
    getRoleTypes((err, roleTypes) => {
      if (err) return;
      this.setState({ roleTypes: roleTypes });
    });
  }

  handleSubmit = (e) => {
    e.preventDefault();
    const role = this.state.role;
    editRole(role, (err, data) => {
      if (err) {
        toast.error(err.response.data.message);
        return;
      }
      this.props.history.push(metaRoutes.adminRoles);
      this.props.dispatch(loadAllFields());
      toast.success(data.message);
    });
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

  render() {
    return (
      <RoleForm
        title="Edit Role"
        formId={formId}
        role={this.state.role}
        roleTypes={this.state.roleTypes}
        handleSubmit={this.handleSubmit}
        handleChange={this.handleChange}
        role_controls={this.state.role_controls}
        roles={this.state.roles}
        isEdit={true}
        {...this.props}
      />
    );
  }
}
export default connect((state) => ({ allFields: state.allFields }))(EditRole);

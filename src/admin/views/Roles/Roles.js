import React, { Component } from "react";
import { Link } from "react-router-dom";
import { getRoles, deleteRole } from "./api";
import { VIEW_EDIT, VIEW_EDIT_DELETE } from "./util";
import A from "config/url";
import moment from "moment";
import metaRoutes from "config/meta_routes";
import { Card, CardHeader, CardBody } from "reactstrap";
import { connect } from "react-redux";
import { toast } from "react-toastify";
import CustomTable from "../DocumentManagement/components/CustomTable";
import CustomTableAction from "admin/components/CustomTableAction";
import getSecurityHierarchyPath from "../Util/getSecurityHierarchyPath";
import { banks, onlyForThisVendor } from "config/bank";

class Roles extends Component {
  state = {
    roles: [],
    currentPageNumber: 1,
    startOffset: 0,
  };

  handleSelect = (number) => {
    if (number > 0 && number - 1 < this.state.roles.length / 10) {
      this.setState({
        currentPageNumber: number,
        startOffset: (number - 1) * 10,
      });
    }
  };

  updateData() {
    getRoles((err, roles) => {
      if (err) return;
      if (roles) {
        roles.forEach((branch, index) => {
          branch.serial = index + 1;
        });
        this.setState({
          roles: roles,
        });
      }
    });
  }

  componentDidMount() {
    this.updateData();
  }

  handleDelete = (id) => {
    if (window.confirm("Do you want to delete the Roles? The action is irreversible!")) {
      deleteRole(id, (err, data) => {
        if (err) this.history.push(metaRoutes.adminRoles);
        toast.info(data.message);
        this.updateData();
      });
    }
  };

  columnData = [
    {
      Header: "S.N",
      accessor: "serial",
    },
    {
      Header: "Name",
      accessor: "name",
      Cell: (row) => {
        return `${row.value} `;
      },
    },
    {
      Header: "hierarchy",
      accessor: "hierarchy",
      Cell: (row) => {
        return `${this.props.userProfile.id == 1 && row.row.original.hierarchy
            ? getSecurityHierarchyPath(this.props.allFields.hierarchy, row.row.original.hierarchy)
            : ""
          }`;
      },
    },
    {
      Header: "Date Registered",
      accessor: "createdAt",
      Cell: (row) => moment(row.value).format("dddd, MMMM Do YYYY"),
    },
    {
      Header: "Date Modified",
      accessor: "updatedAt",
      Cell: (row) => moment(row.value).format("dddd, MMMM Do YYYY"),
    },

    {
      Header: "Actions",
      accessor: "action",
      disableSortBy: true,

      Cell: ({ row }) => {
        const p = this.props.permissions || {};

        if (this.props.userProfile.roleId != 1 && (row.original.id == 4 || row.original.id == 3)) return null;
        return (
          <div style={{ cursor: "pointer" }}>
            <CustomTableAction
              to={
                metaRoutes.adminRolesEdit + "?i=" + A.getHash(row.original.id)
                // metaRoutes.adminRolesEdit + "?i=" + A.getHash(row.original.id)
              }
              buttonType="edit"
              permission={p.role}
            />
            <CustomTableAction onClick={() => this.handleDelete(row.original.id)} buttonType="delete" permission={p.role} />
          </div>
        );
      },
    },
  ];

  render() {
    if (onlyForThisVendor(banks.bok.name) && this.props.userProfile.id == 1)
      this.columnData = this.columnData?.filter((row) => row.Header != "hierarchy");

    const p = this.props.permissions ? this.props.permissions : {};
    return (
      <Card className="shadow">
        <CardHeader>
          <p className="h5">Roles</p>
          {p.role === VIEW_EDIT || p.role === VIEW_EDIT_DELETE || p.isAdmin ? (
            <Link to={metaRoutes.adminRolesAdd} className="btn-header btn btn-outline-dark btn-sm border-dark border">
              <i className="fa fa-plus" /> Add Role
            </Link>
          ) : null}
        </CardHeader>
        <CardBody>
          <CustomTable columns={this.columnData} data={this.state.roles} />
        </CardBody>
      </Card>
    );
  }
}

export default connect((state) => ({
  allFields: state.allFields,
  userProfile: state.userProfile,
}))(Roles);

import React, { Component } from "react";
import { Link } from "react-router-dom";
import moment from "moment";
import metaRoutes from "config/meta_routes";
import { getValue } from "config/util";
import { connect } from "react-redux";
import { Card, Table, CardBody, CardHeader } from "reactstrap";
import { VIEW_EDIT, VIEW_EDIT_DELETE } from "config/values";
import { CustomDelete, CustomEdit } from "admin/components";
import A from "config/url";
import CustomTableAction from "admin/components/CustomTableAction";
import CustomTable from "../DocumentManagement/components/CustomTable";

class HierarchyList extends Component {
  columnData = [
    {
      Header: "Name",
      accessor: "name",
    },
    {
      Header: "Code",
      accessor: "code",
    },
    {
      Header: "Date Created",
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
        return (
          <div style={{ cursor: "pointer" }}>
            <CustomTableAction
              to={metaRoutes.adminEditSecurityHierarchy + "?i=" + A.getHash(row.original.id)}
              buttonType="edit"
              permission={p.locationMap}
            />
            <CustomTableAction
              onClick={() => this.props.deleteHierarchy(row.original.id)}
              buttonType="delete"
              permission={p.locationType}
            />
          </div>
        );
      },
    },
  ];

  columnData = this.columnData.filter((row) => row != null);

  render() {
    const p = this.props.permissions || {};
    return (
      <Card className="shadow">
        <CardHeader>
          <p className="h5">Hierarchy List</p>
          {this.props.permissions.securityHierarchy === VIEW_EDIT || this.props.permissions.securityHierarchy === VIEW_EDIT_DELETE ? (
            <Link to={metaRoutes.adminAddSecurityHierarchy} className="btn-header btn btn-outline-dark btn-sm border-dark border">
              <i className="fa fa-plus" />
              Add Hierarchy
            </Link>
          ) : null}
        </CardHeader>
        <CardBody>
          <CustomTable
            columns={this.columnData}
            securityHierarchyBata
            data={this.props.hierarchyOnTable}
            allData={this.props.allFields.hierarchy}
          />
        </CardBody>
      </Card>
    );
  }
}

export default connect((state) => ({
  allFields: state.allFields,
  users: state.allFields.users,
}))(HierarchyList);

import React from "react";
import { Link } from "react-router-dom";
import A from "config/url";
import { getValue } from "config/util";
import { VIEW_EDIT, VIEW_EDIT_DELETE } from "config/values";
import { connect } from "react-redux";
import metaRoutes from "config/meta_routes";
import CustomDelete from "admin/components/CustomDelete";
import CustomEdit from "admin/components/CustomTableAction";
import { Card, CardHeader, CardBody } from "reactstrap";
import CustomTable from "../DocumentManagement/components/CustomTable";
import CustomTableAction from "admin/components/CustomTableAction";

class UserList extends React.Component {
  state = {
    userList: [],
    currentPageNumber: 1,
    startOffset: 0,
    roles: [],
    branches: [],
    userStatuses: [],
    departments: [],
  };

  handleSelect = (number) => {
    if (number > 0 && number - 1 < this?.props?.userList.length / 10) {
      this.setState({
        currentPageNumber: number,
        startOffset: (number - 1) * 10,
      });
    }
  };

  componentDidMount() {
    this.setState(this?.props?.allFields);
    this.setState(this?.props?.userProfile);
  }

  columnData = [
    {
      Header: "S.N",
      accessor: "serial",
    },
    {
      Header: "Identity No",
      accessor: "identityNo",
    },
    {
      Header: "Name",
      accessor: "name",
    },
    {
      Header: "Designation",
      accessor: "designation",
      disableSortBy: true,

    },
    {
      Header: "Status",
      accessor: "status",
      Cell: ({ row }) => getValue(this?.state?.userStatuses, row?.original?.statusId),
    },
    {
      Header: "User Role",
      accessor: "useRole",
      Cell: ({ row }) => getValue(this?.state?.roles, row?.original?.roleId),
    },
    {
      Header: "Branch",
      accessor: "branch",
      Cell: ({ row }) => getValue(this?.state?.branches, row?.original?.branchId),
    },
    {
      Header: "Security Hierarchy Code",
      accessor: "security_hierarchy_code",
      Cell: ({ row }) => row.original.hierarchy,
    },

    {
      Header: "Actions",
      accessor: "action",
      disableSortBy: true,

      Cell: ({ row }) => {
        const p = this.props.permissions || {};

        return (
          <div style={{ cursor: "pointer" }}>
            {this?.props?.userProfile.id == row.original.id && this?.props?.userProfile.id != 1 ? null : (
              <>
                <CustomTableAction
                  to={metaRoutes.adminUsersEdit + "?i=" + A.getHash(row.original.id)}
                  buttonType="edit"
                  permission={p.user}
                />

                <CustomTableAction
                  onClick={() => this?.props?.deleteUser(row.original.id)}
                  buttonType="delete"
                  permission={p.user}
                />
              </>
            )}
          </div>
        );
      },
    },
  ];

  render() {
    const p = this?.props?.permissions || {};
    return (
      <Card className="shadow">
        <CardHeader>
          <p className="h5">Users List</p>
          {p.user === VIEW_EDIT || p.user === VIEW_EDIT_DELETE ? (
            <Link to={metaRoutes.adminUsersAdd} className="btn-header btn btn-outline-dark btn-sm border-dark border">
              <i className="fa fa-plus" /> Add User
            </Link>
          ) : null}
        </CardHeader>
        <CardBody>
          <CustomTable columns={this?.columnData} data={this?.props?.userList} />
        </CardBody>
      </Card>
    );
  }
}

export default connect((state) => ({
  allFields: state.allFields,
  userProfile: state.userProfile,
}))(UserList);

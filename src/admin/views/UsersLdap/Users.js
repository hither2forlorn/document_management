import React, { Component } from "react";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import { Card, Input, CardBody, CardHeader, CardFooter, Col, Row, Table } from "reactstrap";
import { getUsers, deleteUser } from "./api";
import A from "config/url";
import { VIEW_EDIT, VIEW_EDIT_DELETE } from "../Roles/util";
import metaRoutes from "config/meta_routes";
import CustomEdit from "admin/components/CustomTableAction";
import { Pagination, PaginationItem, PaginationLink } from "reactstrap";
import CustomTableAction from "admin/components/CustomTableAction";
import { toast } from "react-toastify";
class Users extends Component {
  state = {
    users: [],
    roles: [],
    departments: [],
    status: "active",
    searchQuery: "",
    currentPageNumber: 1,
    startOffset: 0,
  };

  // Handle status filter change
  handleStatusFilterChange = (e) => {
  this.setState({
    status: e.target.value,
      currentPageNumber: 1, // Reset to first page
    startOffset: 0,
  });
};

// Get current status filter value
getStatusFilterValue = () => {
  return this.state.status;
};

shouldShowUser = (user) => {
  const { status } = this.state;
  
  switch (status) {
    case "active":
      return user.isActive && !user.isDeleted;
    case "inactive":
      return !user.isActive && !user.isDeleted;
    case "deleted":
      return user.isDeleted;
    default:
      return true;
  }
};

renderUserStatus = (user) => {
  if (user.isDeleted) {
    return <div className="badge badge-pill badge-danger">Deleted</div>;
  } else if (user.isActive) {
    return <div className="badge badge-pill badge-success">Active</div>;
  } else {
    return <div className="badge badge-pill badge-warning">Inactive</div>;
  }
};

  handleSelect = (number) => {
    if (number > 0 && number - 1 < this.state.users.length / 10) {
      this.setState({
        currentPageNumber: number,
        startOffset: (number - 1) * 10,
      });
    }
  };

  getObject(id, arr) {
    if (arr) {
      const obj = arr.filter((a) => (a.id === id ? 1 : 0))[0];
      if (obj) {
        return obj.name;
      }
    }
    return "";
  }

  handleDelete = (id) => {
    if (window.confirm("Do you want to delete the User? The action is irreversible!")) {
      deleteUser(id, (err, data) => {
        if (err) return;
        else this.getData();
        toast.success("user deleted successfully");
      });
    }
  };

  getData = () => {
    getUsers((err, users) => {
      if (err) return;
      this.setState({
        users: users,
      });
    });
  };

  componentDidMount() {
    this.getData();
  }

  handleSearch = (query) => {
    this.setState({  searchQuery: query.target.value,
    currentPageNumber: 1,
    startOffset: 0 });
  };

  render() {
    const PER_PAGE_SIZE = 10;
     const { searchQuery, users } = this.state;
    const permissions = this.props.permissions ? this.props.permissions : {};
    let filtered = users || [];
    const statusFilteredUsers = filtered.filter(user => this.shouldShowUser(user));
    let TOTAL_PAGES = Math.ceil(statusFilteredUsers.length / PER_PAGE_SIZE);
    // console.log(TOTAL_PAGES);
    const offset = 3;
    const start = this.state.currentPageNumber - offset <= 0 ? 0 : this.state.currentPageNumber - offset;
    const end = this.state.currentPageNumber + offset >= TOTAL_PAGES ? TOTAL_PAGES : this.state.currentPageNumber + offset;
    const paginationItems = [];
    for (let i = start; i < end; i++) {
      paginationItems.push(
        <PaginationItem key={i}>
          <PaginationLink href="" onClick={() => this.handleSelect(i + 1)}>
            {i + 1}
          </PaginationLink>
        </PaginationItem>
      );
    }

    
    // if (searchQuery) {
    //   console.log(searchQuery, users);
    //   filtered = users.filter(
    //     (user) =>
    //       user?.name?.toLowerCase()?.startsWith(searchQuery.toLocaleLowerCase()) ||
    //       user?.phoneNumber?.toLowerCase()?.startsWith(searchQuery.toLocaleLowerCase())
    //   );
    // }

    if (searchQuery) {
      const lowerSearch = searchQuery.toLowerCase();
      filtered = users.filter((user) => {
        const name = user?.name?.toLowerCase() || '';
        const phone = user?.phoneNumber?.toLowerCase() || '';
        const role = user?.roleId;
    
        const [firstName = '', lastName = ''] = name.split(' ');
    
        const isRoleMatch =
          (lowerSearch === 'maker' && role === 2) ||
          (lowerSearch === 'checker' && role === 3) ||
          (lowerSearch === 'approver' && role === 4);
    
        const isNameOrPhoneMatch =
          firstName.startsWith(lowerSearch) ||
          lastName.startsWith(lowerSearch) ||
          phone.startsWith(lowerSearch);
    
        return isRoleMatch || isNameOrPhoneMatch;
      });
    }
    
    

    const p = this.props.permissions || {};

    return (
      <div className="animated fadeIn">
        <Row>
          <Col xl={12}>
            <Card className="shadow">
              <CardHeader className="d-flex">
                <Col>
                  <p className="h5">Ldap Users</p>
                </Col>
                <Col>
                  <div className="d-flex justify-content-end align-items-center">
                    {users ? (
                      <input
                        className="form-control w-50 mr-1 border rounded"
                        type="text"
                        placeholder="Search"
                        aria-label="Search"
                        value={searchQuery}
                        onChange={this.handleSearch}
                      />
                    ) : (
                      ""
                    )}
                    <div className="pr-5">
                      <Input
                        className="w-75 mr-5  rounded"
                        type="select"
                        value={this.getStatusFilterValue()}
                        onChange={this.handleStatusFilterChange}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="deleted">Deleted</option>
                      </Input>
                    </div>
                    {permissions.isAdmin ||
                    permissions.ldapUser === VIEW_EDIT ||
                    permissions.ldapUser === VIEW_EDIT_DELETE ? (
                      <div className="ml-1">
                        <Link
                          to={metaRoutes.adminLdapUsersAdd}
                          className="btn-header btn btn-outline-dark btn-sm border-dark border"
                        >
                          <i className="fa fa-plus" />
                          Add User
                        </Link>
                      </div>
                    ) : null}
                  </div>
                </Col>
              </CardHeader>
              <CardBody>
                <Table bordered responsive>
                  <thead className="table-active">
                    <tr>
                      <th>Name</th>
                      <th>Phone Number</th>
                      <th>Role</th>

                      <th>Status</th>
                      <th style={{ width: "150px" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
  {filtered
    .filter(user => this.shouldShowUser(user)) // Apply status filter first
    .slice(this.state.startOffset, this.state.startOffset + 10) // Then apply pagination
    .map((user, index) => (
      <tr key={user.id}>
        <td>{user.name}</td>
        <td>{user.phoneNumber}</td>
        <td>{this.getObject(user.roleId, this.props.roles)}</td>
        <td>{this.renderUserStatus(user)}</td>
        <td>
          {permissions.isAdmin ||
          permissions.ldapUser === VIEW_EDIT ||
          permissions.ldapUser === VIEW_EDIT_DELETE ? (
            <CustomTableAction
              to={metaRoutes.adminLdapUsersEdit + "?i=" + A.getHash(user.id)}
              buttonType="edit"
              permission={p.ldapUser}
            />
          ) : null}
          {!user.isDeleted && (permissions.ldapUser === VIEW_EDIT_DELETE || permissions.isAdmin) ? (
            <CustomTableAction
              buttonType="delete"
              onClick={() => this.handleDelete(user.id)}
              permission={p.ldapUser}
            />
          ) : null}
        </td>
      </tr>
    ))}
</tbody>
                </Table>
              </CardBody>
              <CardFooter>
                <Pagination aria-label="Page navigation example">
                  <PaginationItem>
                    <PaginationLink first href="" onClick={() => this.handleSelect(1)} />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink previous href="" onClick={() => this.handleSelect(this.state.currentPageNumber - 1)} />
                  </PaginationItem>
                  {this.state.currentPageNumber - offset > 0 ? (
                    <PaginationItem disabled>
                      <PaginationLink href="">...</PaginationLink>
                    </PaginationItem>
                  ) : null}
                  {paginationItems.map((row) => row)}
                  {this.state.currentPageNumber + offset < TOTAL_PAGES ? (
                    <PaginationItem disabled>
                      <PaginationLink href="">...</PaginationLink>
                    </PaginationItem>
                  ) : null}
                  <PaginationItem>
                    <PaginationLink next href="" onClick={() => this.handleSelect(this.state.currentPageNumber + 1)} />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink last href="" onClick={() => this.handleSelect(TOTAL_PAGES)} />
                  </PaginationItem>
                </Pagination>
                {/* </div> */}
                {/* // </div> */}
              </CardFooter>
            </Card>
          </Col>
        </Row>
      </div>
    );
  }
}

export default connect((state) => ({
  // users: state.allFields.users,
  roles: state.allFields.roles,
  branches: state.allFields.branches,
  departments: state.allFields.departments,
  allFields: state.allFields,
}))(Users);

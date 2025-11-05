import React from "react";
import { Link } from "react-router-dom";
import { Table, Card, CardHeader, CardBody } from "reactstrap";
import A from "config/url";
import { VIEW_EDIT, VIEW_EDIT_DELETE } from "config/values";
import { connect } from "react-redux";
import metaRoutes from "config/meta_routes";
import { getUsers, deleteUser } from "../Users/api";
import { toast } from "react-toastify";
import CustomDelete from "admin/components/CustomDelete";
import CustomEdit from "admin/components/CustomTableAction";

class ListCustomer extends React.Component {
  state = {
    userList: [],
    roles: [],
    branches: [],
    userStatuses: [],
    departments: [],
    searchData: { userType: "customer" },
  };

  componentDidMount() {
    this.updateData();
    this.setState(this.props.allFields);
  }

  deleteUser(id) {
    deleteUser(id, (err, data) => {
      if (err) return;
      if (data.success) {
        toast.success("Customer deleted successfully.");
        this.updateData();
      } else {
        toast.error(data.message);
      }
    });
  }

  updateData = () => {
    getUsers(this.state.searchData, (err, data) => {
      console.log(data);
      if (err) return;
      this.setState({
        userList: data,
      });
    });
  };

  render() {
    const p = this.props.permissions || {};
    return (
      <Card className="shadow">
        <CardHeader>
          <i className="fa fa-user" />
          <strong>Customer Users</strong>
          {p.customerUser === VIEW_EDIT || p.customerUser === VIEW_EDIT_DELETE ? (
            <Link className="float-right btn btn-sm btn-success" to={metaRoutes.adminCustomerAdd}>
              Add Customer
            </Link>
          ) : null}
        </CardHeader>
        <CardBody>
          <Table responsive bordered>
            <thead>
              <tr>
                <th
                  onClick={() => {
                    this.sortBy("identityNo");
                  }}
                >
                  Identity No
                </th>
                <th
                  onClick={() => {
                    this.sortBy("name");
                  }}
                >
                  Name
                </th>
                <th
                  onClick={() => {
                    this.sortBy("email");
                  }}
                >
                  Email
                </th>
                <th
                  onClick={() => {
                    this.sortBy("phoneNumber");
                  }}
                >
                  Phone
                </th>
                <th style={{ width: "150px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {this.state.userList.map((row, index) => {
                return (
                  <tr key={index}>
                    <td>{row.identityNo}</td>
                    <td>
                      <Link to={metaRoutes.adminCustomerView + "?i=" + A.getHash(row.id)}>{row.name}</Link>
                    </td>
                    <td>{row.email}</td>
                    <td>{row.phoneNumber}</td>
                    <td>
                      {p.customerUser === VIEW_EDIT || p.customerUser === VIEW_EDIT_DELETE ? (
                        // <Link
                        //   className="mr-2 mb-2 btn btn-sm btn-primary"
                        //   title="Edit"
                        //   to={
                        //     metaRoutes.adminCustomerEdit +
                        //     "?i=" +
                        //     A.getHash(row.id)
                        //   }
                        // >
                        //   <i className="fa fa-edit" />
                        // </Link>
                        <CustomEdit to={metaRoutes.adminCustomerEdit + "?i=" + A.getHash(row.id)} />
                      ) : null}
                      {p.customerUser === VIEW_EDIT_DELETE ? (
                        // <span
                        //   className="btn btn-danger btn-sm mb-2"
                        //   title="Delete"
                        //   onClick={() => this.deleteUser(row.id)}
                        // >
                        //   <i className="fa fa-trash" />
                        // </span>
                        <CustomDelete onClick={() => this.deleteUser(row.id)} />
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </CardBody>
      </Card>
    );
  }
}

export default connect((state) => ({ allFields: state.allFields }))(ListCustomer);

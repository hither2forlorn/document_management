import React from "react";
import { Link } from "react-router-dom";
import { VIEW_EDIT, VIEW_EDIT_DELETE } from "config/values";
import A from "config/url";
import moment from "moment";
import metaRoutes from "config/meta_routes";
import { getValue } from "config/util";
import { connect } from "react-redux";
import CustomDelete from "admin/components/CustomDelete";
import CustomEdit from "admin/components/CustomTableAction";
import { Card, Table, CardBody, CardHeader, Row, Col } from "reactstrap";
import CustomTableAction from "admin/components/CustomTableAction";

class DepartmentList extends React.Component {
  render() {
    const p = this.props.permissions || {};

    return (
      <Card className="shadow">
        <CardHeader>
          <p className="h5">Departments</p>
          {p.department === VIEW_EDIT || p.department === VIEW_EDIT_DELETE ? (
            <Link to={metaRoutes.adminDepartmentsAdd} className="btn-header btn btn-outline-dark btn-sm border-dark border">
              <i className="fa fa-plus" />
              Add Department
            </Link>
          ) : null}
        </CardHeader>
        <CardBody>
          <Table responsive bordered>
            <thead className="table-active">
              <tr>
                <th>Id</th>
                <th>Name</th>
                <th>Created By</th>
                <th>Created</th>
                <th>Modified</th>
                <th style={{ width: "150px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {this.props.departmentsOnTable.map((row) => {
                return (
                  <tr key={row.id}>
                    <td>{row.id}</td>
                    <td>{row.name}</td>
                    <td>{getValue(this.props.users, row.createdBy)}</td>
                    <td>{moment(row.createdAt).format("YYYY-MM-DD")}</td>
                    <td>{moment(row.updatedAt).format("YYYY-MM-DD")}</td>
                    <td>
                      {p.department === VIEW_EDIT || p.department === VIEW_EDIT_DELETE ? (
                        // <Link
                        //   to={
                        //     metaRoutes.adminDepartmentsEdit +
                        //     "?i=" +
                        //     A.getHash(row.id)
                        //   }
                        // >
                        //   <span className="edit-items-button bg-primary">
                        //     <i className="fa fa-edit" />
                        //     Edit
                        //   </span>
                        // </Link>
                        <CustomTableAction
                          to={metaRoutes.adminDepartmentsEdit + "?i=" + A.getHash(row.id)}
                          buttonType="edit"
                          permission={p.department}
                        />
                      ) : null}

                      <CustomTableAction
                        onClick={() => this.props.deleteDepartment(row.id)}
                        buttonType="delete"
                        permission={p.department}
                      />
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

export default connect((state) => ({
  users: state.allFields.users,
}))(DepartmentList);

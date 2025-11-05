import React from "react";
import { getDocumentConditions, deleteDocumentCondition } from "./api";
import { Link } from "react-router-dom";
import { VIEW_EDIT, VIEW_EDIT_DELETE } from "config/values";
import A from "config/url";
import { loadAllFields } from "redux/actions/apiAction";
import { connect } from "react-redux";
import { toast } from "react-toastify";
import metaRoutes from "config/meta_routes";
import { getValue } from "config/util";
import CustomDelete from "admin/components/CustomDelete";
import CustomEdit from "admin/components/CustomTableAction";
import { Card, CardBody, CardHeader, Row, Col, Table } from "reactstrap";
import CustomTableAction from "admin/components/CustomTableAction";

class DocumentConditionList extends React.Component {
  state = {
    documentConditions: [],
  };

  deleteDocumentCondition = (id) => {
    if (window.confirm("Are you sure, you want to delete?")) {
      deleteDocumentCondition(id, (err, data) => {
        if (err) this.props.push(metaRoutes.adminDocumentConditions);
        if (data.success) {
          toast.success("Success!");
          this.updateData();
          this.props.dispatch(loadAllFields());
        } else {
          toast.error(data.message);
        }
      });
    }
  };

  updateData = () => {
    getDocumentConditions((err, data) => {
      if (err) return;
      this.setState({
        documentConditions: data.data,
      });
      console.log(this.state.documentConditions);
    });
  };

  componentDidMount() {
    this.updateData();
  }

  render() {
    const p = this.props.permissions || {};
    return (
      <Card className="shadow">
        <CardHeader>
          <p className="h5">Document Conditions</p>
          {p.documentCondition === VIEW_EDIT || p.documentCondition === VIEW_EDIT_DELETE ? (
            <Link
              to={metaRoutes.adminDocumentConditionsAdd}
              className="btn-header btn btn-outline-dark btn-sm border-dark border"
            >
              <i className="fa fa-plus" />
              Add Document Condition
            </Link>
          ) : null}
        </CardHeader>
        <CardBody>
          <Table responsive bordered hover>
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
              {this.state.documentConditions.map((row) => {
                return (
                  <tr key={row.id}>
                    <td>{row.id}</td>
                    <td>{row.name}</td>
                    <td>{getValue(this.props.users, row.createdBy)}</td>
                    <td>{new Date(row.createdAt).toDateString()}</td>
                    <td>{new Date(row.updatedAt).toDateString()}</td>
                    <td>
                      {p.documentCondition === VIEW_EDIT || p.documentCondition === VIEW_EDIT_DELETE ? (
                        // <Link
                        //   className="edit-items-button bg-primary"
                        //   to={
                        //     metaRoutes.adminDocumentConditionsEdit +
                        //     "?i=" +
                        //     A.getHash(row.id)
                        //   }
                        // >
                        //   <i className="fa fa-edit" />
                        //   Edit
                        // </Link>
                        <CustomTableAction
                          buttonType="edit"
                          to={metaRoutes.adminDocumentConditionsEdit + "?i=" + A.getHash(row.id)}
                          permission={p.documentCondition}
                        />
                      ) : null}
                      {p.documentCondition === VIEW_EDIT_DELETE ? (
                        <CustomTableAction
                          permission={p.documentCondition}
                          onClick={() => this.deleteDocumentCondition(row.id)}
                          buttonType="delete"
                        />
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

export default connect((state) => ({
  users: state.allFields.users,
}))(DocumentConditionList);

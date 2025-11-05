import React from "react";
import { Link } from "react-router-dom";
import { deleteLanguage, getLanguages } from "./api";
import { VIEW_EDIT, VIEW_EDIT_DELETE } from "config/values";
import { loadAllFields } from "redux/actions/apiAction";
import A from "config/url";
import { connect } from "react-redux";
import { toast } from "react-toastify";
import metaRoutes from "config/meta_routes";
import { getValue } from "config/util";
import CustomDelete from "admin/components/CustomDelete";
import CustomEdit from "admin/components/CustomTableAction";
import { Card, Row, Col, CardHeader, CardBody, Table } from "reactstrap";
import CustomTableAction from "admin/components/CustomTableAction";

class LanguageList extends React.Component {
  state = {
    languages: [],
  };

  deleteLanguage = (id) => {
    if (window.confirm("Are you sure, you want to delete?")) {
      deleteLanguage(id, (err, data) => {
        if (err) this.history.push(metaRoutes.adminLanguages);
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
    getLanguages((err, data) => {
      if (err) return;
      if (data.success) {
        this.setState({
          languages: data.data,
        });
      }
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
          <p className="h5">Language List</p>
          {p.language === VIEW_EDIT || p.language === VIEW_EDIT_DELETE ? (
            <Link to={metaRoutes.adminLanguagesAdd} className="btn-header btn btn-outline-dark btn-sm border-dark border">
              <i className="fa fa-plus" />
              Add Language
            </Link>
          ) : null}
        </CardHeader>
        <CardBody>
          {" "}
          <Table responsive bordered hover>
            <thead className="table-active">
              <tr>
                <th>Id</th>
                <th>Name</th>
                <th>Code</th>
                <th>Created By</th>
                <th>Created</th>
                <th>Modified</th>
                <th style={{ width: "150px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {this.state.languages.map((row) => (
                <tr key={row.id}>
                  <td>{row.id}</td>
                  <td>{row.name}</td>
                  <td>{row.code}</td>
                  <td>{getValue(this.props.users, row.createdBy)}</td>
                  <td>{new Date(row.createdAt).toDateString()}</td>
                  <td>{new Date(row.updatedAt).toDateString()}</td>
                  <td>
                    {p.language === VIEW_EDIT || p.language === VIEW_EDIT_DELETE ? (
                      <CustomTableAction
                        to={metaRoutes.adminLanguagesEdit + "?i=" + A.getHash(row.id)}
                        buttonType="edit"
                        permission={p.language}
                      />
                    ) : null}
                    {p.language === VIEW_EDIT_DELETE ? (
                      // <span
                      //   onClick={() => this.deleteLanguage(row.id)}
                      //   className="delete-items-button bg-danger"
                      // >
                      //   <i className="fa fa-trash" />
                      //   Delete
                      // </span>
                      <CustomTableAction
                        onClick={() => this.deleteLanguage(row.id)}
                        buttonType="delete"
                        permission={p.language}
                      />
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </CardBody>
      </Card>
    );
  }
}

export default connect((state) => ({
  users: state.allFields.users,
}))(LanguageList);

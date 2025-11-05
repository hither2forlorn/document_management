import React from "react";
import { Link } from "react-router-dom";
import { VIEW_EDIT, VIEW_EDIT_DELETE } from "config/values";
import A from "config/url";
import metaRoutes from "config/meta_routes";
import { connect } from "react-redux";
import { getValue } from "config/util";
import CustomDelete from "admin/components/CustomDelete";
import CustomEdit from "admin/components/CustomTableAction";
import { Card, CardBody, CardHeader, Row, Col, Table } from "reactstrap";
import CustomTableAction from "admin/components/CustomTableAction";
import { Tooltip } from "antd";
import getSecurityHierarchyPath from "../Util/getSecurityHierarchyPath";

class DocumentTypeList extends React.Component {
  constructor() {
    super();
    this.state = {
      showHierarchy: false,
    };
  }
  render() {
    const p = this.props.permissions || {};
    return (
      <Card className="shadow">
        <CardHeader>
          <p className="h5">Document Type List</p>

          {p.documentType === VIEW_EDIT || p.documentType === VIEW_EDIT_DELETE ? (
            <Link
              to={metaRoutes.adminDocumentTypesAdd}
              className="btn-header btn btn-outline-dark btn-sm border-dark border"
            >
              <i className="fa fa-plus" />
              Document Type
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
              {this.props?.documentTypesOnTable?.map((row) => (
                <tr key={row.id}>
                  <td>{row.id}</td>
                  <td
                    onMouseOver={() => this.setState({ showHierarchy: true })}
                    onMouseOut={() => this.setState({ showHierarchy: false })}
                  >
                    <Tooltip
                      placement="right"
                      title={getSecurityHierarchyPath(this.props.allFields.hierarchy, row.hierarchy)}
                    >
                      {row.name}
                    </Tooltip>
                  </td>
                  <td>{getValue(this.props.users, row.createdBy)}</td>
                  <td>{new Date(row.createdAt).toDateString()}</td>
                  <td>{new Date(row.updatedAt).toDateString()}</td>
                  <td>
                    {p.documentType === VIEW_EDIT || p.documentType === VIEW_EDIT_DELETE ? (
                      <CustomTableAction
                        to={metaRoutes.adminDocumentTypesEdit + "?i=" + A.getHash(row.id)}
                        buttonType="edit"
                        permission={p.documentType}
                      />
                    ) : null}
                    <CustomTableAction
                      onClick={() => this.props.deleteDocumentType(row.id)}
                      permission={p.documentType}
                      buttonType="delete"
                    />
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

  allFields: state.allFields,
}))(DocumentTypeList);

import React from "react";
import { getBranch, getBranchLogo } from "./api";
import { Link } from "react-router-dom";
import { VIEW_EDIT, VIEW_EDIT_DELETE } from "config/values";
import query from "querystring";
import A from "config/url";
import metaRoutes from "config/meta_routes";
import { Card, CardHeader, CardBody, Table, Row, Col } from "reactstrap";
import VendorLogo from "admin/components/VendorLogo";

export default class ViewBranch extends React.Component {
  state = {
    branch: {},
  };

  loadBranchLogo() {
    getBranchLogo(this.state.branch.id, (err, data) => {
      if (err) {
        return;
      }
      if (data.success) {
        const branchLogo = data.data.branchLogo;
        const img = document.getElementById("img");
        if (branchLogo) {
          img.src = new Buffer(branchLogo.data).toString("binary");
        }
      }
    });
  }

  componentDidMount() {
    const qs = query.parse(this.props.location.search);
    const id = A.getId(qs["?i"]);
    getBranch(id, (err, data) => {
      if (err) return;
      if (data.success) {
        this.setState(
          {
            branch: data.data,
          },
          () => {
            this.loadBranchLogo();
            this.forceUpdate();
          }
        );
      }
    });
  }

  render() {
    const p = this.props.permissions || {};
    return (
      <Card className="shadow">
        <CardHeader>
          <Row>
            <Col>
              <i className="fa fa-book mr-1" />
              Branch
            </Col>
            <Col>
              {p.branch === VIEW_EDIT || p.branch === VIEW_EDIT_DELETE ? (
                <Link
                  className="float-right btn btn-sm btn-success"
                  to={metaRoutes.adminBranchesEdit + "?i=" + A.getHash(this.state.branch.id)}
                >
                  {" "}
                  Edit Branch
                </Link>
              ) : null}
            </Col>
          </Row>
        </CardHeader>
        <CardBody>
          <Row>
            <Col md={6}>
              <Table responsive bordered striped>
                <tbody>
                  <tr>
                    <td>Id</td>
                    <td>{this.state.branch.id}</td>
                  </tr>

                  <tr>
                    <td>Name</td>
                    <td>{this.state.branch.name}</td>
                  </tr>

                  <tr>
                    <td>Street</td>
                    <td>{this.state.branch.street}</td>
                  </tr>

                  <tr>
                    <td>City</td>
                    <td>{this.state.branch.city}</td>
                  </tr>

                  <tr>
                    <td>Country</td>
                    <td>{this.state.branch.country}</td>
                  </tr>

                  {/* <tr>
                    <td>Postal Code</td>
                    <td>{this.state.branch.postalCode}</td>
                  </tr> */}

                  <tr>
                    <td>Phone</td>
                    <td>{this.state.branch.phoneNumber}</td>
                  </tr>

                  <tr>
                    <td>Mail Id</td>
                    <td>{this.state.branch.mailId}</td>
                  </tr>
                </tbody>
              </Table>
            </Col>
            <Col md={6}>
              <VendorLogo />
            </Col>
          </Row>
        </CardBody>
        {/* <UserList searchData={{ branchId: this.state.branch.id }} {...this.props} /> */}
      </Card>
    );
  }
}

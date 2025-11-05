import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardBody, Media, Table, Row, Col } from "reactstrap";
import { Link } from "react-router-dom";
import query from "querystring";
import A from "config/url";
import { getUser } from "../Users/api";
import moment from "moment";
import metaRoutes from "config/meta_routes";
import { VIEW_EDIT_DELETE, VIEW_EDIT } from "config/values";

const ViewCustomer = (props) => {
  const [user, setUser] = useState({});
  const p = props.permissions || {};
  useEffect(() => {
    const qs = query.parse(props.location.search);
    const id = A.getId(qs["?i"]);
    getUser(id, (err, data) => {
      if (err) return;
      setUser(data);
    });
  }, []); //eslint-disable-line

  const CustomerRow = ({ name, value }) =>
    value ? (
      <div className="row">
        <div className="p-2 col-md-4 col-sm-6 font-weight-bold">{name}:</div>
        <div className="p-2 col-md-4 col-sm-6">{value}</div>
      </div>
    ) : null;

  return (
    <Row>
      <Col md={8} sm={12}>
        <Card className="shadow">
          <CardHeader>
            <i className="fa fa-user" />
            <strong>{props.name}</strong>
            <div className="float-right">
              {p.customerUser === VIEW_EDIT || p.customerUser === VIEW_EDIT_DELETE ? (
                <Link className="float-right" to={metaRoutes.adminCustomerEdit + "?i=" + A.getHash(user.id)}>
                  <i className="fa fa-plus" /> Edit Customer
                </Link>
              ) : null}
            </div>
          </CardHeader>
          <CardBody>
            <Row>
              <Col className="table-light">
                <Row>
                  <Col md={10} sm={9}>
                    <div>
                      <Table responsive bordered hover>
                        <tbody>
                          <CustomerRow name="Customer Id" value={user.identityNo} />
                          <CustomerRow name="Name" value={user.name} />
                          <CustomerRow name="Email" value={user.email} />
                          <CustomerRow name="Phone Number" value={user.phoneNumber} />
                          <CustomerRow name="Gender" value={user.gender} />
                          <CustomerRow name="Date of Birth" value={moment(user.dateOfBirth).format("YYYY MMM DD")} />
                          <CustomerRow name="Street" value={user.street} />
                          <CustomerRow name="City" value={user.city} />
                          <CustomerRow name="Postal Code" value={user.postalCode} />
                          <CustomerRow name="Country" value={user.country} />
                        </tbody>
                      </Table>
                    </div>
                  </Col>
                  <Col md={2} sm={3}>
                    <div className="float-right">
                      <Media className="media mb-2">
                        <img
                          style={{ width: "80%" }}
                          className="profile-picture img-thumbnail self-align-end"
                          id="img"
                          alt="Profile"
                          title="Profile Pic"
                        ></img>
                      </Media>
                    </div>
                  </Col>
                </Row>
              </Col>
            </Row>
          </CardBody>
        </Card>
      </Col>
    </Row>
  );
};

export default ViewCustomer;

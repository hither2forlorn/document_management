import React from "react";
import { Link } from "react-router-dom";
import { getUser } from "./api";
import A from "config/url";
import { getValue } from "config/util";
import { VIEW_EDIT, VIEW_EDIT_DELETE, CURRENT_USER_ID } from "config/values";
import moment from "moment";
import { connect } from "react-redux";
import metaRoutes from "config/meta_routes";
import query from "querystring";
import { Card, CardBody, CardHeader, Table, Row, Col } from "reactstrap";

const UserRow = ({ name, value }) =>
  value ? (
    <tr>
      <td>{name}</td>
      <td>{value}</td>
    </tr>
  ) : null;

class Profile extends React.Component {
  state = {
    userFound: false,
    user: {},
    loginLogs: [],
    branches: [],
    roles: [],
    departments: [],
    userStatuses: [],
  };

  componentDidMount() {
    console.log("userId finder: ", this.props);
    const qs = query.parse(this.props.location.search);
    const id = A.getId(qs["?i"]);
    if (!id) {
      this.props.history.push(metaRoutes.adminUsers);
    }
    this.setState(this.props.allFields);
    this.loadProfile(id);
  }

  loadProfilePicture(profilePicture) {
    const img = document.getElementById("img");
    if (profilePicture) {
      img.src = "/img/profile.png";
      // const src = new Buffer(profilePicture.data).toString("binary");
      // if (src !== "NULL") {
      //   img.src = src;
      // }
    }
  }

  loadProfile(id) {
    getUser(id, (err, data) => {
      if (err) {
        return;
      }
      this.setState(
        {
          userFound: true,
          user: data.user,
          loginLogs: data.loginLogs ? data.loginLogs : [],
        },
        () => {
          const profilePicture = this.state.user.profile_picture;
          if (profilePicture) {
            this.loadProfilePicture(profilePicture.profilePicture);
          }
        }
      );
    });
  }

  renderItems() {
    const user = this.state.user;
    const currentUserId = parseInt(localStorage.getItem(CURRENT_USER_ID), 10);
    const p = this.props.permissions || {};
    return (
      <Row>
        <Col md={6}>
          <Card className="shadow">
            <CardHeader>
              <Row>
                <Col>
                  {" "}
                  <i className="fa fa-user mr-1" />
                  {this.props.name}
                </Col>
                <Col className="d-flex justify-content-end">
                  {user.id === currentUserId ? (
                    <Link to={metaRoutes.adminUsersChangePassword} className="btn btn-sm btn-info mr-1 text-white ">
                      Change Password
                    </Link>
                  ) : null}
                  {user.id != 1 ? null : p.user === VIEW_EDIT || p.user === VIEW_EDIT_DELETE ? (
                    <Link
                      className="btn btn-sm btn-info text-white "
                      to={metaRoutes.adminUsersEdit + "?i=" + A.getHash(this.state.user.id)}
                    >
                      Edit User
                    </Link>
                  ) : null}
                </Col>
              </Row>
            </CardHeader>
            <CardBody>
              {/* <div className="image-container">
                <img
                  className="profile-picture"
                  id="img"
                  src="/img/profile.png"
                  alt="Profile"
                />
              </div>{" "} */}
              <Table responsive bordered hover>
                <tbody>
                  <UserRow name="Identity No" value={user.identityNo} />
                  <UserRow name="Name" value={user.name} />
                  {/* <UserRow name="User Id" value={user.id} /> */}
                  <UserRow name="Email" value={user.email} />
                  <UserRow name="Username" value={user.username} />
                  <UserRow name="Gender" value={user.gender} />

                  <UserRow name="Date of Birth" value={moment(user.dateOfBirth).format("YYYY-MM-DD")} />

                  <UserRow name="Street" value={user.street} />

                  <UserRow name="City" value={user.city} />

                  <UserRow name="Country" value={user.country} />

                  <UserRow name="Postal Code" value={user.postalCode} />

                  <UserRow name="Phone Number" value={user.phoneNumber} />

                  <UserRow name="Website" value={user.website} />

                  <UserRow name="notes" value={user.notes} />

                  <UserRow name="Designation" value={user.designation} />

                  <UserRow name="Status" value={getValue(this.state.userStatuses, user.statusId)} />
                  <UserRow name="Role" value={getValue(this.state.roles, user.roleId)} />

                  <UserRow name="Branch" value={getValue(this.state.branches, user.branchId)} />

                  <UserRow name="Department" value={getValue(this.state.departments, user.departmentId)} />

                  <UserRow name="Login Attempts" value={user.loginAttempts} />

                  <UserRow name="Expire Password" value={user.expirePassword} />

                  <UserRow name="Expiry Date" value={moment(user.expiryDate).format("YYYY-MM-DD")} />

                  <UserRow name="Created At" value={moment(user.createdAt).format("YYYY-MM-DD")} />

                  <UserRow name="Updated At" value={moment(user.updatedAt).format("YYYY-MM-DD")} />
                </tbody>
              </Table>
            </CardBody>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="shadow">
            <CardHeader>
              <Row>
                <Col>
                  {" "}
                  <i className="fa fa-user mr-1" />
                  Detailed Logs
                </Col>
              </Row>
            </CardHeader>
            <CardBody>
              <Table responsive bordered hover>
                <thead>
                  <tr>
                    <th>Login</th>
                    <th>Logout</th>
                  </tr>
                </thead>
                <tbody>
                  {this.state.loginLogs.map((row, index) => {
                    return (
                      <tr key={index}>
                        <td>{new Date(row.login).toString()}</td>
                        <td>{row.logout ? new Date(row.logout).toString() : null}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </CardBody>
          </Card>
        </Col>
      </Row>
    );
  }

  render() {
    return this.renderItems();
  }
}

export default connect((state) => ({ allFields: state.allFields }))(Profile);

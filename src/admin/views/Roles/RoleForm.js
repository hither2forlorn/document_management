import React, { useEffect, useState } from "react";
import { Card, CardBody, CardHeader, CardFooter, Button, Col, Row, Input, Form, FormGroup, Label, Table } from "reactstrap";
import { optionsPage, optionsBoolean } from "./util";
import CustomSubmit from "admin/components/CustomSubmit";
import CustomCancel from "admin/components/CustomCancel";
import { connect } from "react-redux";
import { toast } from "react-toastify";
import { server } from "admin/config/server";
import { preventWhitespaceAtFirst } from "../Util/preventWhitespaceAtFirst";

const RoleForm = (props) => {
  const isEdit = !!props.isEdit;
  const role = props.role ? props.role : {};
  const [permission, setPermission] = useState({});
  const [capitalCase, setcapitalCase] = useState("");
  useEffect(() => {
    server
      .get("/permissions")
      .then((json) => {
        setPermission(json.data);
      })
      .catch((err) => {
        toast.error("Permission error");
      });
  }, []);


  const roleControls = props.role_controls ? props.role_controls : [];

  const data = roleControls.filter((role) => role?.value === "false");

  // hide when isFirstTime is false
  const isFirstTime = (data.length = 0 || data.length === 4 ? true : false);

  const renderRadio = (rT, roleValue, user_permission) => {
    switch (rT.type) {
      // Pages like document, Roles, and others.
      case "page":
        return optionsPage.map((o, i) => {
          // For Edit => change after selected.
          if (o.value == 3 && user_permission < 3) return;
          if (o.value === parseInt(roleValue)) {
            // if (o.value == 2 && user_permission < 2) return;
            return (
              <div>
                <Input
                  className="rounded"
                  type="radio"
                  id={i}
                  name={"control-" + rT.id}
                  value={o.value}
                  checked
                  onChange={props.handleChange}
                />
                <label for={i}>{o.label == "--- NONE ---" ? "None" : o.label}</label>
                <br />
              </div>
            );
          } else {
            // preview before selected
            return o.label !== "--- NONE ---" ? (
              <div>
                <Input
                  className="rounded"
                  type="radio"
                  id={i}
                  name={"control-" + rT.id}
                  value={o.value}
                  onChange={props.handleChange}
                />
                <label for={i}>{o.label}</label>
              </div>
            ) : (
              <div>
                <Input
                  className="rounded"
                  type="radio"
                  id={i}
                  name={"control-" + rT.id}
                  value={o.value}
                  onChange={props.handleChange}
                />
                <label for={i}>None</label>
              </div>
            );
          }
        });
      // For Yes / No radio Buttion
      case "boolean":
        return optionsBoolean.map((o, i) => {
          if (JSON.stringify(o.value) === roleValue) {
            return (
              <div>
                <Input
                  className="rounded"
                  type="radio"
                  id={i}
                  name={"control-" + rT.id}
                  value={o.value}
                  checked
                  onChange={props.handleChange}
                ></Input>
                <label for={i}>{o.label}</label>
              </div>
            );
          } else {
            return (
              <div>
                <Input
                  className="rounded"
                  type="radio"
                  id={i}
                  name={"control-" + rT.id}
                  value={o.value}
                  onChange={props.handleChange}
                ></Input>
                <label for={i}>{o.label}</label>
              </div>
            );
          }
        });
      default:
        return null;
    }
  };

  return (
    <Card className="shadow">
      <Form id={props.formId} onSubmit={props.handleSubmit}>
        <CardHeader>
          <p className="h5">{props.title}</p>
        </CardHeader>
        <CardBody>
          <FormGroup>
            <Label htmlFor="name">Name</Label>

            <Input
              className="rounded"
              type="text"
              name="name"
              onInput={(e) => preventWhitespaceAtFirst(e.target)}
              id="name"
              placeholder="Enter role name"
              required
              value={role.name ? role.name : ""}
              onChange={props.handleChange}
            />
          </FormGroup>
          {/* {isEdit && ( */}
          <Row>
            <Col>
              <div className="alert alert-dark" role="alert">
                Note: Manage the roles of the user by modifying the given actions.
              </div>
              <Table responsive bordered hover>
                <thead className="table-active">
                  <tr>
                    <th scope="col">Roles Type</th>
                    <th scope="col" className="text-center">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {props.roleTypes &&
                    props.roleTypes.map((rT, i) => {
                      return Object.entries(permission).map(([key, value], index) => {
                        // props.allFields
                        let roleControl = roleControls.find((rC) => rC.roleTypeId == rT.id);

                        {
                          /* remove reduntant roles */
                        }

                        if (key != rT.key || value === 0 || value === 1 || value == false) return;

                        roleControl = roleControl || {};

                        function roleName() {
                          switch (rT.name) {
                            case "User":
                              rT.name += " - logged user can control user section.";
                              break;
                            case "Ldap User":
                              rT.name += " - logged user can control AD user section.";
                              break;
                            case "Role":
                              rT.name += " - User will be able to access roles section and more.";
                              break;
                            case "Branch":
                              rT.name += " - User will be able to access branch section and more.";
                              break;
                            case "Document":
                              rT.name += " - User will be able to access document section and more";
                              break;
                            case "Download":
                              rT.name += " - User may or may not download the attachments.";
                              break;
                            case "Archived":
                              rT.name += " - User may or maynot access archive section of document.";
                              break;
                            case "Department":
                              rT.name += " -  User will be able to access department section and more.";
                              break;
                            case "Document Condition":
                              rT.name += " - User will be able to access document condition section and more.";
                              break;
                            case "Document Type":
                              rT.name += " - User will be able to access document type section and more.";
                              break;
                            case "Location Map":
                              rT.name += " - User will be able to access location map section and more.";
                              break;
                            case "Location Type":
                              rT.name += " - User will be able to access location type section and more.";
                              break;
                            case "Language":
                              rT.name += " - User will be able to access language section and more.";
                              break;
                            case "User role":
                              rT.name += " - Select yes if the user is checker or select no if the user is maker.";
                              break;
                            default:
                              rT.name += "";
                              break;
                          }
                        }

                        return (
                          <tr key={index}>
                            <td style={{ width: "50%" }}>
                              <Label htmlFor={i} title={rT.description ? rT.description : ""}>
                                {(roleName(), rT.name)}
                              </Label>
                            </td>

                            {/*with radio buttons*/}
                            <td>
                              <span className="d-flex justify-content-around">
                                {renderRadio(rT, roleControl.value, value)}
                              </span>
                            </td>
                          </tr>
                        );
                      });
                    })}
                </tbody>
              </Table>
            </Col>
          </Row>
          {/* )} */}
          <div className=""></div>
        </CardBody>
        <CardFooter className="d-flex justify-content-end">
          {isEdit ? (
            <>
              <Button onClick={() => window.history.back()} type="button" color="danger" className="mx-2 text-white">
                Cancel
              </Button>
              <Button type="submit" color="primary">
                Submit
              </Button>
            </>
          ) : (
            <>
              <CustomCancel onClick={() => window.history.back()} />
              <CustomSubmit isDisabled={props.isDisabled} />
            </>
          )}
        </CardFooter>
      </Form>
    </Card>
  );
};
export default connect((state) => ({
  allFields: state.allFields,
  userProfile: state.userProfile,
}))(RoleForm);

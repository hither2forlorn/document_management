import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getOptions } from "config/util";
import { Card, CardBody, Button, CardHeader, FormGroup } from "reactstrap";
import { banks, onlyForThisVendor } from "config/bank";

export default function SearchUser(props) {
  const [state, setState] = useState({});
  const { userProfile, allFields } = useSelector((state) => state);

  useEffect(() => {
    // Filtered only user branches.
    const result = allFields?.branches?.filter((branch) => userProfile?.branchId == branch.id);

    setState({
      ...state,
      branches: userProfile.id == 1 || onlyForThisVendor(banks.bok) ? allFields.branches : result,
    });
  }, []);

  return (
    <Card className="shadow">
      <CardHeader>
        <p className="h5">
          <i className=" fas fa-solid fa-filter"></i>
          Filter Users
        </p>
      </CardHeader>
      <CardBody className="pt-3">
        <form onSubmit={props.onSubmit} className="search-user-container">
          <FormGroup>
            <label>Status</label>
            <select className="form-control rounded" name="statusId" id="statusId">
              <option value="">--NONE--</option>
              {getOptions(allFields.userStatuses)}
            </select>
          </FormGroup>
          <FormGroup>
            <label>Role</label>
            <select className="form-control rounded" name="roleId" id="roleId">
              <option value="">--NONE--</option>
              {getOptions(allFields.roles)}
            </select>
          </FormGroup>
          <FormGroup>
            {" "}
            <label>Branch</label>
            <select className="form-control rounded" name="branchId" id="branchId">
              <option value="">--NONE--</option>
              {getOptions(allFields.branches)}
            </select>
          </FormGroup>
          <FormGroup>
            {" "}
            <label>Department</label>
            <select className="form-control rounded" name="departmentId" id="departmentId">
              <option value="">--NONE--</option>
              {getOptions(allFields.departments)}
            </select>
          </FormGroup>

          <Button className="mt-2 btn-block" type="submit">
            Filter
          </Button>
        </form>
      </CardBody>
    </Card>
  );
}

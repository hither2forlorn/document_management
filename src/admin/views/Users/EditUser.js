import React from "react";
import UserForm from "./UserForm";
import { editUser, getUser } from "./api";
import A from "config/url";
import { connect } from "react-redux";
import { toast } from "react-toastify";
import query from "querystring";
import metaRoutes from "config/meta_routes";
import { Card, CardHeader, Row, Col } from "reactstrap";
import { selectedVendor } from "config/bank";
import { loadAllFields } from "redux/actions/apiAction";
import { getDepartments } from "../Departments/api";
import { getRoles } from "../Roles/api";
import { getBranch, getBranches } from "../Branches/api";
import { getAllTags } from "../Dashboard/api/tag";

class EditUser extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      roles: [],
      userStatuses: [],
      branches: [],
      showPassword: false,
      departments: [],
      hierarchy: [],
      departmentId: false,
      userGroup: [],
      parentList: [],
      loginAttempts: [
        { id: 3, name: "3 times" },
        { id: 5, name: "5 times" },
        { id: 10, name: "10 times" },
      ],
      user: {},
      notes: null,
      validationErrors: {},
    };
  }

  handleChange = (event) => {
    let { user } = this.state;
    const { name, value, type } = event.target;
    switch (event.target.name) {
      // for switching department to
      case "hierarchy":
        const branchOrDept = this.props.allFields.hierarchy.find((row) => row.code === value);
        // autocomplete for unit
        if (branchOrDept.type === "unit") {
          // const hierarchyId = branchOrDept?.departmentId;
          // find hierarchy departmentID from hierarchies
          // const hierarchy = this.props.allFields.hierarchy.find(
          //   (row) => row.id === hierarchyId
          // );

          this.setState({
            unit: true,
            security_hierarchy: value,
            // departmentId: hierarchy.departmentId || null,
            branchId: branchOrDept?.branchId || null,
          });
        } else {
          this.setState({
            security_hierarchy: value,
            branchId: branchOrDept?.branchId || null,
            departmentId: branchOrDept?.departmentId || null,
          });
          // manually added department or branchId
          if (branchOrDept?.departmentId) {
            user["departmentId"] = branchOrDept?.departmentId;
            user["branchId"] = null;
          } else if (branchOrDept?.branchId) {
            user["branchId"] = branchOrDept?.branchId;
            user["departmentId"] = null;
          } else {
            // use old user data.
            user["departmentId"] = user["departmentId"];
            user["branchId"] = user["branchId"];
          }
        }

        break;
      case "departmentId":
        // Save the selected departmentId directly
        this.setState({
          departmentId: value,
          branchId: value
        });
        break;
      // // on branchId change
      case "branchId":
        // is unit then dont change hierarchy
        if (this.state.unit) {
          this.setState({
            [name]: value,
          });
        } else {
          const hierarchy = this.props.allFields.hierarchy.find((row) => row?.[name] == value);
          user["hierarchy"] = hierarchy?.code || this.state.security_hierarchy;

          this.setState({
            [name]: value,
            security_hierarchy: hierarchy?.code,
          });
        }
    }

    //for checkbox and  text area (notes) cases
    switch (type) {
      case "checkbox":
        user[name] = event.checked;
        break;
      case "textarea":
        user.notes = value;
        break;
      default:
        // remove department and branchId if one or other present
        if (name == "departmentId") {
          user["departmentId"] = value;
        } else if (name == "branchId") {
          user["departmentId"] = null;
        }

        user[name] = value;

        break;
    }
    this.setState({
      user,
    });
  };

  handleReset = () => {
    this.forceUpdate();
  };

  // profile picture

  // parseProfilePicture(callback) {
  //   var filesSelected = document.getElementById("profilePicture").files;
  //   if (filesSelected.length > 0) {
  //     var fileToLoad = filesSelected[0];
  //     var fileReader = new FileReader();
  //     fileReader.onload = function (fileLoadedEvent) {
  //       var srcData = fileLoadedEvent.target.result;

  //       callback(srcData);
  //     };
  //     fileReader.readAsDataURL(fileToLoad);
  //   } else {
  //     callback("NULL");
  //   }
  // }

  handleSubmit = (event) => {
    event.preventDefault();
    if (!window.confirm("Do you want to update the user?")) {
      return;
    }

    const formData = { ...this.state.user }; // Clone user state for modification
    // Include branchId from state if it exists
    if (this.state.branchId) {
      formData.branchId = this.state.branchId;
    }

    // Check if departmentId is present and starts with "Dept_"
    if (formData.departmentId && formData.hierarchy && formData.hierarchy.startsWith("Dept_")) {
      const match = formData.hierarchy.match(/\d+$/);
      if (match) {
        formData.departmentId = match[0]; // Extract the numeric part from hierarchy
      }
    }

    if (formData.branchId) {
      const branchId = this?.state?.branches?.find((branch) => branch.name === formData.branchId)?.id;
      formData.branchId = branchId;
    }


    if (formData.hierarchy && formData.hierarchy.startsWith("Branch_")) {
      const match = formData.hierarchy.match(/\d+$/);
      if (match) {
        formData.branchId = match[0]; // Extract the numeric part from hierarchy
      }
    }

    if (formData.password) {
      if (!this.validatePasswordConf(formData.password, formData.confirmPassword)) {
        return;
      }
    }


    delete formData.confirmPassword;

    editUser(formData, (err, data) => {
      if (err) {
        if (err?.response?.status === 409) {
          toast.error(err.response.data.message);
          return;
        }
        this.setState({
          validationErrors: err.response.data.data,
        });
        toast.error("There are some errors with the data provided.");
        return;
      }
      if (data.success) {
        this.props.dispatch(loadAllFields());
        toast.success("Successful!");
      } else {
        return toast.warn(data.message);
      }
      this.props.history.push(metaRoutes.adminUsers);
    });
  };


  validatePasswordConf = (p, pConf) => {
    if (p !== pConf) {
      document.getElementById("confirmPassword").focus();
      toast.warn("Passwords do not match!");
      return false;
    } else {
      return true;
    }
  };

  componentDidMount() {
    const qs = query.parse(this.props.location.search);
    const id = A.getId(qs["?i"]);

    if (!id) {
      this.props.history.push(metaRoutes.adminUsers);
    }
    getUser(id, (err, data) => {
      if (err) return;
      this.setState({
        user: data.user,
      });
    });
    getDepartments((err, departments) => {
      if (err) return;
      this.setState(
        {
          parentList: departments
        }
      );
    });
    getRoles((err, roles) => {
      if (err) return;
      this.setState(
        {
          roles: roles
        }
      )
    })
    getBranches((err, branches) => {
      if (err) return;
      this.setState(
        {
          branches: branches.data
        }
      )
    })

    this.setState(this.props.allFields);
  }
  handleShowPassword = (e) => {
    const showPassword = this.state.showPassword;
    this.setState({ showPassword: !showPassword });
  };

  render() {
    return (
      <Card className="shadow">
        <CardHeader>
          <Row>
            <Col>
              <i className="fa fa-user mr-1" />
              {this.props.name}
            </Col>
          </Row>
        </CardHeader>
        <UserForm
          validationErrors={this.state.validationErrors ? this.state.validationErrors : null}
          user={this.state.user}
          onReset={this.handleReset}
          onChange={this.handleChange}
          onShowPassword={this.handleShowPassword}
          onSubmit={this.handleSubmit}
          isEdit
          {...this.props}
          {...this.state}
        />
      </Card>
    );
  }
}

export default connect((state) => ({ allFields: state.allFields }))(EditUser);



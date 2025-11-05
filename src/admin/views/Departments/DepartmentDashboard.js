import React from "react";
import DepartmentMapStructure from "./DepartmentMapStructure";
import DepartmentList from "./DepartmentList";
import { getDepartments, deleteDepartment } from "./api";
import { loadAllFields } from "redux/actions/apiAction";
import { connect } from "react-redux";
import { toast } from "react-toastify";
import metaRoutes from "config/meta_routes";
import { Row, Col } from "reactstrap";

class DepartmentDashboard extends React.Component {
  constructor(props) {
    super(props);
    this.onFilter = this.onFilter.bind(this);
  }

  state = {
    departments: [],
    departmentsOnTable: [],
    departmentParentId: null,
    departmentBranchId: [],
  };

  onFilter(id, parentId) {
    if (!Array.isArray(this.state.departments) || (this.state.departments.success === false)) {
      return null; // Render nothing if no departments or unsuccessful fetch
    }
    // Filter the departments based on id or parentId
    const filteredData = this.state.departments.filter((item) => {
      if (id !== null) {
        return item.id === id; // Match the selected department
      } else if (parentId !== null) {
        return item.parentId === parentId; // Match departments with the given parentId
      }
      return true; // Default: Show all departments
    });

    this.setState({
      departmentsOnTable: filteredData,
      departmentParentId: parentId,
    });
  }

  deleteDepartment = (id) => {
    if (window.confirm("Do you want to delete?")) {
      deleteDepartment(id, (err, data) => {
        if (err) this.history.push(metaRoutes.adminDepartments);
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

  updateData() {
    getDepartments((err, departments) => {
      if (err) return;
      this.setState(
        {
          departments: departments,
        },
        () => {
          this.onFilter(null, null) // Default filter to show all departments
        }
      );
    });
  }

  componentDidMount() {
    this.updateData();
  }

  renderItems() {
    return (
      <Row>
        <Col md={4}>
          <DepartmentMapStructure
            departments={this.state.departments}
            onFilter={this.onFilter}
            {...this.props}
          />
        </Col>
        <Col md={8} className="pl-3 pl-md-0">
          <DepartmentList
            departmentsOnTable={this.state.departmentsOnTable}
            deleteDepartment={this.deleteDepartment}
            {...this.props}
          />
        </Col>
      </Row>
    );
  }

  render() {
    return this.renderItems();
  }
}

export default connect()(DepartmentDashboard);
import React, { Component } from "react";
import { Row, Col } from "reactstrap";
import HierarchyMapStructure from "./HierarchyMapStructure";
import HierarchyList from "./HierarchyList";
import { connect } from "react-redux";
import { deleteHierarchy, getSecurityHierarchy } from "./api";
import metaRoutes from "config/meta_routes";
import { toast } from "react-toastify";

class HierarchyDashboard extends Component {
  constructor(props) {
    super(props);
    this.onFilter = this.onFilter.bind(this);
  }

  state = {
    hierarchy: [],
    hierarchyOnTable: [],
  };

  onFilter(parentId) {
    const filteredData = this.state.hierarchy.filter((item) => {
      if (item.parentId === parentId) {
        return 1;
      }
      return 0;
    });
    this.setState({
      hierarchyOnTable: filteredData,
    });
  }

  deleteHierarchy = (id) => {
    if (window.confirm("Do you want to delete?")) {
      deleteHierarchy(id, (err, data) => {
        if (err) this.history.push(metaRoutes.adminSecurityHierarchy);
        if (data.success) {
          toast.success("Success!");
          this.updateData();
          // this.props.dispatch (loadAllFields());
        } else {
          toast.error(data.message);
        }
      });
    }
  };

  updateData() {
    getSecurityHierarchy((err, hierarchy) => {
      if (err) return;
      this.setState(
        {
          hierarchy: hierarchy,
        },
        () => {
          this.onFilter(null);
        }
      );
    });
  }

  componentDidMount() {
    this.updateData();
  }

  render() {
    return (
      <Row>
        <Col md={5}>
          <HierarchyMapStructure hierarchy={this.state.hierarchy} onFilter={this.onFilter} {...this.props} />
        </Col>
        <Col md={7} className="pl-3 pl-md-1">
          {" "}
          <HierarchyList
            hierarchyOnTable={this.state.hierarchyOnTable}
            deleteHierarchy={this.deleteHierarchy}
            {...this.props}
          />
        </Col>
      </Row>
    );
  }
}

export default connect()(HierarchyDashboard);

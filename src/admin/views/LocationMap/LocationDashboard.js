import React from "react";
import LocationMapStructure from "./LocationMapStructure";
import LocationList from "./LocationList";
import { getLocationMaps, deleteLocationMap } from "./api";
import { loadAllFields } from "redux/actions/apiAction";
import { connect } from "react-redux";
import { toast } from "react-toastify";
import metaRoutes from "config/meta_routes";
import { Row, Col } from "reactstrap";

class LocationDashboard extends React.Component {
  constructor(props) {
    super(props);
    this.onFilter = this.onFilter.bind(this);
  }

  state = {
    locationMaps: [],
    locationMapsOnTable: [],
  };

  onFilter(parentId) {
    const filteredData = this.state.locationMaps.filter((item) => {
      if (item.parentId === parentId) {
        return 1;
      }
      return 0;
    });
    this.setState({
      locationMapsOnTable: filteredData,
    });
  }

  deleteLocationMap = (id) => {
    if (window.confirm("Are you sure, you want to delete?")) {
      deleteLocationMap(id, (err, data) => {
        if (err) this.history.push(metaRoutes.adminLocationMaps);
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
    getLocationMaps((err, data) => {
      if (err) return;
      this.setState(
        {
          locationMaps: data.data,
        },
        () => {
          this.onFilter(null);
        }
      );
    });
  };

  componentDidMount() {
    this.updateData();
  }

  renderItems() {
    return (
      <Row>
        <Col md={4}>
          <LocationMapStructure
            locationMaps={this.state.locationMaps}
            hierarchy={this.props.allFields.hierarchy}
            onFilter={this.onFilter}
          />
        </Col>
        <Col md={8} className="pl-3 pl-md-0">
          <LocationList
            allLocationData={this.state.locationMaps}
            locationMapsOnTable={this.state.locationMapsOnTable}
            deleteLocationMap={this.deleteLocationMap}
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

export default connect((state) => ({
  allFields: state.allFields || [],
}))(LocationDashboard);

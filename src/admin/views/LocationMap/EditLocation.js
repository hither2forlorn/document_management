import React from "react";
import { editLocationMap, getLocationMap } from "./api";
import A from "config/url";
import { loadAllFields } from "redux/actions/apiAction";
import { connect } from "react-redux";
import LocationMapForm from "./LocationMapForm";
import { toast } from "react-toastify";
import metaRoutes from "config/meta_routes";
import query from "querystring";
import { Card, CardHeader } from "reactstrap";
import titleCase from "utils/textCapital";

class EditLocation extends React.Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  state = {
    locationMap: {},
    validationErrors: {},
  };

  componentDidMount() {
    const qs = query.parse(this.props.location.search);
    const id = A.getId(qs["?i"]);
    A.getId(this.props.match.params.id);
    getLocationMap(id, (err, data) => {
      if (err) {
        this.props.history.push(metaRoutes.adminLocationMaps);
      }
      if (data.success && data.data) {
        this.setState({
          locationMap: data.data,
        });
      }
    });
  }

  handleChange = (event, info) => {
    // set data for react-select
    if (info?.name) {
      this.setState({
        locationMap: { ...this.state.locationMap, [info?.name]: event },
      });
    } else {
      const name = event.target.name;
      let value = event.target.value;
      const locationMap = this.state.locationMap;
      if (name === "name") {
        value = titleCase(value);
      }

      if (name === "parentId") {
        const parent = this.props.locationMaps.filter((item) => {
          if (item.id === Number(value)) {
            return 1;
          }
          return 0;
        })[0];
        if (Number(value) === locationMap.id) {
          toast.warn("Could not select itself as parent!");
          locationMap.parentId = "";
        } else {
          if (parent) {
            locationMap.parentId = parent.id;
            locationMap.level = parent.level + 1;
          } else {
            locationMap.parentId = null;
            locationMap.level = 0;
          }
        }
      } else {
        locationMap[name] = value;
      }
      this.setState({
        locationMap: { ...locationMap },
      });
    }
  };

  handleSubmit = (event) => {
    event.preventDefault();
    const locationMap = this.state.locationMap;
    locationMap.parentId = locationMap.parentId ? locationMap.parentId : null;
    editLocationMap(locationMap, (err, data) => {
      if (err) {
        this.setState({
          validationErrors: err.response.data.data,
        });
        toast.error(err.response.data.message);
        return;
      }
      if (data.success) {
        toast.success(data.message);
        this.props.history.push(metaRoutes.adminLocationMaps);
        this.props.dispatch(loadAllFields());
      } else {
        toast.warn(data.message);
      }
    });
  };

  renderItems() {
    return (
      <Card className="shadow">
        <CardHeader>
          <p className="h5">Edit Location Map</p>
        </CardHeader>
        <LocationMapForm
          isEdit
          locationMap={this.state.locationMap}
          handleChange={this.handleChange}
          handleSubmit={this.handleSubmit}
          validationErrors={this.state.validationErrors ? this.state.validationErrors : null}
          {...this.props}
        />
      </Card>
    );
  }

  render() {
    return this.renderItems();
  }
}

export default connect((state) => ({ ...state.allFields }))(EditLocation);

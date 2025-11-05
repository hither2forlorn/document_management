import React from "react";
import LocationMapForm from "./LocationMapForm";
import { addLocationMap } from "./api";
import { getFormData } from "config/form";
import { loadAllFields } from "redux/actions/apiAction";
import { connect } from "react-redux";
import { toast } from "react-toastify";
import metaRoutes from "config/meta_routes";
import { Card, CardHeader } from "reactstrap";
import titleCase from "utils/textCapital";

class AddLocation extends React.Component {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  state = {
    locationTypes: [],
    locationMaps: [],
    locationMap: {},

    validationErrors: {},
    isDisabled: false,
  };

  handleChange = (event, info) => {
    // set data for react-select
    if (info?.name) {
      this.setState({
        locationMap: { ...this.state.locationMap, [info?.name]: event },
      });
    } else {
      event.preventDefault();
      const name = event.target.name;
      let value = event.target.value;
      if (name == "name") {
        value = titleCase(value);
        this.setState({
          locationMap: { ...this.state.locationMap, [name]: value },
        });
      }
    }
  };

  handleSubmit = (event) => {
    event.preventDefault();
    const formData = getFormData(event);
    const parent = this.state.locationMaps.filter((item) => {
      if (item.id === Number(formData.parentId)) {
        return 1;
      }
      return 0;
    })[0];
    if (parent) {
      formData.parentId = parent.id;
      formData.level = parent.level + 1;
    } else {
      formData.level = 0;
    }

    formData.multiple_hierarchy = this.state.locationMap.multiple_hierarchy;
    addLocationMap(formData, (err, data) => {
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
        this.setState({ isDisabled: true });
      } else {
        toast.warn(data.message);
      }
    });
  };
  componentDidMount() {
    this.setState(this.props.allFields);
  }
  renderItems() {
    return (
      <Card className="shadow">
        <CardHeader>
          <p className="h5">Add Location Map</p>
        </CardHeader>
        <LocationMapForm
          handleSubmit={this.handleSubmit}
          handleChange={this.handleChange}
          validationErrors={this.state.validationErrors ? this.state.validationErrors : null}
          {...this.state}
          {...this.props}
        />
      </Card>
    );
  }

  render() {
    return this.renderItems();
  }
}

export default connect((state) => ({ allFields: state.allFields }))(AddLocation);

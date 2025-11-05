import React from "react";
import Routes from "./routes";

export default class LocationType extends React.Component {
  render() {
    return <Routes {...this.props} />;
  }
}

import React from "react";
import Routes from "./routes";

export default class Branches extends React.Component {
  render() {
    return <Routes {...this.props} />;
  }
}

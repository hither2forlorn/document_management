import React from "react";
import Routes from "./routes";

export default class DocumentTypes extends React.Component {
  constructor(props) {
    super(props);
    this.renderItems = this.renderItems.bind(this);
  }

  renderItems() {
    return <Routes {...this.props} />;
  }

  render() {
    return this.renderItems();
  }
}

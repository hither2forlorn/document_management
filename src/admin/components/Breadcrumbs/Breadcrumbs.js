import React from "react";
import { Breadcrumb } from "reactstrap";
import { Link } from "react-router-dom";

export default class Breadcrumbs extends React.Component {
  constructor(props) {
    super(props);
    this.renderItems = this.renderItems.bind(this);
  }

  renderItems() {
    let url = window.location.hash;
    url = url.slice(1, url.length);
    const paths = url.split("/");
    const breadcrumbs = paths.filter((word) => word !== "");
    if (breadcrumbs.length === 0) {
      breadcrumbs.push("dashboard");
    }
    let storeUrl = "";
    return (
      <Breadcrumb>
        {breadcrumbs.map((row) => {
          storeUrl += "/" + row;
          return (
            <div key={row}>
              <Link to={storeUrl}>{row}</Link>
              <span style={{ padding: 10 }}> / </span>
            </div>
          );
        })}
      </Breadcrumb>

      // <li className={match.isExact ? 'breadcrumb-active' : undefined}>
      //     <Link to={match.url || ''}>
      //         {match.url}
      //     </Link>
      // </li>
    );
  }

  render() {
    return <div>{this.renderItems()}</div>;
  }
}

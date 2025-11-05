import React from "react";
import { connect } from "react-redux";
import { getOptions } from "config/util";
import { CardBody, CardHeader, Label } from "reactstrap";

const logo = "/img/doctype.svg";
class SearchIndexType extends React.Component {
  state = {
    documentTypes: [],
    showInfo: true,
  };

  onChange = ({ target: { name, value } }) => {
    this.props.handleIndexTypeChange({
      target: { name: "documentTypeId", value: value },
    });
    this.setState({
      showInfo: false,
    });
    this.props.handleSelectIndexType(value);
  };

  componentDidMount() {
    this.setState(this.props.allFields);
  }

  renderItems() {
    return (
      <>
        <CardHeader>
          <p className="h5">
            <i className=" fas fa-solid fa-filter"></i>
            Filter Index Type
          </p>
        </CardHeader>
        <CardBody className="pt-3">
          <form onSubmit={(e) => e.preventDefault()}>
            <Label className="mt-1">Document Type</Label>
            <select
              className="form-control rounded"
              name="documentTypeId"
              id="documentTypeId"
              value={this.props.documentTypeId}
              onChange={this.onChange}
              style={{ width: "100%" }}
              required
            >
              <option value="">-- NONE --</option>
              {getOptions(this.state.documentTypes)}
            </select>
          </form>

          {this.state.showInfo ? (
            <img src={logo} alt="doc type select icon" style={{ width: "100%" }} className="mt-3" />
          ) : null}
        </CardBody>
      </>
    );
  }

  render() {
    return this.renderItems();
  }
}

export default connect((state) => ({
  allFields: state.allFields,
  searchData: state.docSearchData,
}))(SearchIndexType);

import React, { Component } from "react";
import QrReader from "react-qr-reader";
import { searchDocuments } from "./api";
import { Col, Row, Input, Form, Button } from "reactstrap";
import DocumentListTable from "./components/DocumentListTable";
import DocumentCheckoutAction from "./components/DocumentCheckoutAction";
import { connect } from "react-redux";
import { toast } from "react-toastify";

class QRCodeScanner extends Component {
  state = {
    identifier: "",
    documentList: [],
  };

  handleScan = (data) => {
    if (data) {
      this.setState(
        {
          identifier: data,
        },
        () => {
          this.updateData();
        }
      );
    }
  };

  onSubmit = (e) => {
    e.preventDefault();
    this.updateData();
  };

  updateData = () => {
    if (this.state.identifier) {
      searchDocuments(
        {
          identifier: this.state.identifier,
          checkedOut: true,
        },
        (err, json) => {
          if (err) {
            return;
          }
          if (!json.data.length) {
            toast.warn("No document found!");
          }
          this.setState({
            documentList: json.data,
          });
        }
      );
    }
  };

  componentDidMount() {
    this.setState({
      isMounted: true,
    });
  }

  componentWillUnmount() {
    return new Promise((resolve) => {
      this.setState({ isMounted: false }, () => resolve());
    });
  }

  handleError = (err) => {
    console.error(err);
  };

  render() {
    return (
      <React.Fragment>
        <Row>
          {this.state.isMounted ? (
            <>
              <Col md={3}>
                <QrReader delay={300} onError={this.handleError} onScan={this.handleScan} style={{ width: "100%" }} />
                <Form onSubmit={this.onSubmit}>
                  <Input
                    required
                    placeholder="Identifier"
                    className="my-2 rounded "
                    value={this.state.identifier}
                    onChange={({ target: { value } }) => this.setState({ identifier: value })}
                  />
                  <Button size="sm" color="primary" className="float-right mb-2">
                    <i className="fa fa-search mr-2" />
                    Find
                  </Button>
                </Form>
              </Col>
              {this.state.documentList.length ? (
                <Col md={5}>
                  <DocumentCheckoutAction document={this.state.documentList[0]} />
                </Col>
              ) : null}
            </>
          ) : null}
          <p>{this.state.result}</p>
        </Row>
        <DocumentListTable documentList={this.state.documentList} permissions={this.props.permissions} />
      </React.Fragment>
    );
  }
}

export default connect((state) => ({
  ...state.allFields,
}))(QRCodeScanner);

import React from "react";
import { connect } from "react-redux";
import { getOptions } from "config/util";
import { Card, CardBody, Label, Input, Button, Form, FormGroup } from "reactstrap";
import { getIndexType, getIndexTypes } from "../IndexType/api";

class SearchDocument extends React.Component {
  constructor(props) {
    super();
    this.myRef = React.createRef();
  }
  state = {
    documentTypes: [],
    statuses: [],
    locationMaps: [],
    indexList: [],
    parentDocTypes: [],
  };

  componentDidMount() {
    this.setState(this.props.allFields);
    {
      /* for displaying parent document types only */
    }
    let tempParentDocTypes = [];
    this.props.allFields.documentTypes.map((el) => {
      if (!el.parentId) {
        tempParentDocTypes.push(el);
      }
    });

    this.setState({ parentDocTypes: tempParentDocTypes });

    getIndexTypes((err, data) => {
      // console.log(data);
      this.setState({
        indexList: data?.data,
      });
    });
  }

  handleReset = () => {
    // this.setState({ indexList: [] });
    // window.location.reload();
    this.props.onReset();
  };

  renderItems() {
    return (
      <></>
      // <Card className="shadow">
      //   <CardBody>
      //     <Form onSubmit={(e) => e.preventDefault()} ref={this.myRef}>
      //       <FormGroup>
      //         <Label className="mt-1">Document Type</Label>
      //         <select
      //           className="form-control rounded"
      //           name="documentTypeId"
      //           id="documentTypeId"
      //           value={getOptions(this.state.id)}
      //           onChange={this.props.onChange}
      //           style={{ width: "100%" }}
      //         >
      //           <option value="">-- NONE --</option>
      //           {getOptions(this.state.parentDocTypes)}
      //         </select>
      //         {this.state.indexList &&
      //           this.state.indexList.map((item, idx) => (
      //             <>
      //               {this.props.searchData.documentTypeId &&
      //               item.docId == this.props.searchData.documentTypeId ? (
      //                 <div key={idx}>
      //                   <Label>{item.label}</Label>
      //                   <Input
      //                     className="form-control rounded"
      //                     name="indexTypeId"
      //                     id="indexTypeId"
      //                     type="text"
      //                     name={item.label}
      //                     // value={this.props.searchData.indexList}
      //                     onChange={this.props.onChange}
      //                     style={{ width: "100%" }}
      //                   />
      //                 </div>
      //               ) : null}
      //             </>
      //           ))}
      //       </FormGroup>

      //       <FormGroup>
      //         <Label>Simple Search</Label>
      //         <Input
      //           // ref={this.myRef}
      //           className="form-control rounded"
      //           type="text"
      //           name="simpleText"
      //           id="simpleText"
      //           value={this.props.searchData.simpleText || ""}
      //           onChange={this.props.onChange}
      //           style={{ width: "100%" }}
      //         />
      //       </FormGroup>

      //       <FormGroup>
      //         <Label>Advanced Search</Label>
      //         <Input
      //           className="form-control rounded"
      //           type="text"
      //           name="advanceText"
      //           id="advanceText"
      //           value={this.props.searchData.advanceText || ""}
      //           onChange={this.props.onChange}
      //           style={{ width: "100%" }}
      //         />
      //       </FormGroup>

      //       <FormGroup>
      //         <Label className="mt-1">Department</Label>
      //         <select
      //           className="form-control rounded"
      //           name="departmentId"
      //           id="departmentId"
      //           value={this.props.searchData.departmentId || ""}
      //           onChange={this.props.onChange}
      //           style={{ width: "100%" }}
      //         >
      //           <option value="">-- NONE --</option>
      //           {getOptions(this.state.departments)}
      //         </select>
      //       </FormGroup>

      //       <FormGroup>
      //         <Label className="mt-1">Location Map</Label>
      //         <select
      //           className="form-control rounded"
      //           name="locationMapId"
      //           id="locationMapId"
      //           value={this.props.searchData.locationMapId || ""}
      //           onChange={this.props.onChange}
      //           style={{ width: "100%" }}
      //         >
      //           <option value="">-- NONE --</option>
      //           {getOptions(this.state.locationMaps)}
      //         </select>
      //       </FormGroup>

      //       <FormGroup>
      //         <Label className="mt-1">Status</Label>
      //         <select
      //           className="form-control rounded"
      //           name="statusId"
      //           id="statusId"
      //           value={this.props.searchData.statusId || ""}
      //           onChange={this.props.onChange}
      //           style={{ width: "100%" }}
      //         >
      //           <option value="">-- NONE --</option>
      //           {getOptions(this.state.statuses)}
      //         </select>
      //       </FormGroup>

      //       <FormGroup>
      //         <Label className="mt-1">From</Label>
      //         <Input
      //           className="form-control rounded"
      //           type="date"
      //           name="startDate"
      //           id="startDate"
      //           value={this.props.searchData.startDate || ""}
      //           onChange={this.props.onChange}
      //           style={{ width: "100%" }}
      //         />
      //       </FormGroup>

      //       <FormGroup>
      //         <Label className="mt-1">To</Label>
      //         <Input
      //           className="form-control rounded"
      //           type="date"
      //           name="endDate"
      //           id="endDate"
      //           value={this.props.searchData.endDate || ""}
      //           onChange={this.props.onChange}
      //           style={{ width: "100%" }}
      //         />
      //       </FormGroup>
      //       <Button onClick={this.handleReset}>Reset</Button>
      //     </Form>
      //   </CardBody>
      // </Card>
    );
  }

  render() {
    return this.renderItems();
  }
}

export default connect((state) => ({
  allFields: state.allFields,
  searchData: state.docSearchData,
}))(SearchDocument);

import React from "react";
import { Card, CardHeader, CardBody, CardFooter, Button, Input, Table, Label, Progress } from "reactstrap";
import { toast } from "react-toastify";
import { CustomInput, CustomSelect } from "admin/components";
import { server } from "admin/config/server";
import { connect } from "react-redux";
import { getFormData } from "config/form";
import _ from "lodash";
import metaRoutes from "config/meta_routes";

class BulkUpload extends React.Component {
  state = {
    indexes: [],
    selectedFiles: [],
    loading: 0,
  };

  onSelectIndex = (event) => {
    const reader = new FileReader();
    const file = event.target.files[0];
    new Promise((resolve, reject) => {
      reader.onload = (event) => resolve(event.target.result);
      reader.onerror = (error) => reject(error);
      reader.readAsText(file);
    })
      .then((content) => {
        const indexes = content.split("\n");
        this.setState({
          indexes,
        });
      })
      .catch((err) => {
        console.log(err);
      });
  };

  onChange = (event) => {
    const selectedFiles = [];
    const files = event.target.files;
    for (var key in files) {
      const file = files[key];
      // console.log(file);

      if (file.size) {
        selectedFiles.push(file);
      }
    }
    this.setState({
      selectedFiles: selectedFiles,
    });
  };

  onDelete = (index) => {
    const selectedFiles = _.filter(this.state.selectedFiles, (_, i) => !(i === index));
    this.setState({
      selectedFiles,
    });
  };

  onSubmit = (e) => {
    e.preventDefault();
    const formData = getFormData(e);
    if (this.state.selectedFiles.length > 0) {
      const data = new FormData();
      data.append("document", JSON.stringify(formData));
      data.append("itemType", "document");
      for (var file in this.state.selectedFiles) {
        data.append("file", this.state.selectedFiles[file]);
      }
      this.setState({
        loading: 0,
      });
      server
        .post("/attachment/bulk-upload", data, {
          onUploadProgress: (progressEvent) => {
            const percentage = parseInt(Math.round((progressEvent.loaded / progressEvent.total) * 100));
            this.setState({
              loading: percentage,
            });
          },
        })
        .then((_) => {
          toast.success("Success!");
          this.setState({
            loading: undefined,
          });
          this.props.history.push(metaRoutes.documentsList);
        })
        .catch((err) => {
          toast.error("Error!");
          this.setState({
            loading: undefined,
          });
        });
    } else {
      window.alert("No files selected!");
    }
  };

  componentDidMount() {
    this.setState(this.props.allFields);
  }

  render() {
    return (
      <div className="animate fadeIn">
        <form onSubmit={this.onSubmit}>
          <Card className="shadow">
            <CardHeader>Index</CardHeader>
            <CardBody className="component-content-container">
              <CustomSelect label="Document Type" name="documentTypeId" options={this.state.documentTypes} />

              <CustomInput required label="Organization Name" name="name" />

              <CustomSelect label="Language" name="languageId" options={this.state.languages} />

              <CustomSelect label="Document Condition" name="documentConditionId" options={this.state.documentConditions} />

              <CustomSelect label="Status" name="statusId" options={this.state.statuses} />

              <CustomSelect label="Location Map" name="locationMapId" options={this.state.locationMaps} />

              <CustomSelect required label="Security Level" name="securityLevel" options={this.state.securityLevels} />

              <CustomSelect label="Department" name="departmentId" options={this.state.departments} />

              <CustomSelect
                label="Archive"
                name="isArchived"
                options={[
                  { name: "Yes", id: true },
                  { name: "No", id: false },
                ]}
              />
            </CardBody>
          </Card>
          <Card className="shadow">
            <CardHeader>
              Bulk Upload
              <Label htmlFor="upload" className="mx-2 btn btn-primary btn-sm text-white">
                <i className="fa fa-upload" />
              </Label>
              <Input multiple type="file" id="upload" className="d-none" onChange={this.onChange} />
            </CardHeader>
            <CardBody>
              <Table bordered responsive>
                <tbody>
                  {this.state.selectedFiles.map((file, index) => {
                    return (
                      <tr key={index}>
                        <td>{file.name}</td>
                        <td>{file.type}</td>
                        <td>
                          <Button onClick={() => this.onDelete(index)} className="text-white" color="danger" size="sm">
                            <i className="fa fa-trash" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </CardBody>
            <CardFooter>
              {this.state.loading !== undefined ? <Progress id="progress-bar" value={this.state.loading} /> : null}
              <Button type="submit" className="mr-2 btn btn-success btn-sm text-white float-right">
                Upload
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    );
  }
}

export default connect((state) => ({ allFields: state.allFields }))(BulkUpload);

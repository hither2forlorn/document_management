import React, { useEffect, useState } from "react";
import { Form, FormGroup, Label, Card, CardHeader, Button, Input, CardBody, CardFooter } from "reactstrap";
import { getWatermark, postWatermark } from "./api";
import { toast } from "react-toastify";
import CustomCancel from "admin/components/CustomCancel";
import CustomSubmit from "admin/components/CustomSubmit";

const Watermark = () => {
  const [watermarkValue, setWatermarkValue] = useState({});
  const [selectedFiles, setSelectedFiles] = useState(null);

  const handleChange = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    let watermark = watermarkValue;
    watermark[name] = value;
    console.log(watermark);
    setWatermarkValue({ ...watermark });
  };
  const uploadHandler = (e) => {
    setSelectedFiles(e.target.files[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(watermarkValue);
    const data = new FormData();
    data.append("text", watermarkValue.text);
    data.append("isActive", watermarkValue.isActive);
    data.append("file", selectedFiles);
    postWatermark(data, (err, data) => {
      if (err) return;
      if (data.success) {
        setWatermarkValue({});
        setSelectedFiles(null);
        toast.success("Successful!");
      } else {
        toast.error("Error!");
      }
    });
  };

  return (
    <Card className="shadow" style={{ width: "40%" }}>
      <CardHeader>
        <i className="fa fa-adjust" />
        Watermark
      </CardHeader>
      <Form onSubmit={handleSubmit}>
        <CardBody>
          <FormGroup>
            <Label>Active</Label>
            <Input
              className="rounded"
              type="select"
              name="isActive"
              required
              // value={watermarkValue && watermarkValue.isActive}
              onChange={handleChange}
            >
              <option value="">--SELECT ONE--</option>
              <option value="1">Yes</option>
              <option value="0">No</option>
            </Input>
          </FormGroup>
          <FormGroup>
            <Label>Text</Label>
            <Input
              className="rounded"
              type="text"
              name="text"
              required
              // value={watermarkValue && watermarkValue.text}
              onChange={handleChange}
            />
          </FormGroup>
          <FormGroup>
            <Label>Image</Label>
            <Input className="rounded" type="file" required name="file" accept=".jpg,.jpeg,.png" onChange={uploadHandler} />
          </FormGroup>
        </CardBody>
        <CardFooter className="d-flex justify-content-end">
          <CustomCancel onClick={() => window.history.back()} />
          <CustomSubmit />
        </CardFooter>
      </Form>
    </Card>
  );
};

export default Watermark;

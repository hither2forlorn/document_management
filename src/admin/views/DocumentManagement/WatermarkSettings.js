import { SettingOutlined } from "@ant-design/icons";
import { Checkbox } from "antd";
import axios from "axios";
import React, { useState } from "react";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";

const WatermarkSettings = (props) => {
  console.log(props.saveSettings);
  console.log(props.defaultWatermarkSettings);
  const [modal, setModal] = useState(false);
  const toggle = () => setModal(!modal);

  return (
    <div>
      <div className="watermark-settings-section">
        <span className="watermarkSettings mb-2">
          <Button
            style={{
              backgroundColor: "transparent",
              marginBottom: "1px",
            }}
            onClick={props.toggle}
          >
            <SettingOutlined />
          </Button>
          <Modal
            isOpen={props.modal}
            toggle={props.toggle}
            size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            centered
          >
            <ModalHeader
              style={{
                padding: "15px 35px",
                backgroundColor: "#f1f1f1",
                fontSize: "20px",
                display: "block",
              }}
              toggle={props.toggle}
            >
              Please select your watermark configuration
            </ModalHeader>
            <ModalBody
              style={{
                backgroundColor: "#f1f1f1",
              }}
            >
              <div className="modal-form">
                <div className="modal-form-content">
                  <form onSubmit={props.formSubmit} className="watermark-form">
                    <label
                      for="watermarkText"
                      className="watermark-form-label"
                      style={{
                        fontSize: "14px",
                      }}
                    >
                      Watermark Text:
                    </label>
                    <input type="text" id="watermarkText" name="watermarkText" className="watermark-form-input" />
                    <br />
                    <label
                      for="watermarkPosition"
                      className="watermark-form-label"
                      style={{
                        fontSize: "14px",
                      }}
                    >
                      Watermark Position:
                    </label>
                    <select name="watermarkPosition" id="watermarkPosition" className="watermark-form-label">
                      <option value="" disabled selected>
                        Select your option
                      </option>
                      <option value="1">Center(default)</option>
                      <option value="2">Top Right</option>
                      <option value="3">Top Left</option>
                      <option value="4">Bottom Right</option>
                      <option value="5">Bottom Left</option>
                      <option value="6">Diagonal</option>
                    </select>
                    <label
                      for="watermarkImage"
                      className="watermark-form-label"
                      style={{
                        fontSize: "14px",
                      }}
                    >
                      Watermark Image:
                    </label>
                    <br />
                    <input type="file" id="watermarkImage" name="watermarkImage" className="watermark-form-image-input" />
                    <br />
                    <Checkbox
                      disabled={props.defaultWatermarkSettings}
                      onChange={props.onCheckboxChange}
                      checked={props.saveSettings}
                    >
                      Save this configuration for all documents.
                    </Checkbox>
                    <br />
                    <Checkbox
                      disabled={props.saveSettings}
                      onChange={props.onDefaultCheckboxChange}
                      checked={props.defaultWatermarkSettings}
                    >
                      Use default configuration.
                    </Checkbox>
                    <br />
                    <br />
                    <button
                      style={{
                        textAlign: "center",
                        display: "block",
                        margin: "0 auto",
                        width: "250px",
                      }}
                      type="submit"
                      className="watermark-form-submit-button"
                    >
                      Submit
                    </button>
                  </form>
                </div>
              </div>
            </ModalBody>
            <ModalFooter
              style={{
                backgroundColor: "#f1f1f1",
              }}
            >
              <Button color="secondary" onClick={props.toggle}>
                Cancel
              </Button>
            </ModalFooter>
          </Modal>
        </span>
      </div>
    </div>
  );
};

export default WatermarkSettings;

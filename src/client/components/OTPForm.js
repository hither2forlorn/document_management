import React, { useState } from "react";
import { Input, Button, FormGroup, Label, Row, Col } from "reactstrap";
import { EMAIL_OTP, PHONE_OTP } from "../../config/values";
import { receiveOtpCode, verifyOtpCode } from "./api/otp";
import { toast } from "react-toastify";
import { connect } from "react-redux";
import { setOtpAuth } from "../../redux/actions/authAction";

const OTPForm = (props) => {
  const [isOTP, setIsOTP] = useState(true);
  const [code, setCode] = useState();
  const [type, setType] = useState(EMAIL_OTP);

  const receiveOtp = (e) => {
    e.target.parentNode.removeChild(e.target);
    toast.info("Please, wait for a while to get OTP code");
    receiveOtpCode({ TYPE: type, data: {} }, (err, data) => {
      if (err) toast.error("Error!!");
      else {
        if (data.success) {
          toast.success(data.message);
          setIsOTP(true);
        } else {
          toast.warn(data.message);
        }
      }
    });
  };

  const verifyOtp = (e) => {
    e.preventDefault();
    verifyOtpCode({ TYPE: type, data: { code } }, (err, data) => {
      if (err) toast.error("Error!!");
      if (data) {
        if (data.success) {
          props.dispatch(setOtpAuth({ isVerified: true }));
        } else {
          toast.warn(data.message);
        }
      }
    });
  };

  return (
    // <Modal isOpen={!props.otpAuth.isVerified}>
    //   <ModalHeader>Client Verification Form</ModalHeader>
    <>
      <Row>
        <Col md={6}>
          <FormGroup>
            <Label>Choose verification method</Label>
            <div className="d-flex flex-row">
              <Input type="select" onChange={({ target: { value } }) => setType(value)} required>
                <option value={EMAIL_OTP}>By Email</option>
                <option value={PHONE_OTP}>By Phone</option>
              </Input>
              {type ? (
                <Button id="submit" type="button" color="primary" className="text-white" onClick={receiveOtp}>
                  Receive OTP
                </Button>
              ) : null}
            </div>
          </FormGroup>
        </Col>
      </Row>
      <Row>
        {isOTP ? (
          <Col md={6}>
            <FormGroup>
              <Label for="otp">OTP Code</Label>
              <Input
                type="number"
                name="otp"
                id="otp"
                placeholder="Please enter OTP you received"
                value={code || ""}
                onChange={({ target: { value } }) => setCode(value)}
                required
              />
            </FormGroup>
            <Button size="sm" type="button" color="success" onClick={verifyOtp}>
              Verify OTP
            </Button>
          </Col>
        ) : null}
      </Row>
    </>
  );
};

export default connect((state) => ({
  otpAuth: state.otpAuth,
}))(OTPForm);

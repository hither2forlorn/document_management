import React, { useState } from "react";
import { Modal, ModalHeader, Input, Button, ModalBody, FormGroup, Label } from "reactstrap";
import { EMAIL_OTP, PHONE_OTP } from "config/values";
import { receiveOtpCode, verifyOtpCode } from "./api/otp";
import { toast } from "react-toastify";
import { connect } from "react-redux";

const OTPForm = (props) => {
  const [isOTP, setIsOTP] = useState(true);
  const [code, setCode] = useState();
  const [type, setType] = useState(EMAIL_OTP);
  // const [phone, setPhone] = useState();
  // const [email, setEmail] = useState("");

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
          props.dispatch({ isVerified: true });
        } else {
          toast.warn(data.message);
        }
      }
    });
  };

  return (
    <Modal isOpen={!props.otpAuth.isVerified}>
      <ModalHeader>Client Verification Form</ModalHeader>
      <ModalBody>
        <FormGroup>
          <Label>Choose verification method</Label>
          <Input type="select" onChange={({ target: { value } }) => setType(value)} required>
            <option value={EMAIL_OTP}>By Email</option>
            <option value={PHONE_OTP}>By Phone</option>
          </Input>
        </FormGroup>
        {/* {type === PHONE_OTP ? (
            <>
              <FormGroup>
                <Label for="phoneNumber">Phone Number</Label>
                <Input
                  type="number"
                  autoComplete="phone"
                  placeholder="Please enter your Mobile Number"
                  required
                  value={phone || ""}
                  onChange={({ target: { value } }) => setPhone(value)}
                />
              </FormGroup>
            </>
          ) : (
            <>
              <FormGroup>
                <Label for="email">Email</Label>
                <Input
                  type="email"
                  autoComplete="email"
                  placeholder="Please enter your Email address"
                  value={email || ""}
                  required
                  onChange={({ target: { value } }) => setEmail(value)}
                />
              </FormGroup>
            </>
          )} */}
        {type ? (
          <div id="submit" className="d-flex align-items-end flex-column ">
            <Button type="button" color="primary" className="text-white" onClick={receiveOtp}>
              Receive OTP
            </Button>
          </div>
        ) : null}
        {isOTP ? (
          <>
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
              Submit
            </Button>
          </>
        ) : null}
      </ModalBody>
    </Modal>
  );
};

export default connect((state) => ({
  otpAuth: state.otpAuth,
}))(OTPForm);

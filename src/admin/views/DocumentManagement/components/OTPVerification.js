import { verifyOtpCode } from "client/components/api/otp";
import { EMAIL_OTP } from "config/values";
import React, { useState } from "react";
import { Modal, ModalHeader, Input, Button, ModalBody, FormGroup, Label, ModalFooter, Form } from "reactstrap";
import { toast } from "react-toastify";
import { connect } from "react-redux";
import metaRoutes from "config/meta_routes";
import { useHistory } from "react-router-dom";

const OTPVerification = (props) => {
  const [otpType, setOtpType] = useState(EMAIL_OTP);
  const [otpCode, setOtpCode] = useState();
  const [isOTP, setIsOTP] = useState(true);
  const [modalOpen, setModalOpen] = useState(true);

  const verifyOtp = (e) => {
    e.preventDefault();

    verifyOtpCode({ TYPE: otpType, data: otpCode }, (err, data) => {
      console.log("data", data);
      if (err) {
        console.log("data", err);

        toast.error("Error!!");
      } else if (data) {
        if (data.success) {
          toast.success(data.message);
          setModalOpen(false);
          props.handleVerifyOtp(true);
        } else {
          toast.warn(data.message);
        }
      }
    });
  };

  const history = useHistory();

  const goBack = () => {
    history.goBack();
  };

  return (
    <div>
      <Modal isOpen={modalOpen}>
        <ModalHeader>OTP Verification Form</ModalHeader>
        <Form>
          <ModalBody>
            {isOTP ? (
              <>
                <FormGroup>
                  <Label for="otp">OTP Code</Label>
                  <Input
                    name="otp"
                    id="otp"
                    placeholder="Please enter OTP you have received in your email"
                    value={otpCode || ""}
                    onChange={({ target: { value } }) => setOtpCode(value)}
                    required
                  />
                  <div className="alert alert-dark" role="alert">
                    NOTE - OTP will expire in 5 minutes
                  </div>
                </FormGroup>
              </>
            ) : null}
          </ModalBody>
          <ModalFooter>
            {isOTP ? (
              <Button type="submit" color="primary" onClick={verifyOtp}>
                Submit
              </Button>
            ) : null}
            <Button color="secondary" onClick={goBack}>
              Cancel
            </Button>
          </ModalFooter>
        </Form>
      </Modal>
    </div>
  );
};

const mapStateToProps = (state) => state.allFields;
export default connect(mapStateToProps)(OTPVerification);

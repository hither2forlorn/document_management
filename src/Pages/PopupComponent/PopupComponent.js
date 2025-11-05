import React, { useState, useEffect } from "react";
import moment from "moment";
import { Modal, ModalHeader, ModalBody, Button } from "reactstrap";

const PopupComponent = () => {
  const [licenseValid, setLicenseValid] = useState(false);
  const [expirationDate, setExpirationDate] = useState(null);
  const [remainingDays, setRemainingDays] = useState(null);
  const logoSmall = "/img/logo-small.png";

  useEffect(() => {
    const calculateRemainingDays = () => {
      const isLicenseValid = localStorage.getItem("isLicenseValid");
      const expirationDate = localStorage.getItem("licenseExpirationDate");

      setLicenseValid(isLicenseValid === "true");
      setExpirationDate(expirationDate);

      if (isLicenseValid === "true" && expirationDate) {
        const today = moment();
        const expiration = moment(expirationDate);
        const daysDiff = expiration.diff(today, "days");
        setRemainingDays(daysDiff);
      }
    };

    calculateRemainingDays();

    // Set up interval to run every 30 seconds
    const interval = setInterval(() => {
      calculateRemainingDays();
    }, 30000); // 30000 milliseconds = 30 seconds

    return () => clearInterval(interval);
  }, []);

  const handleClose = () => {
    setLicenseValid(false);
  };

  return (
    <Modal isOpen={licenseValid} className="custom-modal">
      <ModalHeader className="modal-header custom-modal-header">
        <img
          src={logoSmall}
          alt="Logo"
          className="logo-small"
          style={{
            width: "35x",
            height: "35px",
            marginRight: "8px",
          }}
        />
        Action Needed
      </ModalHeader>
      <ModalBody className="modal-body">
        <p>
          Your license is expiring after
          {remainingDays !== null && <span className="red-text"> {remainingDays} days.</span>}
          <span> Please renew the license immediately.</span>
        </p>
        <Button
          color="secondary"
          className="btn btn-primary"
          onClick={handleClose}
          style={{
            color: "#ffffff",
            float: "right",
          }}
        >
          Close
        </Button>
      </ModalBody>
    </Modal>
  );
};

export default PopupComponent;

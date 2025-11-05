import React from "react";
import NepaliDate from 'nepali-date-converter'
import { connect } from "react-redux";
import { Col, Row, Card, CardHeader, CardBody, Table } from "reactstrap";
import { getValue } from "config/util";
import { Link } from "react-router-dom";
import { Modal, Select, Button, Drawer, Input, Form } from "antd";
import { BOTH_EDIT_DELETE, VIEW, VIEW_EDIT, VIEW_EDIT_DELETE } from "config/values";
import A from "config/url";
import moment from "moment";
import metaRoutes from "config/meta_routes";
import { CustomApprove, CustomDelete } from "../../../components";
import { approveDocument, archiveDocument, resubmitDocument } from "../api";
import Province from "../../../../constants/Province";
import District from "../../../../constants/District";
import { getLocationData } from "admin/views/Util/GetLocationName";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CustomChip from "admin/components/CustomChip";
import { banks, onlyForThisVendor } from "config/bank";
import { getApprovers, sendToApprover, sendToChecker } from "../api/document";
import PrintFile from "admin/components/printFile";
import { deleteDocument } from "../api";
import ReactHTMLTableToExcel from "react-html-table-to-excel";
import { CloseIcon, EmailIcon } from "@chakra-ui/icons";
import { ActionIcon, Badge } from "@mantine/core";
import CustomTableAction from "admin/components/CustomTableAction";
const { Option } = Select;
import { useEffect, useState } from "react";
import { CodeSandboxCircleFilled } from "@ant-design/icons";
import { getUsers } from "admin/views/UsersLdap/api";
import RSelect from "react-select";
import { FormGroup, Label } from "reactstrap";
import Required from "admin/components/Required";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import QRCode from 'qrcode'; 



const indexDataTypes = {
  province: "province",
  date: "date",
  district: "district",
  dynamicCombox: "dynamicCombox",
  tags: "tags",
};

const DocumentInformation = (props) => {
  // Data row functional component
  const createdDateTime = new Date(props.documentData?.createdAt).toLocaleString();
  const approvedDateTime = new Date(props.documentData?.updatedAt).toLocaleString();
  const checkedDateTime = new Date(props.documentData?.checkedAt).toLocaleString();
  const rejectionDateOfApprover=new Date(props.documentData?.rejectionDateOfApprover).toLocaleString();
  const rejectionDateOfChecker=new Date(props.documentData?.rejectionDateOfChecker).toLocaleString();
 


  const DocumentRow = ({ label, value, type }) => {
    if (value) {
      switch (type) {
        case indexDataTypes.province:
          return (
            <tr>
              <td>{label}</td>
              <td>{getLocationData(props.allFields.provinces, value)?.name || value}</td>
            </tr>
          );

        case indexDataTypes.text:
          return (
            <tr>
              <td>{label}</td>
              <td>{value}</td>
            </tr>
          );

        case indexDataTypes.district:
          return (
            <tr>
              <td>{label}</td>
              <td>{getLocationData(props.allFields.districts, value)?.name || value}</td>
            </tr>
          );

        case indexDataTypes.dynamicCombox:
          return (
            <tr>
              <td>{label}</td>
              <td>{getLocationData(props.allFields.constants, value)?.name || value}</td>
            </tr>
          );
        case indexDataTypes.date:
          return (
            <tr>
              <td>{label}</td>
              <td>{moment(value).format("dddd, MMMM Do YYYY")}</td>
            </tr>
          )

        case indexDataTypes.tags:
          return (
            <tr>
              <td>{label}</td>
              <td>
                {typeof value === "object" &&
                  JSON.parse(value)?.map((item) => {
                    return <CustomChip label={item} variant="outlined" style={{ marginRight: 5 }} />;
                  })}
              </td>
            </tr>
          );

        default:
          return (
            <tr>
              <td>{label}</td>

              <td>{value}</td>
            </tr>
          );
      }
    } else {
      return null;
    }
  };

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isModalVisibleApproved, setIsModalVisibleApproved] = useState(false);
  const [selectedApproverId, setSelectedApproverId] = useState(null);
  const [approvers, setApprovers] = useState([]); // State to store approvers list
  const tags = props.tags;

  const approvedLog = props.json?.approvedLog || [];
  const documentData = props.documentData || {};
  const newDisposalDate = new Date(documentData?.disposalDate);

  // Define the valid date range for the NepaliDate library
  const minDate = new Date('2000-01-01'); // Minimum valid date
  const maxDate = new Date('2090-12-30'); // Maximum valid date

  if (newDisposalDate >= minDate && newDisposalDate <= maxDate) {
    const date1 = new NepaliDate(newDisposalDate);
    const bsDate = date1.getBS();
    bsDate.month = bsDate.month + 1; // Adjust for zero-based month index
    const { year, month, date } = bsDate;
    const formattedDate = `${year}-${month}-${date}`;
    documentData.disposalDate = new NepaliDate(formattedDate).format('ddd, MMMM DD YYYY');
  } else {
    console.error('The disposalDate is out of the valid Nepali date range.');
    // Handle the error gracefully, e.g., assign a default value or skip processing
    documentData.disposalDate = null; // Or some fallback value
  }

  const userIsMaker = props.userProfile.id == props.makerOrChecker?.initiatorId;
  const attachmentChecking = props.makerOrChecker.type == "attachment" && props.makerOrChecker.isActive;
  //  comment section client side logic is here
  const [message, setMessage] = useState('')
  const handleChange = (e) => {
    setMessage(e.target.value)
  }
  //  checker name
  const [checkerName, setCheckerName] = useState(props.userProfile.name)
  //approver name
  const [approverName, setApproverName] = useState(props.userProfile.name)


  const isPrimary = props.isPrimary;
  const p = props.permissions || {};
  const approveDocumentHandler = () => {
    const userInput = approverName;
    // if (!userInput) {
    //   return toast.error("Approver name is required!");
    // }
    const id = props.documentData.id;
    approveDocument(id, userInput, (err, json) => {
      if (json.success) {
        toast.success("Document has been approved");
        props.loadDocument();
      } else {
        toast.error(json.message);
      }
      setIsModalVisibleApproved(false);
    });
  };
  const { userProfile } = props;
  useEffect(() => {
    const fetchApproversData = () => {
      const { branchId, departmentId } = userProfile; // Fetch branchId and departmentId from userProfile

      const idToSend = departmentId || branchId; // Use departmentId if it exists, otherwise branchId

      getApprovers({ branchId: idToSend }, (err, data) => {
        if (err) {
          console.log("Error fetching approvers:", err);
          return;
        }

        if (data && data.success) {
          setApprovers(data.approvers);
        } else {
          console.error("Response did not contain success flag or approvers data");
        }
      });
    };

    fetchApproversData(); // Fetch approvers on component mount
  }, [userProfile]); // Only re-run the effect if userProfile changes
  // Only re-run the effect if userProfile changes

  const handleSendDocumentToChecker = () => {
    if (!window.confirm("Do you want to Sent this file to Checker?")) {
      return;
    }
    const id = props.documentData.id;
    sendToChecker(id, (err, json) => {
      if (json.success) {
        window.history.back();
        toast.success("Document has been send to Checker.");
        props.loadDocument();
      } else {
        toast.error(json.message);
      }
    });
  };
  const handleSendToApproverClick = () => setIsModalVisible(true);
  const handleOk = () => {
    if (!selectedApproverId) {
      toast.error("Please select an approver.");
      return;
    }

    // if (!checkerName) {
    //   toast.error("Please enter the checker's name.");
    //   return;
    // }
    const { id } = props.documentData;
    // const message = ''; // Optional message

    sendToApprover({ id, message, checkerName, approverId: selectedApproverId }, (err, json) => {
      if (json?.success) {
        toast.success("Document has been sent to the Approver.");
        props.loadDocument(); // Refresh document details if needed
      } else {
        toast.error(json?.message || "Failed to send document");
      }
      setIsModalVisible(false);
    });
  };
  const handleCancel = () => setIsModalVisible(false); // Close the modal without sending

  const handleApproverChange = (value) => setSelectedApproverId(value); // Set selected approver ID

  const userIsChecker = userProfile.id === props.makerOrChecker?.assignedTo;
  const userIsApprover = userProfile.id === props.makerOrChecker?.approverId;

  const resubmitDocumentHandler = () => {
    if (!window.confirm("Do you want to resubmit this file?")) {
      return;
    }

    const id = props.documentData.id;
    resubmitDocument(id, (err, json) => {
      if (json.success) {
        toast.success("Document has been resubmitted");
        window.history.back();
      } else {
        toast.error(json.message);
      }
    });
  };
  const docdeleteDocument = (id) => {
    if (!window.confirm("Do you want to delete this file?")) {
      return;
    }

    deleteDocument(id, (err, json) => {
      if (err) {
        return toast.error("Failed to delete");
      }

      if (json.success) {
        toast.success("Successfully deleted");
        window.history.back();
      } else {
        toast.error(json.message);
      }
    });
  };

  const handleSecurityLevel = (value) => {
    switch (value) {
      case 1:
        return "Low";

      case 2:
        return "Medium";

      case 3:
        return "High";

      case 4:
        return "User Group";
      default:
        return "NONE";
    }
  };

  const rejectDocument = () => {
    let rejectReason = prompt("reason to reject");
    if (!window.confirm("Do you want to reject this file?")) {
      return;
    }
    const rejectData = {
      id: props.documentData.id,
      rejectReason: rejectReason,
    };

    archiveDocument(rejectData, (err, json) => {
      if (json.success) {
        toast.success("The document has been rejected");
        window.history.go(-1);
      } else {
        toast.error(json.message);
      }
    });
  };

  const scrollContainerStyle = {
    height: "607px",
    overflowX: "hidden",
    overflowY: "scroll",
  };


  // const [adUsers, setAdUsers] = useState([]);

  // const getData = () => {
  //   getUsers((err, users) => {
  //     if (err) return;
  //     setAdUsers(users.map(user => ({ value: user.name }))); // Format for CustomSelect
  //   });
  // };

  // useEffect(() => {
  //   getData();
  // }, []);

  //Download Report

  const [hideButton, setHideButton] = useState(false)
  const downloadReport = (event) => {
 
    const doc = new jsPDF(); // doc sets the pdf layout
    const logoUrl = "/img/epf.png";
    const logoWidth = 30;
    const logoHeight = 40;
    const targetWidth = 20;         // Desired width
    const aspectRatio = logoWidth /  logoHeight;
    const newLogoWidth = targetWidth; 
    const newLogoHeight = targetWidth / aspectRatio; 
    doc.addImage(logoUrl, 'PNG', (doc.internal.pageSize.width - newLogoWidth) / 10, 9,newLogoWidth, newLogoHeight); // adds logo image to the pdf layout
    const logoUrl1 = "/img/reportImage.png"; // Replace with your second image path
    const logoWidth1 = 80;
    const logoHeight1 = 20;
    doc.addImage(logoUrl1, 'PNG', doc.internal.pageSize.width - logoWidth1 - 65, 10, logoWidth1, logoHeight1);
   
    const table = document.getElementById("toExcel"); // gets the html table to add in pdf
    if (table) {
      const marginTop = 45;
      const headingHeight = 10; 
      // doc.setFillColor('#135EBD');
      // doc.rect(10, marginTop - headingHeight, doc.internal.pageSize.width - 20, headingHeight, 'F');// sets background for the heading
      doc.setTextColor("#000000");
      doc.setFontSize(16);
      doc.text("Document Information Report", doc.internal.pageSize.width / 2, marginTop - 3, { align: "center" });// adds text to the pdf layout
      const tableMarginTop = marginTop + headingHeight ;
      doc.autoTable({
        margin: { top: tableMarginTop },
        html: table
      })    
      const bottomMargin = 10;
      const pageHeight = doc.internal.pageSize.height;
      const signatureSectionY = pageHeight - bottomMargin - 30;
      doc.setTextColor("#000");
      doc.setFontSize(10);
      const sectionWidth = 150;
      const startX = 10;
      const makerX = startX;
      const checkerX = startX + 60;
      const approverX = startX + 120;

      // Draw the labels (Maker, Checker, Approver)
      doc.text(`Maker: ${props.documentData.madeBy?props.documentData.madeBy:""}`, makerX, signatureSectionY);  // Label for Maker
      doc.text(`Checker: ${props.documentData.checkedBy?props.documentData.checkedBy:""}`, checkerX, signatureSectionY);  // Label for Checker
      doc.text(`Approver: ${props.documentData.verifyBy?props.documentData.verifyBy:""}`, approverX, signatureSectionY);  // Label for Approver


      const lineY = signatureSectionY + 5;

      const lineMarginTop = 10;
      const signatureLineY = lineY + lineMarginTop;

      const lineLength = 50;

      doc.line(makerX, signatureLineY, makerX + lineLength, signatureLineY);
      doc.line(checkerX, signatureLineY, checkerX + lineLength, signatureLineY);
      doc.line(approverX, signatureLineY, approverX + lineLength, signatureLineY);

     // Generate QR code as a data URL (no need for QRCode.react)
     const qrCodeValue = props.documentData.identifier; // Use the identifier or other data you want in the QR code
     QRCode.toDataURL(qrCodeValue, { width: 100, margin: 1 }, (err, qrCodeDataUrl) => {
       if (err) {
         console.error("QR Code Generation Error:", err);
         return;
       }
 
       // Position for the QR code on the PDF
       const qrCodeX = doc.internal.pageSize.width - 40;
       const qrCodeY = pageHeight - bottomMargin - 280
 
       // Add the QR code image to the PDF at the specified position
       doc.addImage(qrCodeDataUrl, 'PNG', qrCodeX, qrCodeY, 30, 30); // You can adjust size here
 
       // Save the PDF
       doc.save("documentinformation.pdf");
       // toast.success("Document Report Downloaded Successfully!")
     });
    };
  }

  
  return (
    // <div className="component-container">
    <>
      <Card className="shadow scrollbar-primary " style={scrollContainerStyle}>

        {/* for approver */}
        <Drawer
          title=" Select Approved"
          placement="right"
          onClose={() => setIsModalVisibleApproved(false)}
          visible={isModalVisibleApproved}
          style={{ zIndex: 1050 }}
        >

          {/* Approver Name */}

          <label>Approver Name</label>
          <Input
            defaultValue={props.userProfile.name}
            disabled
            className="text text-dark"
          />

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "1rem" }}>
            <Button onClick={() => setIsModalVisibleApproved(false)}>Close</Button>
            <Button type="primary" onClick={approveDocumentHandler}>Approve</Button>
          </div>
        </Drawer>


        {/* for checker */}
        <Drawer
          title="Select Approver"
          placement="right"
          onClose={handleCancel}
          visible={isModalVisible}
          style={{ zIndex: 1050 }}
        >
          <Select
            placeholder="Select an approver"
            style={{ width: "100%", marginBottom: "16px" }}
            onChange={handleApproverChange}
          >
            {approvers.map((approver) => (
              <Option key={approver.id} value={approver.id}>
                {approver.name} - {approver.designation}
              </Option>
            ))}
          </Select>
          {/* checker name */}

          <label>Checker Name</label>
          <Input
            defaultValue={props.userProfile.name}
            disabled
            className="text text-dark"
          />

          {/* comment section UI is here */}

          <label for="commentText" class="form-label"></label>
          <textarea onChange={handleChange} class="form-control mt-4" name="comment" id="commentText" rows="3" placeholder="Write your comment here..."></textarea>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "1rem" }}>
            <Button onClick={handleCancel}>Close</Button>
            <Button type="primary" onClick={handleOk}>Send To Approver</Button>
          </div>
        </Drawer>

        <ToastContainer />
        {/* HEADING START */}
        {/* <div className="row"> */}
        <CardHeader
        // className="d-flex justify-content-between"
        >
          <div className="d-flex justify-content-between align-items-center">
            <p className="h5 ">Document Information</p>

            <div className="d-flex pt-2">
              {isPrimary && userIsMaker && !props.documentData.isApproved && (
                <Button
                  className="d-block btn btn-outline-danger btn-sm border-danger bg-light border mr-2"
                  onClick={() => docdeleteDocument(props.documentData.id)}
                >
                  <i className="fa fa-trash mr-1" />
                </Button>
              )}

              <>
                {isPrimary &&
                  (p.document === VIEW_EDIT || p.document === VIEW_EDIT_DELETE) &&
                  !props.documentData.isApproved ? (
                  <div>
                    {/* dont allow to edit when document is archived */}
                    {props.documentData.isArchived == false && props.makerOrChecker.assignedTo != props.userProfile.id && (
                      <Link
                        className="btn btn-outline-dark btn-sm border-dark border mr-2 mt-1"
                        to={metaRoutes.documentsEdit + "?i=" + A.getHash(documentData.id)}
                      >
                        <i className="fa fa-pencil mr-1" />
                      </Link>
                    )}
                  </div>
                ) : null}
                {/* Only checker can view approve and cancel buttons */}
                {userIsChecker &&
                  !props.documentData.isArchived &&
                  !(props.documentData.returnedByChecker || props.documentData.sendToApprover) &&
                  (!props.documentData.isApproved || attachmentChecking) && (
                    <>
                      <CustomTableAction
                        permission={p.checker}
                        onClick={() => handleSendToApproverClick()}
                        buttonType="approve"
                      />
                      <CustomTableAction permission={p.checker} onClick={() => rejectDocument()} buttonType="cancel" />
                    </>
                  )}
                {/* Render approver action buttons if the user is the approver and document conditions are met */}
                {userIsApprover &&
                  !props.documentData.isArchived &&
                  props.documentData.sendToApprover &&
                  (!props.documentData.isApproved || attachmentChecking) && (
                    <>
                      <CustomTableAction
                        permission={p.approver}
                        onClick={() => setIsModalVisibleApproved(true)}
                        buttonType="approve"
                      />
                      <CustomTableAction
                        permission={p.approver}
                        onClick={() => rejectDocument()} // Handle reject action
                        buttonType="cancel"
                      />
                    </>
                  )}
              </>
            </div>
            {/* Initiator can view Resend the document. Resend document */}
            {isPrimary && userIsMaker && props.documentData.returnedByChecker && (
              // props.documentData.isArchived &&
              <div>
                <Button className="btn rounded btn-sm btn-primary text-light" onClick={() => resubmitDocumentHandler()}>
                  Resubmit
                </Button>
              </div>
            )}

          </div>
        </CardHeader>
        {/* HEADING END */}
        <CardBody>
          {/* <div className="component-content-container"> */}
          {documentData.identifier ? (
            <Row className="mb-1">
              <Col className="text-center">
                <PrintFile documentData={documentData} />
              </Col>
              {/* <BarCode value={documentData.identifier} /> */}
            </Row>
          ) : null}

          {props.documentData.returnedByChecker && (!props.documentData.sendToChecker || props.documentData.sendToChecker) && !props.documentData.isApproved && (
            <p className="bg-secondary p-2 rounded">
              <b>Document has been rejected by checker because of</b> {" - "}
              {props.documentData.rejectionMessageByChecker}
            </p>
          )}
          {/*  reject message by approver display on  checker */}

          { props.documentData.rejectionMessageByApprover && !(props.documentData.sendToApprover || props.documentData.sendToApprover) && !props.documentData.isApproved && (
            <p className="bg-secondary p-2 rounded">
              <b>Document has been rejected by approver because of</b> {" - "}
              {props.documentData.rejectionMessageByApprover}
            </p>
          )}






          <Table responsive bordered hover id="toExcel" >
            <tbody>
              <DocumentRow
                label="Document Type"
                value={getValue(props.allFields.documentTypes, documentData.documentTypeId)}
              />
              <DocumentRow label={"Identifier"} value={documentData.identifier} />
              <DocumentRow label={"Organization Name"} value={documentData.name} />
              {onlyForThisVendor([banks.rbb.name, banks.citizen.name]) && (
                <DocumentRow
                  label={"Feature"}
                  value={
                    <>
                      {!documentData.hasQuickQcr &&
                        !documentData.hasEncryption &&
                        !documentData.hasOtp &&
                        "No feature available"}
                      {documentData.hasQuickQcr && (
                        <CustomChip label="Quick OCR" variant="outlined" style={{ marginRight: 5 }} />
                      )}
                      {documentData.hasEncryption && (
                        <CustomChip label="Encrypted" variant="outlined" style={{ marginRight: 5 }} />
                      )}
                      {documentData.hasOtp && (
                        <CustomChip
                          label="OTP"
                          variant="outlined"
                          style={{
                            marginRight: 5,
                            marginTop: 5,
                          }}
                        />
                      )}
                    </>
                  }
                />
              )}
              <DocumentRow label={"Document Name"} value={documentData.otherTitle} />
              {/* makedBy checkedBy verifiedBy */}
              <DocumentRow label={"Created By"}
              //  value={<>{documentData?.madeBy}<br />{createdDateTime}</>} 
              value={
                
                <>
                {documentData?.madeBy} {","}
                <Badge
                radius="sm"
                variant="outline"
                size="lg"
                color="dark"
               >
                   
               {createdDateTime}

              </Badge>
              </>
              }
               />


                {documentData?.checkedBy && (
                   <DocumentRow label={"Checked By"} 
                  //  value={<>{documentData?.checkedBy}<br />{checkedDateTime}</>}
                  value={
                
                    <>
                    {documentData?.checkedBy} {","}
                    <Badge
                    radius="sm"
                    variant="outline"
                    size="lg"
                    color="dark"
                   >
                       
                    {checkedDateTime}
    
                  </Badge>
                  </>
                  }
                   />
                )}
             
              {documentData?.verifyBy && (
                 <DocumentRow label={"Approved By"} 
                //  value={<>{documentData?.verifyBy}<br/>{approvedDateTime}</>} 
                value={
                  <>
                  {documentData?.verifyBy} {","}
                  <Badge
                  radius="sm"
                  variant="outline"
                  size="lg"
                  color="dark"
                 >
                     
                  {approvedDateTime}
  
                </Badge>
                </>
                }
                 />
              )}
              

              {documentData?.description ? (
                <DocumentRow
                  label="Note"
                  type="text"
                  value={

                    <Badge
                      radius="sm"
                      variant="outline"
                      size="lg"
                      color="dark"
                      leftSection={

                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          style={{ width: "1rem", height: "1rem", marginBottom: "0.3rem" }}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M21.75 5.25v13.5a2.25 2.25 0 01-2.25 2.25H4.5a2.25 2.25 0 01-2.25-2.25V5.25M3.375 6.375l8.625 6.375m8.625-6.375l-8.625 6.375m8.625-6.375H3.375a2.25 2.25 0 00-2.25 2.25v9a2.25 2.25 0 002.25 2.25h17.25a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25z"
                          />
                        </svg>

                      }
                    >
                      {documentData?.description}

                    </Badge>
                  }
                />
              ) : null}


              {/* Combined Rejection Message */}
              {(documentData?.rejectionMessageByApprover) && (
                <DocumentRow
                  label="Rejection Message By Approval"
                  type="text"
                  value={
                    // <>
                    //   {documentData?.rejectionMessageByApprover} <br />
                    //   {rejectionDateOfApprover}

                    // </>
                    <>
                    {documentData?.rejectionMessageByApprover} {","}
                    <Badge
                    radius="sm"
                    variant="outline"
                    size="lg"
                    color="dark"
                   >
                       
                        {rejectionDateOfApprover}

                  </Badge>
                  </>
                  }
                />
              )}

              {documentData?.rejectionMessageByChecker && (
                <DocumentRow
                  label="Rejection Message By Checker"
                  type="text"
                  value={
                    // <>
                    //   {documentData?.rejectionMessageByChecker} <br />
                    //   {rejectionDateOfChecker}

                    // </>

                    <>
                    {documentData?.rejectionMessageByChecker} {","}
                    <Badge
                    radius="sm"
                    variant="outline"
                    size="lg"
                    color="dark"
                   >
                       
                        {rejectionDateOfChecker}

                  </Badge>
                  </>
                  }
                />
              )}


              {documentData?.commentByChecker ? (
                <DocumentRow

                  label="Comment By Checker"
                  type="text"
                  value={
                    <Badge
                      radius="sm"
                      variant="outline"
                      size="lg"
                      color="dark"
                      leftSection={
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          style={{ width: "1rem", height: "1rem", marginBottom: "0.3rem" }}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M21.75 5.25v13.5a2.25 2.25 0 01-2.25 2.25H4.5a2.25 2.25 0 01-2.25-2.25V5.25M3.375 6.375l8.625 6.375m8.625-6.375l-8.625 6.375m8.625-6.375H3.375a2.25 2.25 0 00-2.25 2.25v9a2.25 2.25 0 002.25 2.25h17.25a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25z"
                          />
                        </svg>
                      }
                    >
                      {documentData?.commentByChecker}

                    </Badge>
                  }
                />
              ) : null}


              {/* <DocumentRow label="Created By" value={getValue(props.allFields.users, documentData.ownerId)} /> */}
              <DocumentRow label="Language" value={getValue(props.languages, documentData.languageId)} />
              <DocumentRow
                label="Document Condition"
                value={getValue(props.documentConditions, documentData.documentConditionId)}
              />
              {documentData.securityLevel === null ? (
                <>
                  <DocumentRow label={"Security Hierarchy"} value={documentData.hierarchy} />
                  <DocumentRow label={"Security Level"} value={handleSecurityLevel(documentData.securityLevel)} />
                </>
              ) : documentData.securityLevel ? (
                <>
                  {/* <DocumentRow label={"Security Hierarchy"} value={"None"} /> */}
                  <DocumentRow label={"Security Level"} value={handleSecurityLevel(documentData.securityLevel)} />
                </>
              ) : documentData.hierarchy ? (
                <>
                  <DocumentRow label={"Security Level"} value={"NONE"} />
                  <DocumentRow label={"Security Hierarchy"} value={documentData.hierarchy} />
                </>
              ) : (
                <>
                  <DocumentRow label={"Security Level"} value={"NONE"} />
                  <DocumentRow label={"Security Hierarchy"} value={"NONE"} />
                </>
              )}

              <>
                <DocumentRow
                  label={"Approval"}
                  value={
                    <>
                      {!documentData.isApproved && (
                        <span className="pr-2 pt-2 pb-2 border rounded">
                          <i className="fa fa-close mr-1 p-2 text-danger" />
                          Not Approved
                        </span>
                      )}
                      {documentData.isApproved && (
                        <span className="pr-2 pt-2 pb-2 border rounded">
                          <i className="fa fa-check mr-1 p-2 text-success" /> Approved

                        </span>
                      )}
                    </>
                  }
                />

                <DocumentRow
                  label={"Archived"}
                  value={
                    <>
                      {!documentData.isArchived && (
                        <span className="pr-2 pt-2 pb-2 border rounded">
                          <i className="fa fa-archive mr-1 p-2 text-danger" />
                          Not Archived
                        </span>
                      )}
                      {documentData.isArchived && (
                        <span className="pr-2 pt-2 pb-2 border rounded">
                          <i className="fa fa-archive mr-1 p-2 text-primary" /> Archived
                        </span>
                      )}
                    </>
                  }
                />
              </>

              <DocumentRow label="Department" value={getValue(props.allFields.departments, documentData.departmentId)} />
              <DocumentRow label="Branch" value={getValue(props.allFields.branches, documentData.branchId)} />
              <DocumentRow label="Status" value={getValue(props.allFields.statuses, documentData.statusId)} />
              <DocumentRow label="Location Map" value={getValue(props.allFields.locationMaps, documentData.locationMapId)} />
              <DocumentRow label="Expiry Date" value={documentData.disposalDate} />
              <DocumentRow label="Created At" value={createdDateTime} />
              {props.documentData.isApproved &&(<DocumentRow label="Approved At" value={approvedDateTime} />)}

              {/* {approvedLog.map((row) => (
                <DocumentRow label="Approved by" value={row.type + " - " + row.email} />
              ))} */}

              <DocumentRow
                label="Tags"
                value={
                  tags.length > 0 ? (
                    <>
                      {tags.map((row) => (
                        <CustomChip
                          label={row}
                          variant="filled"
                          className="mr-1
                          "
                        />
                      ))}
                    </>
                  ) : (
                    <CustomChip label="No Tags Found" variant="filled" />
                  )
                }
              />
              {documentData &&
                documentData.document_indices &&
                documentData.document_indices.map((item, index) => {
                  return (
                    <DocumentRow
                      key={index}
                      label={item.label}
                      type={item.dataType}
                      value={item.document_index_value ? item.document_index_value.value : null}
                    />
                  );
                })}
            </tbody>
          </Table>

          {/* <div style={{ position: "absolute", width: "0px", height: "0px", overflow: "hidden" }}>
            <ReactHTMLTableToExcel
              id="to-Excel-button"
              className="btn btn-sm btn-primary text-white float-right hidden-excel-button"
              table="toExcel"
              filename="documentinformation"
              sheet="tablexls"
              buttonText="Download Report"

            />
          </div> */}

          {/* <select class="form-select btn btn-sm btn-primary text-white float-right" aria-label="Default select example"
            value="Download Report" onChange={downloadReport} >
            <option selected hidden>Download Report</option>
            <option value="1">XLS</option>
            <option value="2">PDF</option>

          </select> */}
          <button onClick={downloadReport} class="form-select btn btn-sm btn-primary text-white float-right">Download Report</button>
        </CardBody>
        {/* </div> */}
      </Card>
    </>
  );
};

export default connect((state) => ({
  allFields: state.allFields,
  userProfile: state.userProfile,
}))(DocumentInformation);

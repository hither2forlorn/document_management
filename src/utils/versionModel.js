import React, { useState, useEffect } from "react";
import { Modal, Select, Button, Spin } from "antd";
import { previewAttachment } from "../admin/views/DocumentManagement/api/index";
import { SERVER_URL } from "admin/config/server";

const { Option } = Select;

// Helper function to extract and decode the file name from the file path
const extractFileName = (filePath) => {
  const decodedPath = decodeURIComponent(filePath); // Decode the URL
  const match = decodedPath.match(/\/([^\/]+)$/); // Extract file name after the last '/'
  return match ? match[1] : null;
};

const VersionModel = ({ open, onClose, data }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePath, setFilePath] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Set the first file by default when data changes
  useEffect(() => {
    if (data && data.length > 0) {
      const firstFile = data[0];
      setSelectedFile(firstFile);
      previewFileHandler(firstFile.id, 1); // Automatically fetch the first file with cw=1
    }
  }, [data]);

  // Handle file selection
  const handleFileChange = (value) => {
    const file = data.find((item) => item.id === value);
    setSelectedFile(file);
    if (file) {
      previewFileHandler(file.id, 1);
    }
  };

  // Fetch file details
  const previewFileHandler = (id, cw) => {
    setIsLoading(true);

    previewAttachment(id, cw, (err, json) => {
      setIsLoading(false);
      if (err) {
        console.error("Error fetching file:", err);
        return;
      }
      if (json.success) {
        const filePath = `${SERVER_URL}${json.filePath}`;
        setFilePath(filePath);
      } else {
        window.alert(json.message);
      }
    });
  };

  // Function to handle file download
  const handleFileDownload = async (url) => {
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/octet-stream", // Ensure correct content type
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch file");
      }

      const blob = await response.blob();
      const urlObject = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = urlObject;
      link.download = extractFileName(url); // Extract filename or specify a name
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(urlObject); // Clean up URL object
    } catch (error) {
      console.error("Error downloading file:", error);
      alert("Failed to download file. Please try again.");
    }
  };

  return (
    <Modal
      title="File Viewer"
      visible={open}
      onCancel={onClose}
      footer={
        <Button onClick={onClose} type="primary">
          Close
        </Button>
      }
      width={800}
      zIndex={1050} // Ensures the modal is above other UI elements
      bodyStyle={{
        padding: "20px", // Adds padding inside the modal
        backgroundColor: "#f7f7f7", // Optional: adds a subtle background color
      }}
      style={{
        top: "60px", // Pushes modal slightly down for better visibility
      }}
    >
      {isLoading && (
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <Spin size="large" />
        </div>
      )}
      {/* File Selector */}
      <Select
        style={{ width: "100%", marginBottom: "20px" }}
        value={selectedFile?.id}
        onChange={handleFileChange}
      >
        {data?.map((file) => (
          <Option key={file?.id} value={file?.id}>
            {extractFileName(file.filePath)}
          </Option>
        ))}
      </Select>

      {/* File Viewer with Two Buttons */}
      {filePath && (
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <p>
            <strong>File Name:</strong> {extractFileName(filePath)}
          </p>
          <div>
            <Button
              style={{ marginRight: "10px", backgroundColor: "#4CAF50", color: "white" }}
            >
              <a href={filePath} target="_blank" rel="noopener noreferrer">
                View File
              </a>
            </Button>
            <Button
              style={{ backgroundColor: "#2196F3", color: "white" }}
              onClick={() => handleFileDownload(filePath)}
            >
              Download File
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default VersionModel;

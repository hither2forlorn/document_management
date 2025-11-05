function isPDFFile(filePath) {
  // Extract the file extension from the file path
  const fileExtension = filePath.split(".").pop().toLowerCase();

  // Check if the file extension is 'pdf'
  if (fileExtension === "pdf") {
    return false;
  } else {
    return true;
  }
}

module.exports = isPDFFile;

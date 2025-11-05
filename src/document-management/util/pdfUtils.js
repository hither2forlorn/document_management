const fs = require("fs");
const PDFParser = require("pdf-parse");
const { Attachment } = require("../../config/database");

/**
 * Checks if any of the PDF files in the given array are blank.
 *
 * @param {Array} files - An array of file objects representing PDF files to check.
 *                        Each file object should have a `path` property containing the file path.
 *
 * @returns {boolean} - True if any of the PDF files are blank, false otherwise.
 */
async function areAnyPdfFilesBlank(files) {
  // Iterate through each file in the array
  for (const file of files) {
    // Check if the current PDF file is blank
    const isBlank = await isPdfBlank(file.path);

    // If the current PDF file is blank, return true and exit the function
    if (isBlank) {
      return true;
    }
  }

  // If none of the PDF files are blank, return false
  return false;
}

/**
 * Check if a PDF is blank
 * @param {string} filePath - Path to the PDF file
 * @returns {Promise<boolean>} - True if the PDF is blank, false otherwise
 */
async function isPdfBlank(filePath) {
  try {
    const pdfBuffer = fs.readFileSync(filePath);

    // Redirect console output to a stream that discards the data
    const dummyStream = new (require("stream").Writable)();
    const consoleOutput = console._stdout;
    console._stdout = dummyStream;

    const pdfData = await PDFParser(pdfBuffer);

    // Restore console output
    console._stdout = consoleOutput;

    const { text, metadata } = pdfData;

    // Check if the PDF has no visible text
    if (!/\S/.test(text)) {
      return true;
    }

    // Check if the PDF has no visible content based on metadata
    if (metadata && metadata.hasContent === false) {
      return true;
    }

    return false;
  } catch (error) {
    if (error.message.includes("TT: undefined function: 32")) {
      // Handle the warning silently by returning false
      return false;
    } else {
      throw error;
    }
  }
}

/**
 * Checks if any of the attachments have duplicate MD5 hashes in the database.
 * @param {Array} attachments - An array of attachment objects to check.
 *                             Each attachment object should have an `md5Hash` property.
 *
 * @returns {Promise<Attachment|null>} - The first attachment with a duplicate MD5 hash, or null if no duplicates are found.
 *                                       If a duplicate is found, the returned attachment will be the one that already exists in the database.
 *                                       If no duplicate is found, null will be returned.
 */

async function checkAttachmentsForDuplicates(attachments, doc) {
  for (const attachment of attachments) {
    const md5Hash = attachment.md5Hash;
    const existingAttachment = await Attachment.findOne({ where: { md5Hash, isDeleted: 0, itemId: doc.id } });

    if (existingAttachment) {
      // MD5 hash exists in the database
      return existingAttachment;
    }
  }

  return null; // No duplicate MD5 hashes found
}

module.exports = { isPdfBlank, areAnyPdfFilesBlank, checkAttachmentsForDuplicates };

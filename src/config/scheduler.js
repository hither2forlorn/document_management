/**
 * @module Scheduler
 */

const schedule = require("node-schedule");
const fs = require("fs");
const { emptyTemp } = require("./filesystem");
const { Attachment, Document, DocumentAudit, Watermark, User } = require("./database");
const { compressAttachment, downloadAttachmentFromFtp } = require("../document-management/util/attachment");
const { Op } = require("sequelize");
const logger = require("../config/logger");
const axios = require("axios");
const { checkFtp, ftp } = require("../config/filesystem");
const dotenv = require("dotenv");
const { pdfOptions, ocrOptions } = require("../util/FileTypes");
const { tasks, handlePyhonExecution } = require("../document-management/util/pythonExecution");
const { pyFTPocrFile } = require("../document-management/util/pythonGlobalFunctions");
const { execSelectQuery, execStoredProcNew } = require("../util/queryFunction");
const path = require("path");

dotenv.config();

// const jobFileDeleteScheduler = schedule.scheduleJob("0 1 * * *", (fireDate) => {
//   console.log("FILE DELETE scheduler is running properly! at : " + fireDate.toTimeString());
//   emptyTemp("temp/");
// });

// const accountStatusUpdater = schedule.scheduleJob("0 4 * * *", (fireDate) => {
//   console.log("ACCOUNT STATUS UPDATER scheduler is running properly! at : " + fireDate.toTimeString());
//   activetoDormantUpdater();
// });
// const dormantAccountStatusUpdater = schedule.scheduleJob("0 4 * * *", (fireDate) => {
//   console.log("ACCOUNT STATUS UPDATER scheduler is running properly! at : " + fireDate.toTimeString());
//   dormantToActiveUpdater();
// });

// /**
//  * A scheduler to delete the temporary files on the application at a certain interval
//  * SEC(0-59) MIN(0-59) HOUR(0-23) DAY(1-31) MONTH(1-12) DAY-OF-WEEK(0-6)
//  *
//  * @method
//  * @param {String}      fireInterval     Example '0 * * * *': Deletes file every hour at 00 minute.
//  * @param {Function}    callback
//  */
// const jobArchiveExpiredDocuments = schedule.scheduleJob("0 * * * *", async (fireDate) => {
//   await checkExpired();
//   console.log("ARCHIVED DOC SCHEDULER is running properly! at : " + fireDate.toTimeString());
// });

/**
 * A scheduler to delete the temporary files on the application at a certain interval
 * SEC(0-59) MIN(0-59) HOUR(0-23) DAY(1-31) MONTH(1-12) DAY-OF-WEEK(0-6)
 *
 * @method
 * @param {String}      fireInterval     Example '0 * * * *': Deletes file every hour at 00 minute.
 * @param {Function}    callback
 */
// const jobExpiredUserPassword = schedule.scheduleJob("0 * * * *", async (fireDate) => {
//   await checkExpiredPassword();
//   console.log("USER EXPIRED JOB SCHEDULER is running properly! at : " + fireDate.toTimeString());
// });

/**
 *
 * A scheduler to check the archived documents and compress the attachments in the archived documents
 *
 * @method
 * @param {String}      fireInterval     Example '1 * *': Checks the documents every day once
 * @param {Function}    callback
 */
// const jobCompressArchivedDocuments = schedule.scheduleJob("1 * *", (fireDate) => {
//   console.log("COMPRESS ATTACHMENT SCHEDULER is running properly! at : " + fireDate.toTimeString());
//   if (process.env.NODE_ENV === "production") {
//     checkCompressDocument();
//   }
// });

/**
 * Checks the expired documents to update the isArchived flag to true
 * @method
 */
async function checkExpired() {
  const documents = await Document.findAll({
    where: { disposalDate: { $lt: Date.now() }, isArchived: false },
  });
  Promise.all(
    documents.map(async (document) => {
      return await Document.update({ isArchived: true }, { where: { id: document.id } });
    })
  );
}

// expiryPassword = (json) => {
//   const pastDate = json.createdAt;
//   const newDate = new Date();
//   var difference =
//     newDate.getFullYear() * 12 +
//     newDate.getMonth() -
//     (pastDate.getFullYear() * 12 + pastDate.getMonth());
//   if (difference === 1) {
//     return this.setState({ expiryPassword: true });
//   }
// };

/**
 * Checks the expired password ro update the isExpirePassword to true
 */
async function checkExpiredPassword() {
  const newDate = new Date();
  const monthsBack = newDate.setMonth(newDate.getMonth() - 3);
  const users = await User.findAll({
    where: {
      updatedAt: {
        [Op.lte]: monthsBack,
        // [Op.gte]: moment().subtract(3, "months").toDate(),
      },
    },
  });
  // user expirred
  Promise.all(
    users.map(async (user) => {
      return await User.update({ isExpirePassword: true }, { where: { id: user.id } });
    })
  );
}

/**
 * Checks the archived documents to compress the attachments
 * @method
 */
// async function checkCompressDocument() {
//   Attachment.belongsTo(Document, { foreignKey: "itemId", sourceKey: "id" });
//   Document.hasMany(DocumentAudit);
//   Attachment.findAll({
//     where: { isDeleted: false, isCompressed: false },
//     include: [
//       {
//         model: Document,
//         attributes: ["id"],
//         where: { isArchived: true },
//         required: true,
//         include: [
//           {
//             model: DocumentAudit,
//             attributes: ["id"],
//             where: { createdAt: { [Op.gte]: Date.now() - 604800000 } },
//             required: false,
//           },
//         ],
//       },
//     ],
//   })
//     .then((attachments) => {
//       const attachmentsToCompress = attachments.filter((a) => (a.document.document_audits.length === 0 ? 1 : 0));
//       Promise.all(
//         attachmentsToCompress.map((attachment) => {
//           return compressAttachment(attachment.filePath)
//             .then((att) => {
//               return Attachment.update(
//                 {
//                   isCompressed: true,
//                   ...att,
//                 },
//                 {
//                   where: { id: attachment.id },
//                 }
//               );
//             })
//             .catch((err) => {
//               logger.error(err);
//             });
//         })
//       );
//     })
//     .catch((err) => {
//       logger.error(err);
//     });
// }
// /**
//  * schedular job run at midnight.
//  */
// const ocrJob = schedule.scheduleJob("0 0 * * * *", async (fireDate) => {
//   // const ocrJob = schedule.scheduleJob("2 * * * * *", async (fireDate) => {
//   console.log("OCR JOB IS RUNNING PROPERLY! at : " + fireDate.toTimeString());
//   // await findAttachment();
//   // });
// });

const findAttachment = async () => {
  const data = await Attachment.findAll({
    where: {
      // itemId: 2,
      ocr: false,
    },
    limit: 100,
    raw: true,
  });

  Promise.all(
    data.map(async (attach, index) => {
      try {
        const content = await pyFTPocrFile(attach);
        await Attachment.update({ attachmentDescription: content || "", ocr: true }, { where: { id: attach.id } });
        console.log("content=", content);
      } catch (error) {
        console.log("Error: ", error);
      }
    })
  );
};

const activetoDormantUpdater = async () => {
  const today = new Date();

  const formattedDate = formatDate(today);

  const data = await execStoredProcNew("UpdateActiveToDormantAccountStatus", {
    fromDate: formattedDate,
    toDate: formattedDate,
  });

  let logContent;

  if (data.length === 0) {
    logContent = "no accounts to update active to dormant";
  } else {
    const logEntries = data.map((account) => `${account.ACCOUNT_NO} - active to dormant - changed on ${formattedDate}`);
    logContent = logEntries.join("\n");
  }

  fs.writeFile("account_status_log.txt", logContent, (err) => {
    if (err) {
      console.error("Error writing to file", err);
    } else {
      console.log("Log file has been created successfully.");
    }
  });
};

const dormantToActiveUpdater = async () => {
  const today = new Date();

  const formattedDate = formatDate(today);

  const data = await execStoredProcNew("UpdateDormantToActiveAccountStatus", {
    fromDate: formattedDate,
    toDate: formattedDate,
  });

  let logContent;

  if (data.length === 0) {
    logContent = "no accounts to update dormant to active";
  } else {
    const logEntries = data.map((account) => `${account.ACCOUNT_NO} - dormant to active - changed on ${formattedDate}`);
    logContent = logEntries.join("\n");
  }

  fs.writeFile("account_status_log.txt", logContent, (err) => {
    if (err) {
      console.error("Error writing to file", err);
    } else {
      console.log("Log file has been created successfully.");
    }
  });
};

const formatDate = (date) => {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

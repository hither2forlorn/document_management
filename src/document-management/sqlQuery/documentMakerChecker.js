const { execSelectQuery } = require("../../util/queryFunction");

async function queryPendingApprovalAttachments(id) {
  return await execSelectQuery(
    `select * from
        attachments a
        join documents d on d.id = a.itemId
        where a.isDeleted=0 and a.pendingApproval = 1 and a.itemId =${id}`
  );
}

// query to find pending attachments flow
async function queryAttachmentMakerChecker(id) {
  const query = `SELECT * from approval_masters am WHERE type = 'attachment' and isActive=1 and documentId = ${id}`;
  return await execSelectQuery(query);
}

module.exports = { queryAttachmentMakerChecker, queryPendingApprovalAttachments };

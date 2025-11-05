/**
 * Find the list of memos assignedTo the user logged in to the system
 * @method module:Memo#reportAll
 * @param {Object} options
 * @param {Number} options.assignedTo User ID
 */
module.exports.reportAll = ({ assignedTo }) => {
  return `
        SELECT 
            form.name AS name,
            form.tag AS tag,
            workflow_master.currentStatus AS currentStatus,
            COUNT(memo.id) as count
        FROM memos AS memo
        INNER JOIN
            forms AS form
            ON memo.formId = form.id
        INNER JOIN 
            workflow_masters AS workflow_master 
            ON memo.workflowMasterId = workflow_master.id 
            AND workflow_master.isActive = 1
            AND workflow_master.isCompleted = 0
            AND workflow_master.assignedTo = ${assignedTo}
            AND workflow_master.currentStatus = 'Pending'
        WHERE
            memo.isDeleted = 0 AND form.isDeleted = 0 AND form.isActive = 1
            GROUP BY tag, name
    `;
};

/**
 * List the memo requests grouping by status
 * @method module:Memo#reportByStatus
 */
module.exports.reportByStatus = () => {
  return `
        SELECT 
            form.name AS name,  
            workflow_master.currentStatus AS currentStatus,
            COUNT(memo.id) as count
        FROM memos AS memo
        INNER JOIN
            forms AS form
            ON memo.formId = form.id
        INNER JOIN 
            workflow_masters AS workflow_master 
            ON memo.workflowMasterId = workflow_master.id
        WHERE
            memo.isDeleted = 0 AND form.isDeleted = 0 AND form.isActive = 1
        GROUP BY currentStatus,name
    `;
};

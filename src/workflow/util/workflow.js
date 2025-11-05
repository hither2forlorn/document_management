/**
 * @module MyWorkflow
 */
const { Workflow, WorkflowMaster, WorkflowLog, WorkflowUser, User } = require("../../config/database");
const moment = require("moment");
const { sendApproveEmail, sendInitiateEmail } = require("../../memo-mangement/util/send_email");

const Values = {
  PENDING: "Pending",
  APPROVED: "Approved",
};

/** Class to create the workflow instance and perform different actions */
class MyWorkflow {
  _req = {};
  workflowMaster;
  comment;
  /**
   * @constructor
   * @param {Object} req - Request object from express routes
   */
  constructor(req) {
    this._req = req;
  }

  /**
   * @static
   * @param {Object} workflow - Workflow object to create a workflow
   * @param {String} workflow.name - Name of the workflow
   * @returns {Object} Workflow object {id, name, ...}
   */
  static create = async (workflow) => {
    return Workflow.create(workflow);
  };

  /**
   * @method module:MyWorkflow#initiate
   * @async
   * @static
   * @param {Integer} initiatorId - User id of the user initiating the workflow
   * @param {Integer} workflowId - Workflow id of the workflow to be initiated
   * @returns {Object} Workflow master object to track the workflow {id, workflowId, ...}
   */
  static initiate = async (initiatorId, workflowId) => {
    if (!initiatorId || !workflowId) {
      throw new Error("Initiator or workflow has not been specified!");
    }
    const currentDate = moment();
    const wUsers = await WorkflowUser.findAll({
      where: { workflowId, isActive: true },
      order: [["level", "ASC"]],
    });
    const [firstWorkflowUser, lastWorkflowUser] = [wUsers[0], wUsers[wUsers.length - 1]];
    const workflowMaster = {
      requestId: "GDMS" + currentDate.format("-YYYY-MM-DD-x"),
      initiatorId: initiatorId,
      currentStatus: Values.PENDING,
      workflowId: workflowId,
      // currentLevel: 0,
      currentLevel: firstWorkflowUser.level,
      maxLevel: lastWorkflowUser.level,
      // assignedTo: initiatorId,
      assignedTo: firstWorkflowUser.userId,
      assignedOn: currentDate.format(),
    };
    const master = await WorkflowMaster.create(workflowMaster);
    const workflowLog = {
      workflowMasterId: master.id,
      action: "Initiate",
      comment: "Initial Submit",
      userId: initiatorId,
    };
    await User.findOne({ where: { id: initiatorId } }).then((initiatorDetail) => {
      const email = initiatorDetail.email;
      const requestId = workflowMaster.requestId;
      sendInitiateEmail({ email: email, requestId });
    });
    await WorkflowLog.create(workflowLog);
    return master;
  };

  /**
   * @method module:MyWorkflow#submit
   * @alias submit
   * Submits the workflow from current level to the higher level
   */
  submit = async () => {
    const req = this._req;
    const { comment, workflowMasterId } = req.body;
    const master = await WorkflowMaster.findOne({
      where: { id: workflowMasterId },
    });
    const nextUser = await WorkflowUser.findOne({
      where: {
        workflowId: master.workflowId,
        isActive: true,
        level: master.currentLevel + 1,
      },
    });
    const workflowMaster = {
      currentStatus: "Pending",
      currentLevel: nextUser.level,
      assignedTo: nextUser.userId,
      assignedOn: moment().format(),
    };
    const workflowLog = {
      workflowMasterId: master.id,
      action: "Submit",
      comment,
      userId: req.payload.id,
      assignedOn: master.assignedOn,
    };
    return Promise.all([
      WorkflowMaster.update(workflowMaster, { where: { id: master.id } }),
      WorkflowLog.create(workflowLog),
    ]).then((_) => {
      return "Success";
    });
  };

  /**
   * @method module:MyWorkflow#return
   * @async
   * Returns the workflow from current level to the lower level
   */
  return = async () => {
    const req = this._req;
    const { comment, workflowMasterId, userId } = req.body;
    const master = await WorkflowMaster.findOne({
      where: { id: workflowMasterId },
    });
    const nextUser = (await WorkflowUser.findOne({
      where: {
        userId,
        workflowId: master.workflowId,
        isActive: true,
      },
    })) || { userId: userId, level: 0 };
    const workflowMaster = {
      currentStatus: "Pending",
      currentLevel: nextUser.level,
      assignedTo: nextUser.userId,
      assignedOn: moment().format(),
    };
    const workflowLog = {
      workflowMasterId: master.id,
      action: "Return",
      comment,
      userId: req.payload.id,
      assignedOn: master.assignedOn,
    };
    return Promise.all([
      WorkflowMaster.update(workflowMaster, { where: { id: master.id } }),
      WorkflowLog.create(workflowLog),
    ]).then((_) => {
      return "Success";
    });
  };

  /**
   * @method module:MyWorkflow#skip
   * @async
   * Skips the user in the workflow from current level to one step higher level
   */
  skip = async () => {
    const req = this._req;
    const { comment, workflowMasterId } = req.body;
    const master = await WorkflowMaster.findOne({
      where: { id: workflowMasterId },
    });
    const nextUser = await WorkflowUser.findOne({
      where: {
        workflowId: master.workflowId,
        isActive: true,
        level: master.currentLevel + 1,
      },
    });
    const workflowMaster = {
      currentStatus: "Pending",
      currentLevel: nextUser.level,
      assignedTo: nextUser.userId,
      assignedOn: moment().format(),
    };
    const workflowLog = {
      workflowMasterId: master.id,
      action: "Skip",
      comment,
      userId: req.payload.id,
      assignedOn: master.assignedOn,
    };
    return Promise.all([
      WorkflowMaster.update(workflowMaster, { where: { id: master.id } }),
      WorkflowLog.create(workflowLog),
    ]).then((_) => {
      return "Success";
    });
  };

  /**
   * @method module:MyWorkflow#complete
   * @async
   * Completes the workflow i.e. approves the workflow and no further action can be taken from this point
   */
  complete = async () => {
    const req = this._req;
    const { comment, workflowMasterId } = req.body;
    const master = await WorkflowMaster.findOne({
      where: { id: workflowMasterId },
    });
    const workflowMaster = {
      currentStatus: "Approved",
      isActive: false,
      currentLevel: -1,
      assignedTo: null,
      assignedOn: null,
    };
    const workflowLog = {
      workflowMasterId: master.id,
      action: "Approved",
      comment,
      userId: req.payload.id,
      assignedOn: master.assignedOn,
    };
    const userDetail = await User.findOne({
      where: { id: master.initiatorId },
    });
    const userEmail = userDetail.email;
    const requestId = master.requestId;
    return Promise.all([
      WorkflowMaster.update(workflowMaster, { where: { id: master.id } }),
      WorkflowLog.create(workflowLog),
    ]).then((_) => {
      sendApproveEmail({ email: userEmail, requestId });
      return "Success";
    });
  };

  /**
   * @method module:MyWorkflow#comment
   * @async
   * Comment text in the workflow only if you are part of the workflow.
   * Works like a chat within the workflow to know when you don't want to pass the workflow,
   * and you only want to comment to know some point in the workflow.
   */
  comment = async () => {
    const req = this._req;
    const { comment, workflowMasterId } = req.body;
    const workflowLog = {
      workflowMasterId: workflowMasterId,
      action: "Comment",
      comment,
      userId: req.payload.id,
    };
    return Promise.all([WorkflowLog.create(workflowLog)]).then((_) => {
      return "Success";
    });
  };
}

module.exports = MyWorkflow;

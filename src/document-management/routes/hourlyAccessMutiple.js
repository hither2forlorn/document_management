const router = require("express").Router();
const auth = require("../../config/auth");
const { getId } = require("../util/url");
const { HourlyAccessMultiple, Attachment, User, HourlyAccess, DocumentAccessUser } = require("../../config/database");
const { consoleLog } = require("../../util");
const { hourlyAccessUserNotifylTemplate } = require("../../util/email_template");
const { sendMessage } = require("../../util/send_email");
const { getDocument } = require("../util/getModelDetail");
const { execSelectQuery } = require("../../util/queryFunction");

// Get Hourly Access Multiple by Hourly Access Id
router.get("/document/hourly-access-multiple/:id", auth.required, async (req, res, next) => {
  const hourly_access_id = req.params.id;
  const decoded_id = getId(hourly_access_id);

  const hourlyAccess = await HourlyAccessMultiple.findAll({
    where: { hourlyAccessId: decoded_id },
  });

  let attachment;
  const data = await Promise.all(
    hourlyAccess.map(async (value) => {
      attachment = await Attachment.findOne({
        where: {
          id: value.dataValues.attachmentId,
        },
      });
      return attachment;
    })
  );

  const document = await getDocument(attachment?.dataValues.itemId);

  async function sendEmailToUser(userId) {
    const user = await User.findOne({
      where: { id: userId },
    });

    // get hourlyaccess user
    const userAccessEmail = await execSelectQuery(` 
      select * from hourly_access_multiples ham 
      join hourly_accesses ha on ha.id =ham.hourlyAccessId 
      where ha.id = ${decoded_id}`);

    const localUser = await User.findOne({ where: { id: userAccessEmail[0].userId || "" } });
    const otherUser = userAccessEmail[0]?.userEmail;

    await sendMessage(
      hourlyAccessUserNotifylTemplate({
        user: {
          name: user.name,
          email: user.email,
        },
        document,
        otherUser: otherUser || localUser.dataValues.email,
      })
    );
  }

  // send notification to sensitive details
  // send email to hourly access users.
  if (document?.securityLevel == 4) {
    const users = await execSelectQuery(`select u.id, u.userGroupId  from users u 
      join user_groups ug on ug.id =u.userGroupId 
      join documents d on ug.id =d.userGroupId
      where u.userGroupId = 1 and d.id= ${document.id}
      and (case when (u.branchId = d.branchId
      OR u.departmentId = d.departmentId) then 1 else 0 end) =1`);

    if (users.length > 0) {
      await Promise.all(
        users.map(async (row) => {
          await sendEmailToUser(row.id);
        })
      );
    }
  }
  // send mail to owner if has otp and security level is high
  else if (document?.createdBy && document?.hasOtp) sendEmailToUser(document?.createdBy);

  res.send({
    data: { attachments: data },
    success: true,
    message: "Successful!",
  });
});

module.exports = router;

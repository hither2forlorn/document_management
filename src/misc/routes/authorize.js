const router = require("express").Router();
const auth = require("../../config/auth");
const logger = require("../../config/logger");

const { getPermissions } = require("../../user-management/util/role");

/**
 * @method module:Miscellaneous#isLoggedIn
 * @alias GetLoggedIn
 * @returns Responds with true if the user is authenticated. Checks for the valid token
 */
router.get("/isLoggedIn", auth.required, (req, res, next) => {
  res.send({ success: true });
});
/**
 * @method module:Miscellaneous#isClientLoggedIn
 * @alias GetClientLoggedIn
 * @returns Responds with true if the client user is authenticated. Checks for the valid token
 */
router.get("/isClientLoggedIn", auth.client, (req, res, next) => {
  res.send({ success: true });
});
/**
 * @method module:Miscellaneous#getPermissions
 * @alias getPermissions
 * @returns Responds with the roles of the user for RBAC
 */
router.get("/permissions", auth.required, async (req, res, next) => {
  const roleId = req.payload.roleId;
  getPermissions(roleId)
    .then((permissions) => {
      res.send(permissions);
    })
    .catch((err) => {
      logger.error(err);
      res.status(500).send("Error!");
    });
});

module.exports = router;

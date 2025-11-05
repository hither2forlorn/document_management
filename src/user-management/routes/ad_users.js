const router = require("express").Router();
const Op = require("sequelize").Op;
const auth = require("../../config/auth");
const logger = require("../../config/logger");
const { User } = require("../../config/database");
const { getUsers } = require("../util/user_ldap_auth");
const timeout = require("connect-timeout"); //express v4
const { auditData } = require("../../config/audit");
const USER_TYPE = "admin";
const ldap = require('ldapjs');
const { parse } = require("dotenv");
const { execSelectQuery } = require("../../util/queryFunction");

const LDAP_URL = process.env.LDAP_URL;
const LDAP_BIND_DN = process.env.LDAP_BIND_DN;
const LDAP_BIND_PASSWORD = process.env.LDAP_BIND_PASSWORD;
const LDAP_BASE_DN = process.env.LDAP_BASE_DN;

// Validate Environment Variables
if (!LDAP_URL || !LDAP_BIND_DN || !LDAP_BIND_PASSWORD || !LDAP_BASE_DN) {
  throw new Error('Missing required environment variables for LDAP configuration.');
}

// Function to List All Users
const listAllUsers = () => {
  const client = ldap.createClient({
    url: LDAP_URL,
    timeout: 5000,
    connectTimeout: 10000,
    followReferrals: false, // Disable referral following
  });

  return new Promise((resolve, reject) => {

    client.bind(LDAP_BIND_DN, LDAP_BIND_PASSWORD, (err) => {
      if (err) {
        client.unbind();
      }

      const searchOptions = {
        filter: '(&(objectClass=user)(!(objectClass=computer)))', // Exclude computer accounts
        scope: 'sub', // Search entire subtree
        attributes: [
          'sAMAccountName',
          'mail',
          'userPrincipalName',
          'givenName',
          'sn',
          'displayName',
          'telephoneNumber',
          'department',
        ], // Request specific attributes
      };

      const users = [];

      client.search(LDAP_BASE_DN, searchOptions, (err, res) => {
        if (err) {
          console.error('LDAP search failed:', err.message);
          client.unbind();
          return reject(`Search failed: ${err.message}`);
        }

        res.on('searchEntry', (entry) => {
          try {
            const user = {
              dn: entry.dn,
              attributes: {
                sAMAccountName: entry.attributes.find((attr) => attr.type === 'sAMAccountName')?.vals || [],
                mail: entry.attributes.find((attr) => attr.type === 'mail')?.vals || [],
                userPrincipalName: entry.attributes.find((attr) => attr.type === 'userPrincipalName')?.vals || [],
                givenName: entry.attributes.find((attr) => attr.type === 'givenName')?.vals || [],
                sn: entry.attributes.find((attr) => attr.type === 'sn')?.vals || [],
                displayName: entry.attributes.find((attr) => attr.type === 'displayName')?.vals || [],
                telephoneNumber: entry.attributes.find((attr) => attr.type === 'telephoneNumber')?.vals || [],
                department: entry.attributes.find((attr) => attr.type === 'department')?.vals || [],
              },
            };

            if (user) {
              console.log('Parsed user entry:', user);
              users.push(user);
            } else {
              console.warn('Invalid or empty entry:', entry);
            }
          } catch (err) {
            console.error('Error parsing entry:', err, entry);
          }
        });

        res.on('end', (result) => {
          console.log('Search operation finished with status:', result.status);
          client.unbind();
          if (result.status === 0) {
            resolve(users);
          } else {
            reject(`Search operation failed with status: ${result.status}`);
          }
        });

        res.on('error', (err) => {
          console.error('Error during search operation:', err.message);
          client.unbind();
          reject(`Search operation error: ${err.message}`);
        });
      });
    });
  });
};


// Route to Get AD Users
// Route to Fetch AD Users
router.get('/ad-users/ldap', async (req, res) => {
  try {
    const users = await listAllUsers();

    // Filter out default system accounts (e.g., Administrator, Guest, krbtgt)
    const excludedNames = ['Administrator', 'Guest', 'krbtgt'];
    const filteredUsers = users
      .filter((user) => {
        const name = user.attributes.sAMAccountName?.[0];
        return !excludedNames.includes(name);
      })
      .map((user) => ({
        sAMAccountName: user.attributes.sAMAccountName?.[0] || '',
        userPrincipalName: user.attributes.userPrincipalName?.[0] || '',
        givenName: user.attributes.givenName?.[0] || '',
        sn: user.attributes.sn?.[0] || '',
        displayName: user.attributes.displayName?.[0] || '',
        telephoneNumber: user.attributes.telephoneNumber?.[0] || '',
        department: user.attributes.department?.[0] || '',
        mail: user.attributes.mail?.[0] || '', // Add email attribute
      }));

    res.json({ success: true, data: filteredUsers });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});


router.get("/ad-users", auth.required, (req, res, next) => {
  User.findAll({
    where: { isDeleted: false, type: USER_TYPE },
  })
    .then((users) => {
      const adUsers = users.filter((user) => user.distinguishedName != null);
      res.send(adUsers);
    })
    .catch((err) => {
      logger.error(err);
      res.status(500).send(false);
    });
});

router.get("/ad-users/:id", auth.required, (req, res, next) => {
  User.findOne({
    where: { id: req.params.id, type: USER_TYPE },
  })
    .then((user) => res.send(user))
    .catch((err) => {
      logger.error(err);
      res.status(500).send(false);
    });
});

router.put("/ad-users/:id", auth.required, (req, res, next) => {
  let parsedBody = req.body;
  if (typeof req.body === 'object') {
    try {
      const key = Object.keys(parsedBody)[0]
      parsedBody = JSON.parse(String(key)); // Parse the stringified JSON key
    } catch (err) {
      console.error('Error parsing request body:', err.message);
      return res.status(400).json({ error: 'Invalid request body format' });
    }
  }
  parsedBody = {
    ...parsedBody,
    modifiedBy: req.body.createdBy || null,
  };
  const user = {
    type: USER_TYPE,
    email: parsedBody.email ? parsedBody.email : "",
    id: parsedBody.id ? parsedBody.id : "",
    username: parsedBody.distinguishedName ? parsedBody.distinguishedName : "",
    distinguishedName: parsedBody.distinguishedName ? parsedBody.distinguishedName : "",
    name: (parsedBody.name ? parsedBody.name : ""),
    phoneNumber: parsedBody.phoneNumber ? parsedBody.phoneNumber : "",
    roleId: parsedBody.roleId ? parsedBody.roleId : "",
    branchId: parsedBody.branchId ? parsedBody.branchId : "",
    departmentId: parsedBody.departmentId ? parsedBody.departmentId : "",
    loginAttempts: parsedBody.loginAttempts ? parsedBody.loginAttempts : "",
    loginAttemptsCount: parsedBody.loginAttempts ? parsedBody.loginAttempts : "",
    createdBy: parsedBody.createdBy ? parsedBody.createdBy : "",
    isExpirePassword: false,
    statusId: parsedBody.statusId ? parsedBody.statusId : 1,
    hierarchy: parsedBody.hierarchy ? parsedBody.hierarchy : "",
    editedBy: req.payload.id ? req.payload.id : "",
  };
  console.log("*****user update*******", user);
  //AUDIT STARTS HERE
  auditData(User, user, req.payload);
  //AUDIT ENDS HERE
  User.update(user, {
    where: { id: user.id, type: USER_TYPE },
  })
    .then((_) => res.send(true))
    .catch((err) => {
      logger.error(err);
      res.status(500).send(false);
    });
});

router.post("/ad-users", auth.required, async (req, res, next) => {
  let parsedBody = req.body;
  if (typeof req.body === 'object') {
    try {
      const key = Object.keys(parsedBody)[0]
      parsedBody = JSON.parse(String(key)); // Parse the stringified JSON key
    } catch (err) {
      console.error('Error parsing request body:', err.message);
      return res.status(400).json({ error: 'Invalid request body format' });
    }
  }
  parsedBody = {
    ...parsedBody,
    createdBy: req.body.createdBy || null,
  };
  const userCountResult = await execSelectQuery("SELECT COUNT(*) AS count FROM USERS WHERE isDeleted = 0");
  const userCount = userCountResult[0]?.count;
  if (userCount <= 100) {
    const user = {
      type: USER_TYPE,
      email: parsedBody.mail ? parsedBody.mail : "",
      username: parsedBody.sAMAccountName ? parsedBody.sAMAccountName : "",
      distinguishedName: parsedBody.sAMAccountName ? parsedBody.sAMAccountName : "",
      name: (parsedBody.displayName ? parsedBody.displayName : ""),
      phoneNumber: parsedBody.telephoneNumber ? parsedBody.telephoneNumber : "",
      roleId: parsedBody.roleId ? parsedBody.roleId : "",
      branchId: parsedBody.branchId ? parsedBody.branchId : "",
      departmentId: parsedBody.departmentId ? parsedBody.departmentId : "",
      loginAttempts: parsedBody.loginAttempts ? parsedBody.loginAttempts : "",
      loginAttemptsCount: parsedBody.loginAttempts ? parsedBody.loginAttempts : "",
      createdBy: parsedBody.createdBy ? parsedBody.createdBy : "",
      isExpirePassword: false,
      statusId: parsedBody.statusId ? parsedBody.statusId : 1,
      hierarchy: parsedBody.hierarchy ? parsedBody.hierarchy : "",
    };
    User.create(user)
      .then((_) => res.send(true))
      .catch((err) => {
        logger.error(err);
        res.status(500).send(false);
      });
  } else {
    res.status(403).json({ success: false, message: "Unable to add user maximum number for user exceeded" })
  }

});

router.delete("/ad-users/:id", auth.required, (req, res, next) => {
  User.update(
    {
      isDeleted: true,
    },
    {
      where: { id: req.params.id, type: USER_TYPE },
    }
  )
    .then((_) => {
      res.send("Successful!");
    })
    .catch((err) => {
      logger.error(err);
      res.status(500).send("Error!");
    });
});

module.exports = router;

const ldap = require("ldapjs");
const logger = require("../../config/logger");
const _ = require("lodash");
const { LDAP: ldapOptions } = require("../../config/credentials");

/**
 * <p>This method is used to parse user from the Active directory list. As the users
 * retrieved from the AD comes in buffer so this function parse that data into utf-8
 * and returns users easily understood by the end users.</p>
 * @method module:UserManagement#getUserFromADBuffer
 */
function getUserFromADBuffer(user) {
  const decodedUser = {};
  user.attributes.map((attr, idx) => (decodedUser[attr.type] = Buffer.from(attr._vals[0], "utf-8").toString()));
  return decodedUser;
}

/**
 * <p>This method is used to get all users from the Active directory of users called by getAllUsers</p>
 * <p>As the getAllUsers function gets the unformatted data and there might be some duplicate users, This function
 * is responsible for cleaning the users data.</p>
 * @method module:UserManagement#getUsers
 */
function getUsers(callback) {
  const nonDuplicateUsers = [];
  getAllUsers((users) => {
    users.forEach((user) => {
      const decodedUser = getUserFromADBuffer(user);
      const isContained = _.find(nonDuplicateUsers, {
        distinguishedName: decodedUser.distinguishedName,
      });
      if (!isContained) {
        decodedUser.telephoneNumber = decodedUser.mobile ? decodedUser.mobile : "";
        nonDuplicateUsers.push(decodedUser);
      }
    });
    callback(nonDuplicateUsers);
  });
}

/**
 * <p>This method is used to get all users from the Active directory for one suffix</p>
 * @method module:UserManagement#getUsersBySuffix
 */
async function getUsersBySuffix(client, suffix) {
  // var filter = `(&(objectCategory=person)(samaccountname=*))`;
  const opts = {
    filter: "(objectClass=user)",
    scope: "sub",
  };
  const users = await new Promise((resolve, reject) => {
    client.search(suffix, opts, (err, searchRes) => {
      var searchList = [];
      if (err) {
        console.log("Suff =", err);
        // result += "Search failed " + err;
        resolve(searchList);
      }
      searchRes.on("searchEntry", (entry) => {
        // result += "Found entry: " + entry + "\n";
        // console.log("Search Entry =", entry);

        searchList.push(entry);
      });
      searchRes.on("error", (err) => {
        // result += "Search failed with " + err;
        resolve(searchList);
      });
      searchRes.on("end", (retVal) => {
        // result += "Search results length: " + searchList.length + "\n";
        resolve(searchList);
      }); // searchRes.on("end",...)
    }); // client.search
  });
  return users;
}

// client.search("ou=users", opts, (err, res,err) => {
//   // assert.ifError(err);

//   res.on("searchRequest", (searchRequest) => {
//     console.log("searchRequest: ", searchRequest.messageID);
//   });
//   res.on("searchEntry", (entry) => {
//     console.log("entry: " + JSON.stringify(entry.object));
//   });
//   res.on("searchReference", (referral) => {
//     console.log("referral: " + referral.uris.join());
//   });
//   res.on("error", (err) => {
//     console.error("error: " + err.message);
//   });
//   res.on("end", (result) => {
//     console.log("status: " + result.status);
//   });
// });
// }

/**
 * <p>This method is used to get all users from the Active directory of users</p>
 * <p>As most of the bank has more than one OU groups so there is SUFFIX_ONE and SUFFIX_TWO to get the users.
 * If you want to get more than two then you have to use SUFFIX_THREE by creating it yourself.</p>
 * @method module:UserManagement#getAllUsers
 */
async function getAllUsers(callback) {
  var client = ldap.createClient({
    url: ldapOptions.serverUrl,
  });
  let result;
  try {
    client.bind(ldapOptions.username, ldapOptions.password, async function (err) {
      if (err) {
        console.log("Erro", err);
        result += "Reader bind failed " + err;
        callback([]);
      }
      // result += "Reader bind succeeded\n";
      // console.log("Success", ldapOptions.suffixOne);
      // result += `LDAP filter: ${filter}\n`;
      const clientsOne = await getUsersBySuffix(client, ldapOptions.suffixOne);

      let clientsTwo = [];
      if (ldapOptions.suffixTwo) {
        clientsTwo = await getUsersBySuffix(client, ldapOptions.suffixTwo);
      }

      if (clientsTwo && clientsTwo?.length > 0) callback([...clientsOne, ...clientsTwo]);
      else callback([...clientsOne]);
    }); // client.bind  (reader account)
  } catch (error) {
    console.log(error);
  }
}

/**
 * <p>This method is used by passport.js for the authentication of the users</p>
 * <p>This method is used for authentication of AD users by distinguishedName and password</p>
 * @method module:User`Management#adUserSignInUsingLdap
 */
function signInLdap(distinguishedName, password, callback) {
  var result = ""; // To send back to the client

  var client = ldap.createClient({
    url: ldapOptions.serverUrl,
  });

  client.bind(distinguishedName, password, function (err) {
    if (err) {
      result += "Reader bind failed " + err;
      logger.info(result);
      callback(false);
      return;
    }
    callback(true);
  });
}

/**
 * <p>This method is used by passport.js for the authentication of the users</p>
 * <p>This method is used for authentication of AD users using username and password</p>
 * @method module:UserManagement#adUserSignIn
 */
function signIn(username, password, callback) {
  var client = ldap.createClient({
    url: ldapOptions.serverUrl,
  });

  let result;
  client.bind(username, password, function (err, data) {
    if (err) {
      result = "Bind failed " + err;
    }
    result = "Log on successful";
    callback(result);
  }); // client.bind
}

module.exports = {
  getUsers,
  signIn,
  signInLdap,
};

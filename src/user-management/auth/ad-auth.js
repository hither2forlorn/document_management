const ldap = require('ldapjs');
require('dotenv').config(); // Load environment variables

function authenticate(username, password, callback) {
  const client = ldap.createClient({
    url: process.env.LDAP_URL,
  });

  // Bind with service account
  client.bind(process.env.LDAP_BIND_DN, process.env.LDAP_BIND_PASSWORD, (err) => {
    if (err) {
      console.error('Service account bind failed:', err);
      client.unbind();
      return callback(err);
    }

    // Search for the user DN
    const searchOptions = {
      filter: `(sAMAccountName=${username})`,
      scope: 'sub',
    };

    client.search(process.env.LDAP_BASE_DN, searchOptions, (err, res) => {
      if (err) {
        console.error('Search error:', err);
        client.unbind();
        return callback(err);
      }

      let userDN = null;
      let searchErrorOccurred = false;

      res.on('searchEntry', (entry) => {
        userDN = entry.dn.toString(); // Convert DN object to string
        console.log('User DN found:', userDN);
        console.log('Type of userDN:', typeof userDN);
      });

      res.on('error', (err) => {
        console.error('Search error:', err);
        searchErrorOccurred = true;
        client.unbind();
        return callback(err);
      });

      res.on('end', () => {
        if (searchErrorOccurred) return; // Callback already invoked on error

        if (!userDN) {
          console.error('User not found');
          client.unbind();
          return callback(new Error('User not found'));
        }

        // Attempt to bind as the user
        client.bind(userDN, password, (err) => {
          client.unbind();

          if (err) {
            console.error('User authentication failed:', err);
            return callback(null, false);
          }

          console.log('User authenticated successfully');
          return callback(null, true);
        });
      });
    });
  });
}

module.exports = { authenticate };

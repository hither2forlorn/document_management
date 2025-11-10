const { User } = require("../../config/database");

const getUserEmail = async (id) => {
  const getUserEmail = await User.findOne({
    where: {
      id: id,
    },
  });
  return getUserEmail.email;
};

module.exports = getUserEmail;
const { User } = require("../../config/database");

function checkAndUpdateUserExpiration(passportUser) {
  const createdAt = passportUser.createdAt;
  const currentDate = new Date();
  const diffTime = Math.abs(currentDate - createdAt);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays > 90) {
    return User.update({ isExpirePassword: true }, { where: { id: passportUser.id } })
      .then(() => {
        return {
          status: 401,
          message: "Your account has exceeded 90 days of creation. Please Login again to change the password.",
          isExpiry: true,
          success: false,
        };
      })
      .catch((error) => {
        console.error("Failed to update user:", error);
        return { status: 500, message: "Internal server error" };
      });
  } else {
    return false;
  }
}

module.exports = checkAndUpdateUserExpiration;

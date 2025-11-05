function isSuperAdmin(user) {
  return user?.id === 1 || user?.hierarchy == "Super-001" || user?.roleId === 1 ? true : false;
}
module.exports = isSuperAdmin;

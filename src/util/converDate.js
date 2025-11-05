function convertDate(date) {
  if (!date) return null;
  return date.split("/").reverse().join("-");
}
module.exports = { convertDate };

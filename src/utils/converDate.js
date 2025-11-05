export function convertDate(date) {
  if (!date) return null;
  return date.split("/").reverse().join("-");
}

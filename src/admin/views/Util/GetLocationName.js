/**
 *
 * Gets location data
 *
 * @param {*} Data contains array list of objects
 * @param {*} value to filter specific data
 * @returns object of data
 */

function getLocationData(Data, value) {
  if (!value) return;
  return Data.find((element) => element.id == value);
}

export { getLocationData };

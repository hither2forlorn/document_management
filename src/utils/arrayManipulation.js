/**
 *
 * Remove object with id
 * @param {[*]} array
 * @param {*} key
 * @param {*} value
 * @returns filterd array of objects
 */
function removeObjectWithKey(array, key, value) {
  const data = array.filter((assoc) => assoc?.[key] != value);
  return data;
}

/**
 *
 * @param {*} array
 * @param {*} key
 * @returns unique array
 */
function uniqueByValue(array, key) {
  // console.log(array.map((item) => [item[key], item]));
  const arrayUniqueByKey = [...new Map(array.map((item) => [item[key], item])).values()];
  return arrayUniqueByKey;
}

/**
 * Sort array of object
 *
 * [{id:1,name:"ram"}]
 * @param {*} array
 * @param {*} key
 * @returns
 */
function sortArrayOfObject(array, key) {
  return array.sort((a, b) => (a?.[key] > b?.[key] ? 1 : b?.[key] > a?.[key] ? -1 : 0));
}

function filter_hierarchies(hierarchies, constant = false) {
  return hierarchies?.filter(
    (row) =>
      (row.type == "department" && row.departmentId) ||
      (row.type == "branch" && row.branchId) ||
      (row.name == "CONSTANT" && constant)
  );
}

function add_serial_in_array(array) {
  array = array.map((row, index) => {
    row.serial = index + 1;
    return row;
  });
}

export { removeObjectWithKey, uniqueByValue, sortArrayOfObject, filter_hierarchies, add_serial_in_array };

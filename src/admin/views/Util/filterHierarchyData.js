/**
 * @module Utility
 */

/**
 * @method module:Utility#getSortedItems
 * @param {Object[]} items List of items - must contain {parentId, id, level}
 * @param {Number} parentId 'null' Parent ID field defaults to null
 *
 * when added
 * @returns The sorted array according to the hierarchy of the items
 */
const getSortedItems = (items, parentId, getAllRoute) => {
  const sortedItems = [];

  // for level that is not 0
  // calculate lowest level i.e. the parent id
  // it came from getAll route
  if (getAllRoute && items) {
    //find the lowest level
    let lowestLevel = items[0]?.level;
    items.forEach((d) => {
      if (lowestLevel >= d.level) {
        lowestLevel = d.level;
      }
    });

    // Get all parent element
    const parentElements = items.filter((d) => (d.level === lowestLevel ? 1 : 0));
    parentElements.forEach((d) => {
      sortedItems.push(d, ...getSortedItems(items, d.id));
    });
  }
  // if getSortedItems has 2nd params or parentId then it executes.
  else if (parentId) {
    const children = items.filter((d) => (d.parentId === parentId ? 1 : 0));
    children.forEach((d) => {
      sortedItems.push(d, ...getSortedItems(items, d.id));
    });
  } else {
    // Get all parent element
    const parentElements = items.filter((d) => (d.level === 0 ? 1 : 0));
    parentElements.forEach((d) => {
      sortedItems.push(d, ...getSortedItems(items, d.id));
    });
  }
  return sortedItems;
};

export default getSortedItems;

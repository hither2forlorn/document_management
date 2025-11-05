/**
 *
 * @param {*} hierarchies
 * @param {*} hierarchyCode
 * @returns security hierarchy path
 */

function getSecurityHierarchyPath(hierarchies, hierarchyCode) {
  const tempPath = [];

  if (!hierarchyCode) return;
  //  find the security hierarchy
  const itemIs = hierarchies.filter((item) => item.code === hierarchyCode);
  if (itemIs.length > 0) {
    if (itemIs[0]?.parentId !== null && itemIs[0] !== undefined) {
      hierarchies.forEach((item) => {
        if (item.id === itemIs[0].parentId) {
          tempPath.push(item.name);
        }
      });
    }
    tempPath.push(itemIs[0].name);
    return tempPath.toString().replace(",", " --> ");
  }
}

export default getSecurityHierarchyPath;

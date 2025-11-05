/**
 *
 * @method module:Utility#getSearchTree
 * @param {Model} Model Model you want to get the hierarchy for eg: LocationMap
 * @param {Number} id  Id of the item you want to search in the database
 * @param {key} key Key to map the id to later search in the table for: eg: locationMapId for document table
 *
 * @example <caption>Example usage of getSearchTree</caption>
 * // returns [{ locationMapId: 17 },{ locationMapId: 18 },{ locationMapId: 19 },{ locationMapId: 20 }]
 * // Here the main id is 17 and the children of {id: 17} is [18,19,20] so that the document will be searched into these id too.
 * getSearchTree(LocationMap, 17, 'locationMapId');
 * @returns {Array} Array of the id of the children of the particular item in hierarchial order
 *
 */
const getSearchTree = async (Model, id, key) => {
  if (!id) return {};
  const values = await getTreeById(Model, id);
  const list = [{ [key]: id }, ...values.map(({ id }) => ({ [key]: id }))];
  return list;
};

const getTreeById = async (Model, id) => {
  let parentId = id;
  const data = await Model.findAll({
    where: { parentId },
    attributes: ["id"],
    raw: true,
  });
  if (data.length) {
    const arr = await Promise.all(data.map((d) => getTreeById(Model, d.id)));
    const flattenedArr = [].concat.apply([], arr);
    return [...data, ...flattenedArr];
  } else {
    return data || [];
  }
};

module.exports.getSearchTree = getSearchTree;

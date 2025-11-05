const router = require("express").Router();
const auth = require("../../config/auth");
const { Tag } = require("../../config/database");
const { execSelectQuery } = require("../../util/queryFunction");

const isAdminQuery = (req, departmentId, branchId) => {
  const isAdmin = req.payload.id === 1 ? true : false;
  let query = "";
  if (!isAdmin)
    query = `     
  WHERE ${departmentId ? `departmentId=${departmentId}` : `branchId=${branchId}`}
  `;
  return query;
};

router.get("/tags", auth.required, async (req, res, next) => {
  const departmentId = req.payload.departmentId;
  const branchId = req.payload.branchId;
  const query = `select count (*) count, value
  from tags t
  
  ${isAdminQuery(req, departmentId, branchId)}

  group by t.value`;
  const tags = await execSelectQuery(query);
  res.json({ success: true, data: tags });
});
router.get("/tags/suggest", auth.required, async (req, res, next) => {
  const createdBy = req.payload.id;
  const departmentId = req.payload.departmentId;
  const branchId = req.payload.branchId;

  const query = `SELECT TOP 5 t.value,COUNT(t.value) total
                  from tags t
                  ${isAdminQuery(req, departmentId, branchId)}

                  group by t.value
                  ORDER by total DESC
                  `;
  const tags = await execSelectQuery(query);
  res.json({ success: true, data: tags });
});

module.exports = router;

const router = require("express").Router();
const auth = require("../../config/auth");
const validator = require("../../util/validation");
const { deleteItem, LOCATION_MAP } = require("../../config/delete");
const { LocationMap, MultipleHierarchies } = require("../../config/database");
const { locationMapValidation, locationMapValidationEdit } = require("../../validations/location_map");
const { availableHierarchy } = require("../../util/hierarchyManage");
const { createLog, constantLogType, findPreviousData } = require("../../util/logsManagement");
const { execSelectQuery } = require("../../util/queryFunction");
const Sequelize = require("sequelize");

router.post("/location-map", validator(locationMapValidation), auth.required, async (req, res, next) => {
  // To maintain log
  let log_query;

  const locationMapName = req.body.name;
  req.body.parentId = req.body.parentId || null;
  const existLocationMap = await LocationMap.findOne({
    // To maintain log
    logging: (sql) => (log_query += sql),
    where: {
      isDeleted: false,
      name: locationMapName,
      parentId: req.body.parentId,
      hierarchy: req.body.hierarchy || "",
    },
  });

  if (!req.payload?.branchId) req.body.branchId = req.payload.branchId;
  if (!req.body?.hierarchy) req.body.hierarchy = "CONSTANT";

  const locationMap = req.body;

  // Exist location map
  if (existLocationMap) {
    res.json({
      success: false,
      message: "Location Map with this name exists!!",
    });
  } else {
    let hierarchies = locationMap.multiple_hierarchy;

    const multiple_hierarchy = typeof hierarchies === "object";

    if (multiple_hierarchy) req.body.multiple_hierarchy = null;

    const locationMapRes = await LocationMap.create(req.body, {
      logging: (sql) => (log_query += sql),
    });

    // CREATE MULTIPLE CODE FOR MULTIPLE HIERARCHY
    if (multiple_hierarchy && hierarchies?.length > 0) {
      // update location id
      await LocationMap.update(
        {
          multipleHierarchy: locationMapRes.id,
        },
        {
          where: { id: locationMapRes.id },
        }
      );

      hierarchies = hierarchies.map((row) => {
        return {
          ...row,
          modelValueId: locationMapRes.id,
          modelTypesId: constantLogType.LOCATION_MAP,
          hierarchy_id: row.id,
          hierarchy: row.code,
        };
      });

      // remvoe id form hierarchy
      hierarchies = hierarchies.map((row) => {
        delete row.id;
        return row;
      });

      await MultipleHierarchies.bulkCreate(hierarchies);
    }

    // To maintain log
    await createLog(req, constantLogType.LOCATION_MAP, locationMapRes.id, log_query);

    res.json({
      success: true,
      message: "Location successfully created!",
    });
  }
});

router.put("/location-map", validator(locationMapValidationEdit), auth.required, async (req, res, next) => {
  // To maintain log
  let log_query;
  let locationMap = req.body;
  locationMap.multipleHierarchy = req.body.id;
  let multiple_hierarchy = req.body.multiple_hierarchy || [];
  req.body.parentId = req.body.parentId || null;

  // get previous data
  const previousValue = await findPreviousData(constantLogType.LOCATION_MAP, req.body.id, req.method);

  // check if the documetnt has childerns
  if (req.body.parentId != previousValue.dataValues.parentId) {
    const locationMapChildren = await LocationMap.findAll({
      where: {
        isDeleted: false,
        parentId: req.body.id,
      },
      raw: true,
    });

    if (locationMapChildren.length > 0) return res.send({ success: false, message: "Contains children Location Map." });
  }

  // delete all multiple
  await MultipleHierarchies.destroy({
    where: {
      modelValueId: locationMap.id,
      modelTypesId: constantLogType.LOCATION_MAP,
    },
  });

  // remvoe id form hierarchy
  multiple_hierarchy = multiple_hierarchy.map((row) => {
    row.modelTypesId = constantLogType.LOCATION_MAP;
    row.modelValueId = locationMap.id;
    row.hierarchy = row.code;
    row.hierarchy_id = row.value;
    delete row.id;

    return row;
  });

  // add all hiearchies.
  await MultipleHierarchies.bulkCreate(multiple_hierarchy);

  const locationMapName = req.body.name;
  req.body.parentId = req.body.parentId || null;

  const existLocationMap = await LocationMap.findOne({
    // To maintain log
    logging: (sql) => (log_query += sql),
    where: {
      isDeleted: false,
      id: {
        [Sequelize.Op.not]: req.body.id,
      },
      name: locationMapName,
      parentId: req.body.parentId,
      hierarchy: req.body.hierarchy,
    },
  });
  // Exist location map
  if (existLocationMap) {
    return res.json({
      success: false,
      message: "Location Map with this name exists!!",
    });
  } else {
    await LocationMap.update(locationMap, {
      logging: (sql) => (log_query = sql),
      where: { id: locationMap.id },
    });
  }

  // To maintain log
  await createLog(req, constantLogType.LOCATION_MAP, locationMap.id, log_query, previousValue);

  res.json({
    success: true,
    message: "Location successfully created!",
  });
});

router.get("/location-map/:id", auth.required, async (req, res, next) => {
  const query = `SELECT * from location_maps lm WHERE lm.id=${req.params.id}`;

  const query2 = `	select mh.id id,sh.code, sh.name label, mh.id mh_table_id, mh.hierarchy_id value, mh.hierarchy,mh.hierarchy_id hierarchy_id  
	from location_maps lm 
	join multiple_hierarchies mh on mh.modelValueId =lm.id and mh.modelTypesId =${constantLogType.LOCATION_MAP}
	join security_hierarchies sh on sh.id = mh.hierarchy_id 
	where lm.id=${req.params.id}`;

  let location = await execSelectQuery(query);
  const multiple_hierarchies = await execSelectQuery(query2);

  location[0].multiple_hierarchy = multiple_hierarchies;

  // To maintain log
  res.json({ success: true, data: location[0] });
});

router.get("/location-map", auth.required, async (req, res, next) => {
  const hierarchyMap = await availableHierarchy(req.payload.id, "location_maps", "*", "");

  const result = [];
  await Promise.all(
    hierarchyMap.map(async (row) => {
      row.multiple_hierarchy = await MultipleHierarchies.findAll({
        where: {
          modelValueId: row.id,
          // modelTypesId: constantLogType.LOCATION_MAP,
        },
      });
      result.push(row);
    })
  );

  if (hierarchyMap) {
    res.json({ data: result.length > 0 ? result : hierarchyMap });
  } else {
    console.log(err);
    res.send({ success: false, message: "No Location Map found." });
  }
});

router.delete("/location-map/:id", auth.required, (req, res, next) => {
  deleteItem(
    LocationMap,
    {
      id: req.params.id,
      type: LOCATION_MAP,
      from: "Location Map",
      hasHierarchy: true,
    },
    req.payload,
    (response) => {
      res.send(response);
    },
    req
  );
});

module.exports = router;

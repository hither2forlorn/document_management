const router = require("express").Router();
const auth = require("../../config/auth");
const validator = require("../../util/validation");
const { locationTypeValidation, locationTypeValidationEdit } = require("../../validations/location_type");
const { deleteItem, LOCATION_TYPE } = require("../../config/delete");
const { LocationType } = require("../../config/database");

router.post("/location-type", validator(locationTypeValidation), auth.required, async (req, res, next) => {
  const locationTypeName = req.body.name;

  const existingLocationType = await LocationType.findOne({
    where: { isDeleted: false, name: locationTypeName },
  });

  if (existingLocationType) {
    res.json({
      success: false,
      message: "Location Type with this name exists!!",
    });
  } else {
    await LocationType.create(req.body)
      .then((_) => {
        res.json({ success: true, message: "Successfully created!" });
      })
      .catch((err) => {
        console.log(err);
        res.json({ success: false, message: "Error!" });
      });
  }
});

router.get("/location-type", auth.required, (req, res, next) => {
  LocationType.findAll({
    where: { isDeleted: false },
  })
    .then((locationTypes) => {
      res.json({ success: true, data: locationTypes });
    })
    .catch((err) => {
      res.status(500);
      res.json({ success: false, data: "Error in the server!" });
    });
});

router.get("/location-type/:id", auth.required, (req, res, next) => {
  LocationType.findOne({
    where: { id: req.params.id },
  })
    .then((locationType) => {
      res.json(locationType);
    })
    .catch((err) => {
      console.log(err);
      res.status(500);
      res.json({ success: false, message: "Error! On the server" });
    });
});

router.put("/location-type", validator(locationTypeValidationEdit), auth.required, async (req, res, next) => {
  // check if the location type name is already exists
  const locationTypeName = req.body.name;

  const existingLocationType = await LocationType.findOne({
    where: { isDeleted: false, name: locationTypeName },
  });
  console.log(existingLocationType, "this is existing location type");

  if (existingLocationType) {
    res.json({
      success: false,
      message: "Location Type with this name exists!",
    });
  }

  await LocationType.update(req.body, {
    where: { id: req.body.id },
  })
    .then((_) => {
      res.json({ success: true, message: "Successfully updated!" });
    })
    .catch((err) => {
      console.log(err);
      res.status(500);
      res.json({ success: false, message: "Error! On the server" });
    });
});

router.delete("/location-type/:id", auth.required, (req, res, next) => {
  deleteItem(
    LocationType,
    {
      id: req.params.id,
      type: LOCATION_TYPE,
    },
    req.payload,
    (response) => {
      res.send(response);
    },
    req
  );
});

module.exports = router;

const router = require("express").Router();
const logger = require("../../config/logger");
const { Client } = require("../../config/database");
const { deleteItem, CLIENT } = require("../../config/delete");
const { hashPassword } = require("../../util/user");

router.post("/user", (req, res, next) => {
  const client = req.body;
  client.username = client.username ? client.username : client.email;
  hashPassword(client.password, (err, hash) => {
    if (err) {
      res.status(500).send({ message: "Error Occured!" });
    } else {
      client.password = hash;
      Client.create(client)
        .then((client) => {
          res.json({ success: true, message: "Client created successful." });
        })
        .catch((err) => {
          logger.error(err);
          res.status(500).send({ message: "Client created failed!!" });
        });
    }
  });
});

router.get("/user", (req, res, next) => {
  Client.findAll({
    where: { isDeleted: false },
  })
    .then((clients) => {
      res.json({ success: true, data: clients });
    })
    .catch((err) => {
      logger.error(err);
      res.status(500).send({ message: "Client display failed!" });
    });
});

router.get("/user/:id", (req, res, next) => {
  Client.findOne({
    where: { id: req.params.id, isDeleted: false },
  })
    .then((clients) => {
      res.json({ success: true, data: clients });
    })
    .catch((err) => {
      logger.error(err);
      res.status(500).send({ success: false, message: "Error getting client!" });
    });
});

router.delete("/user/:id", (req, res, next) => {
  deleteItem(
    Client,
    {
      id: req.params.id,
      type: CLIENT,
    },
    req.payload,
    (response) => {
      res.send(response);
    }
  );
});

router.put("/user", (req, res, next) => {
  const client = req.body;
  client.username = client.username ? client.username : client.email;
  Client.update(client, {
    where: { id: req.body.id, isDeleted: false },
  })
    .then((_) => {
      res.json({
        success: true,
        message: "Client updated successfully.",
        updatedValue: client,
      });
    })
    .catch((err) => {
      res.status(500).send({ success: false, message: "Error in updating" });
    });
});

module.exports = router;

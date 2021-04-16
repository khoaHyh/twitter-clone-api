const express = require("express");
const router = express.Router();
const utils = require("../utils/utils");
const handleDm = require("../controllers/handleDm");

// Create message route
router.post(
  "/direct_messages/events/new",
  utils.ensureAuthenticated,
  handleDm.createMessage
);

router.get(
  "/direct_messages/events/list",
  utils.ensureAuthenticated,
  handleDm.getAllMessages
);

module.exports = router;

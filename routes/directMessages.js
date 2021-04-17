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

// Get all messages associated with the authenticated user
router.get(
  "/direct_messages/events/list",
  utils.ensureAuthenticated,
  handleDm.getAllMessages
);

// Get a single direct message
router.get(
  "/direct_messages/events/show",
  utils.ensureAuthenticated,
  handleDm.showSingleMessage
);

module.exports = router;

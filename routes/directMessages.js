const express = require("express");
const router = express.Router();
const utils = require("../utils/utils");
const handleDm = require("../controllers/handleDm");

// Create message route
router.post("/events/new", utils.ensureAuthenticated, handleDm.createMessage);

// Get all messages associated with the authenticated user
router.get("/events/list", utils.ensureAuthenticated, handleDm.getAllMessages);

// Get a single direct message
router.get(
  "/events/show",
  utils.ensureAuthenticated,
  handleDm.showSingleMessage
);

// Delete a single direct message
router.delete(
  "/events/delete",
  utils.ensureAuthenticated,
  handleDm.deleteMessage
);

module.exports = router;

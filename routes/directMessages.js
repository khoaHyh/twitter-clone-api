const express = require("express");
const router = express.Router();
const utils = require("../utils/utils");

router.post(
  "/home/direct_messages/events/new",
  utils.ensureAuthenticated,
  () => {}
);

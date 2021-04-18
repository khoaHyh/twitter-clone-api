const express = require("express");
const router = express.Router();
const utils = require("../utils/utils");
const handleTweet = require("../controllers/handleTweet");

// Get all tweets route
router.get("/lookup", utils.ensureAuthenticated, handleTweet.lookupTweets);

// Get single tweet route
router.get("/show/:id", utils.ensureAuthenticated, handleTweet.showTweet);

// Create tweet route
router.post("/create", utils.ensureAuthenticated, handleTweet.createTweet);

module.exports = router;

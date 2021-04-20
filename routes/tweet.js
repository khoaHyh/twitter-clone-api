const express = require("express");
const router = express.Router();
const utils = require("../utils/utils");
const handleTweet = require("../controllers/handleTweet");

router.get("/lookup", utils.ensureAuthenticated, handleTweet.lookupTweets);

router.get("/show/:id", utils.ensureAuthenticated, handleTweet.showTweet);

router.post("/create", utils.ensureAuthenticated, handleTweet.createTweet);

router.put("/update", utils.ensureAuthenticated, handleTweet.updateTweet);

router.delete("/delete", utils.ensureAuthenticated, handleTweet.deleteTweet);

module.exports = router;

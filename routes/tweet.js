const express = require("express");
const router = express.Router();
const utils = require("../utils/utils");
const handleTweet = require("../controllers/handleTweet");

router.get("/lookup", utils.ensureAuthenticated, handleTweet.lookupTweets);

router.get("/show/:id", utils.ensureAuthenticated, handleTweet.showTweet);

router.get(
  "/retweet/list",
  utils.ensureAuthenticated,
  handleTweet.listRetweets
);

router.post("/create", utils.ensureAuthenticated, handleTweet.createTweet);

router.post("/retweet/:id", utils.ensureAuthenticated, handleTweet.retweet);

router.put("/update", utils.ensureAuthenticated, handleTweet.updateTweet);

router.delete("/delete", utils.ensureAuthenticated, handleTweet.deleteTweet);

router.delete(
  "/unretweet/:id",
  utils.ensureAuthenticated,
  handleTweet.unretweet
);

module.exports = router;

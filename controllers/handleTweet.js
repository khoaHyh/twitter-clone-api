const mongoose = require("mongoose");
const User = require("../models/user");
const Tweet = require("../models/tweet");
const Filter = require("bad-words");
const filter = new Filter();

// Get all tweets from database
const lookupTweets = async (req, res, next) => {
  // Retrieve all tweets in database and sort in reverse chronological order
  const allTweets = await Tweet.find().sort({ created_timestamp: -1 });

  // If there are no tweets in the database, return 404
  if (allTweets.length < 1) {
    return res.status(404).json({ message: "No tweets found." });
  }

  res.status(200).json(allTweets);
};

// Returns a single tweet
const showTweet = async (req, res, next) => {
  const tweetId = req.params.id;
  const validObjectId = mongoose.isValidObjectId(tweetId);

  // Return 400 if tweetId is invalid
  if (!tweetId || !validObjectId) {
    return res.status(400).json({ message: "Invalid tweet id." });
  }

  const singleTweet = await Tweet.findById(tweetId);

  // Return 404 if Tweet cannot be found
  if (!singleTweet) {
    return res.status(404).json({ message: "Tweet not found." });
  }

  const singleTweetRes = {
    id: singleTweet._id,
    authorId: singleTweet.authorId,
    created_timestamp: singleTweet.created_timestamp,
    text: singleTweet.text,
    likes: singleTweet.likes,
    retweet: singleTweet.retweet,
    retweet_count: singleTweet.retweet_count,
  };

  //console.log(tweetId);
  res.status(200).json(singleTweetRes);
};

// Create a tweet
const createTweet = async (req, res, next) => {
  const userId = req.user._id;
  let { text } = req.body;

  // Check if the text field is empty or >= 140 characters in length
  if (!text || text.trim() === "" || text.length >= 140) {
    return res.status(422).json({
      message:
        "Text is required and cannot be or exceed 140 characters in length.",
    });
  }

  const newTweet = await Tweet.create({ authorId: userId, text });

  // Construct response object and filter out profanity in tweet content
  const newTweetResponse = {
    created_at: newTweet.created_at,
    id: newTweet._id,
    text: filter.clean(newTweet.text),
  };

  res.status(201).json(newTweetResponse);
};

module.exports = { lookupTweets, showTweet, createTweet };

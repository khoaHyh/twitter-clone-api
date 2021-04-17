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

// Create a tweet
const createTweet = async (req, res, next) => {
  const username = req.user.username;
  let { text } = req.body;

  if (!text || text.trim() === "" || text.length >= 140) {
    return res.status(422).json({
      message: "Text is required and cannot exceed 140 characters in length.",
    });
  }

  const newTweet = await Tweet.create({ authorId: username, text });

  const newTweetResponse = {
    created_at: newTweet.created_at,
    id: newTweet._id,
    text: filter.clean(newTweet.text),
  };

  res.status(201).json(newTweetResponse);
};

module.exports = { lookupTweets, createTweet };

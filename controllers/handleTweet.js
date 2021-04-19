const mongoose = require("mongoose");
const Tweet = require("../models/tweet");
const Filter = require("bad-words");
const filter = new Filter();

// Get all tweets from database
const lookupTweets = async (req, res, next) => {
  try {
    // Retrieve all tweets in database and sort in reverse chronological order
    const allTweets = await Tweet.find().sort({ created_timestamp: -1 });

    // If there are no tweets in the database, return 404
    if (allTweets.length < 1) {
      return res.status(404).json({ message: "No tweets found." });
    }

    res.status(200).json(allTweets);
  } catch (error) {
    console.log(error);
    return next(err);
  }
};

// Returns a single tweet
const showTweet = async (req, res, next) => {
  const tweetId = req.params.id;

  try {
    const validObjectId = mongoose.isValidObjectId(tweetId);

    // Check if the supplied tweet id is a valid ObjectId
    if (!validObjectId || !tweetId) {
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
      updated_at: singleTweet.updated_at,
      text: singleTweet.text,
      likes: singleTweet.likes,
      retweet: singleTweet.retweet,
      retweet_count: singleTweet.retweet_count,
    };

    res.status(200).json(singleTweetRes);
  } catch (error) {
    console.log(error);
    return next(error);
  }
};

// Create a tweet
const createTweet = async (req, res, next) => {
  const userId = req.user._id;
  let { text } = req.body;

  try {
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
  } catch (error) {
    console.log(error);
    return next(error);
  }
};

// Update tweet
const updateTweet = async (req, res, next) => {
  const authorId = req.user._id;
  let { text, tweetId } = req.body;

  try {
    // Check if the text field is empty or >= 140 characters in length
    if (!text || text.trim() === "" || text.length >= 140) {
      return res.status(422).json({
        message:
          "Text is required and cannot be or exceed 140 characters in length.",
      });
    }

    const validObjectId = mongoose.isValidObjectId(tweetId);

    // Check if the supplied tweet id is a valid ObjectId
    if (!validObjectId || !tweetId) {
      return res.status(400).json({ message: "Invalid tweet id." });
    }

    const tweetToUpdate = await Tweet.findOneAndUpdate(
      { authorId, _id: tweetId },
      { updated_at: Date.now(), text },
      { new: true },
      (err, doc) => {
        if (err) return next(err);
      }
    );

    if (!tweetToUpdate) {
      return res
        .status(404)
        .json({ message: "No tweet found. Update failed." });
    }

    const updatedTweetResponse = {
      created_at: tweetToUpdate.created_at,
      updated_at: tweetToUpdate.updated_at,
      updated_at: tweetId,
      text: filter.clean(tweetToUpdate.text),
    };

    res.status(200).json(updatedTweetResponse);
  } catch (error) {
    console.log(error);
    return next(error);
  }
};

// Delete tweet
const deleteTweet = async (req, res, next) => {
  const authorId = req.user._id;
  const tweetId = req.query.tweetId;

  try {
    if (!mongoose.isValidObjectId(tweetId)) {
      return res.status(400).json({ message: "Invalid query params." });
    }

    const tweetToDelete = await Tweet.findOne({ _id: tweetId, authorId });

    if (!tweetToDelete) {
      return res.status(404).json({
        message: "You are not the author or no tweet found to delete.",
      });
    }

    tweetToDelete.deleteOne();

    return res.status(204).send();
  } catch (error) {
    console.log(error);
    return next(error);
  }
};

module.exports = {
  lookupTweets,
  showTweet,
  createTweet,
  updateTweet,
  deleteTweet,
};

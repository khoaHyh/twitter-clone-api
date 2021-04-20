const mongoose = require("mongoose");
const Tweet = require("../models/tweet");
const Filter = require("bad-words");
const filter = new Filter();

const lookupTweets = async (req, res, next) => {
  try {
    // Retrieve all tweets in database and sort in reverse chronological order
    const allTweets = await Tweet.find().sort({ created_timestamp: -1 });

    if (allTweets.length < 1) {
      return res.status(404).json({ message: "No tweets found." });
    }

    res.status(200).json(allTweets);
  } catch (error) {
    console.log(error);
    return next(err);
  }
};

const showTweet = async (req, res, next) => {
  const tweetId = req.params.id;

  try {
    const validObjectId = mongoose.isValidObjectId(tweetId);

    if (!validObjectId || !tweetId) {
      return res.status(400).json({ message: "Invalid tweet id." });
    }

    const singleTweet = await Tweet.findById(tweetId);

    if (!singleTweet) {
      return res.status(404).json({ message: "Tweet not found." });
    }

    const {
      _id,
      authorId,
      created_timestamp,
      updated_at,
      text,
      likes,
      retweet,
      retweet_count,
    } = singleTweet;

    res.status(200).json({
      id: _id,
      authorId,
      created_timestamp,
      updated_at,
      text,
      likes,
      retweet,
      retweet_count,
    });
  } catch (error) {
    console.log(error);
    return next(error);
  }
};

const createTweet = async (req, res, next) => {
  const userId = req.user._id;
  let { text } = req.body;

  try {
    // Check for empty text and if it exceeds length
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

const updateTweet = async (req, res, next) => {
  const authorId = req.user._id;
  let { text, tweetId } = req.body;

  try {
    if (!text || text.trim() === "" || text.length >= 140) {
      return res.status(422).json({
        message:
          "Text is required and cannot be or exceed 140 characters in length.",
      });
    }

    const validObjectId = mongoose.isValidObjectId(tweetId);

    // Check for invalid tweet ids
    // Check for !tweetId because null is a valid ObjectId
    if (!validObjectId || !tweetId) {
      return res.status(400).json({ message: "Invalid tweet id." });
    }

    // Find document and update text and updated_at
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

    const { created_at, updated_at } = tweetToUpdate;

    const updatedTweetResponse = {
      created_at,
      updated_at,
      updated_at: tweetId,
      text: filter.clean(tweetToUpdate.text),
    };

    res.status(200).json(updatedTweetResponse);
  } catch (error) {
    console.log(error);
    return next(error);
  }
};

const deleteTweet = async (req, res, next) => {
  const authorId = req.user._id;
  const tweetId = req.query.tweetId;

  try {
    const validObjectId = mongoose.isValidObjectId(tweetId);

    // Check for invalid tweet ids
    // Check for !tweetId because null is a valid ObjectId
    if (!validObjectId || !tweetId) {
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

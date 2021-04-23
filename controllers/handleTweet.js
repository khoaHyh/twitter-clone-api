const mongoose = require("mongoose");
const Tweet = require("../models/tweet");
const User = require("../models/user");
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
      thread,
    } = singleTweet;

    console.log(thread);

    res.status(200).json({
      id: _id,
      authorId,
      created_timestamp,
      updated_at,
      text,
      likes,
      retweet,
      retweet_count,
      thread,
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
    if (!text || text.trim() === "" || text.length > 140) {
      return res.status(422).json({
        message: "Text is required and cannot exceed 140 characters in length.",
      });
    }

    const newTweet = await Tweet.create({ authorId: userId, text });

    if (!newTweet) {
      return res
        .status(500)
        .json({ message: "Something went wrong while creating a tweet." });
    }

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

const listRetweets = async (req, res, next) => {
  const { user } = req;

  try {
    // If liked tweets cannot be found for the user, return 404
    if (user.retweets.length < 1) {
      return res.status(404).json({ message: "No tweets found." });
    }

    res.status(200).json(user.retweets);
  } catch (error) {
    console.log(error);
    return next(err);
  }
};

const updateTweet = async (req, res, next) => {
  const authorId = req.user._id;
  let { text, tweetId } = req.body;

  try {
    if (!text || text.trim() === "" || text.length > 140) {
      return res.status(422).json({
        message: "Text is required and cannot exceed 140 characters in length.",
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
  let tweetRepliedTo;

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
    } else if (tweetToDelete.reply_to) {
      // If this tweet was a reply in a thread, remove this tweet from the thread array of
      // the tweet replied to
      tweetRepliedTo = await Tweet.findById(tweetToDelete.reply_to);
      tweetRepliedTo.thread.id(tweetToDelete.reply_to).remove();
      await tweetRepliedTo.save();
    }

    tweetToDelete.deleteOne();

    return res.status(204).send();
  } catch (error) {
    console.log(error);
    return next(error);
  }
};

const retweet = async (req, res, next) => {
  const tweetId = req.params.id;
  const { user } = req;

  const didUserRetweetAlready = user.retweets.id(tweetId);

  // Don't allow user to retweet a tweet they already retweeted
  if (didUserRetweetAlready) {
    return res
      .status(400)
      .json({ message: "User already retweeted this tweet." });
  }

  try {
    // Increment the retweet count for the tweet and return the new document
    const retweetedTweet = await Tweet.findByIdAndUpdate(
      tweetId,
      { $inc: { retweet_count: 1 } },
      { new: true }
    );

    if (!retweetedTweet) {
      return res.status(404).json({ message: "No tweet found to retweet" });
    }

    // Push tweet onto user's retweeted tweets array
    user.retweets.push({ _id: tweetId });
    await user.save();

    res.status(200).json(retweetedTweet);
  } catch (error) {
    console.log(error);
    return next(error);
  }
};

const unretweet = async (req, res, next) => {
  const tweetId = req.params.id;
  const { user } = req;

  const didUserRetweetAlready = user.retweets.id(tweetId);

  // Don't allow user to unretweet a tweet they never retweeted
  if (!didUserRetweetAlready) {
    return res
      .status(400)
      .json({ message: "User hasn't retweeted this tweet." });
  }

  try {
    // Decrement the retweet count for the tweet and return the new document
    const retweetedTweet = await Tweet.findByIdAndUpdate(
      tweetId,
      { $inc: { retweet_count: -1 } },
      { new: true }
    );

    if (!retweetedTweet) {
      return res.status(404).json({ message: "No tweet found to retweet" });
    }

    // Remove tweet from user's retweeted tweets array
    user.retweets.id(tweetId).remove();
    await user.save();

    res.status(200).json(retweetedTweet);
  } catch (error) {
    console.log(error);
    return next(error);
  }
};

const replyToTweet = async (req, res, next) => {
  const tweetId = req.query.id;
  const userId = req.user._id;
  let { text } = req.body;

  try {
    const tweetToReplyTo = await Tweet.findById(tweetId);

    // Check if the tweet being replied to exists
    if (!tweetToReplyTo) {
      return res
        .status(404)
        .json({ message: "The tweet being replied to does not exist." });
    }

    // Check for empty text and if it exceeds length
    if (!text || text.trim() === "" || text.length > 140) {
      return res.status(422).json({
        message: "Text is required and cannot exceed 140 characters in length.",
      });
    }

    const newTweet = await Tweet.create({
      authorId: userId,
      text,
      reply_to: tweetId,
    });

    if (!newTweet) {
      return res
        .status(500)
        .json({ message: "Something went wrong while creating a tweet." });
    }

    // Construct response object and filter out profanity in tweet content
    const newTweetResponse = {
      tweet_replied_to: tweetId,
      created_at: newTweet.created_at,
      id: newTweet._id,
      text: filter.clean(newTweet.text),
    };

    // Push the new tweet into the array of the tweet being replied to.
    // This creates a thread
    tweetToReplyTo.thread.push({ _id: newTweet._id });
    await tweetToReplyTo.save();

    res.status(201).json(newTweetResponse);
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
  listRetweets,
  retweet,
  unretweet,
  replyToTweet,
};

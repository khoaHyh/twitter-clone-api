const mongoose = require("mongoose");
const User = require("../models/user");
const Tweet = require("../models/tweet");

const listLikes = async (req, res, next) => {
  const { user } = req;

  try {
    // If liked tweets cannot be found for the user, return 404
    if (user.likes.length < 1) {
      return res.status(404).json({ message: "No tweets found." });
    }

    res.status(200).json(user.likes);
  } catch (error) {
    console.log(error);
    return next(err);
  }
};

const createLike = async (req, res, next) => {
  const tweetId = req.query.tweetId;
  const { user } = req;

  const didUserLikeTweet = user.likes.id(tweetId);

  // Don't allow user to like tweet again if they already liked it
  if (didUserLikeTweet) {
    return res.status(400).json({
      message: "User already liked tweet. Only dislike is available.",
    });
  }

  try {
    // Increment the likes count for the tweet and return the new document
    const likedTweet = await Tweet.findByIdAndUpdate(
      tweetId,
      { $inc: { likes: 1 } },
      { new: true }
    );

    if (!likedTweet) {
      return res.status(404).json({ message: "No tweet found to like." });
    }

    // Push tweet onto user's liked tweets array
    user.likes.push({ _id: tweetId });
    await user.save();

    res.status(200).json(likedTweet);
  } catch (error) {
    console.log(error);
    return next(error);
  }
};

const deleteLike = async (req, res, next) => {
  const tweetId = req.query.tweetId;
  const { user } = req;

  const didUserLikeTweet = user.likes.id(tweetId);

  // Don't allow user to dislike tweet if they never liked it beforehand
  if (!didUserLikeTweet) {
    return res.status(400).json({
      message: "User hasn't liked tweet. Only like is available.",
    });
  }

  try {
    // Decrement the likes count on the tweet if it exists and return new document
    const dislikedTweet = await Tweet.findByIdAndUpdate(
      tweetId,
      { $inc: { likes: -1 } },
      { new: true }
    );

    if (!dislikedTweet) {
      return res.status(404).json({ message: "No tweet found to dislike." });
    }

    // Remove tweet from user's liked tweet array
    user.likes.id(tweetId).remove();
    await user.save();

    res.status(200).json(dislikedTweet);
  } catch (error) {
    console.log(error);
    return next(error);
  }
};

module.exports = { listLikes, createLike, deleteLike };

const mongoose = require("mongoose");
//const User = require("../models/user");
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

  const likedTweet = await Tweet.findByIdAndUpdate(
    tweetId,
    { $inc: { likes: 1 } },
    { new: true },
    (err, doc) => {
      if (err) return next(err);
      console.log("doc:", doc);
    }
  );

  if (!likedTweet) {
    return res.status(404).json({ message: "No tweet found to like." });
  }

  user.likes.push({ tweetId });
  await user.save();

  res.status(200).json(likedTweet);
};

module.exports = { listLikes, createLike };

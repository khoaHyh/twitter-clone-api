const mongoose = require("mongoose");
const User = require("../models/user");
const Tweet = require("../models/tweet");

const listLikes = async (req, res, next) => {
  const { user } = req;

  try {
    // Retrieve all liked tweet ids from User account
    user.likes;
    //      .sort({
    //  created_timestamp: -1,
    //});

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
  console.log("Create like");
};

module.exports = { listLikes, createLike };

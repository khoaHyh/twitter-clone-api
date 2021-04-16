const User = require("../models/user");
const DirectMessage = require("../models/directMessage");
const mongoose = require("mongoose");

// Publishes a new mesage_create event which sends a message to a specificied user
const createMessage = async (req, res, next) => {
  let { id, recipient, text } = req.body;
  let recipientId;
  const senderId = req.user._id;
  const timestamp = Date.now();

  const recipientData = await User.findOne({ username: recipient });

  // Return error message if recipient does not exist
  if (!recipientData) {
    return res.status(404).json({ message: "Recipient not found." });
  }

  recipientId = recipientData._id;

  // Return error message if text field is empty
  if (text.trim() === "") {
    return res.status(400).json({ message: "Text field empty." });
  }

  // Key-value data for conversation array in document
  const messageData = {
    created_timestamp: timestamp,
    text,
  };

  // Flag to let client know if the DM existed
  let idExisted = false;
  let newDm;

  // Validate ids we receive from request (note: 'null' is a valid ObjectId for mongodb schemas)
  const validObjectId = mongoose.isValidObjectId(id);

  // If the id submitted is valid attempt find the document associated
  if (validObjectId) {
    // Store the result of the document search in a variable
    newDm = await DirectMessage.findOne({ _id: id, recipientId, senderId });
    console.log("newDm exists:", newDm);
  }

  // If the id is invalid or the document could not be found, create a new DM
  if (!validObjectId || !newDm) {
    newDm = await DirectMessage.create({
      recipientId,
      senderId,
      conversation: messageData,
    });
    id = newDm._id;
    console.log("create new dm id");
  } else {
    idExisted = true;
    // Push new message into existing DM
    newDm.conversation.push(messageData);

    // Save updates to document
    newDm.save((err, data) => {
      if (err) return next(err);
      console.log("data saved!");
    });
  }

  console.log("newDm:", newDm);

  console.log("message created");
  res.status(201).json({
    type: "message_create",
    valid_object_id: validObjectId, // let client know if id sent was valid
    dm_existed: idExisted, // lets client know if the dm existed previously
    id: id,
    created_timestamp: timestamp,
    message_create: {
      recipient_name: recipientData.username,
      recipient_id: recipientId,
      username: req.user.username,
      sender_id: senderId,
      // In the future we may return attachments, user_mentions, etc inside message_data
      message_data: {
        text,
      },
    },
  });
};

// Gets all direct messages (both sent and received) between two users
const getAllMessages = async (req, res, next) => {
  const senderId = req.user._id;

  // If the id submitted is valid attempt find the document associated
  // Store the result of the document search in a variable
  let allMessages = await DirectMessage.find({
    senderId,
  });

  if (!allMessages) {
    return res
      .status(404)
      .json({ message: "No message history with any recipients." });
  }

  res.status(200).json({
    events: allMessages,
  });
};

module.exports = { createMessage, getAllMessages };

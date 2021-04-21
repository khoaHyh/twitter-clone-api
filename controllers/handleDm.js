const User = require("../models/user");
const DirectMessage = require("../models/directMessage");
const mongoose = require("mongoose");

const createMessage = async (req, res, next) => {
  let { id, recipient, text } = req.body;
  let recipientId;
  const senderId = req.user._id;
  const timestamp = Date.now();

  try {
    const recipientData = await User.findOne({ username: recipient });

    if (!recipientData) {
      return res.status(404).json({ message: "Recipient not found." });
    }

    recipientId = recipientData._id;

    // Don't allow empty messages or messages that exceed 1000 characters
    if (text.trim() === "" || text.length > 1000) {
      return res.status(422).json({
        message:
          "Text is required and cannot exceed 1000 characters in length.",
      });
    }

    // Key-value data for conversation array in document
    const messageData = {
      created_timestamp: timestamp,
      text,
    };

    let idExisted = false; // Flag to let client know if the DM existed
    let newDm;

    // Validate ids we receive from request (note: 'null' is a valid ObjectId for mongodb schemas)
    const validObjectId = mongoose.isValidObjectId(id);

    if (validObjectId) {
      newDm = await DirectMessage.findOne({ _id: id, recipientId, senderId });
    }

    // If the id is invalid or the document could not be found, create a new DM
    if (!validObjectId || !newDm) {
      newDm = await DirectMessage.create({
        recipientId,
        senderId,
        conversation: messageData,
      });
      id = newDm._id;
    } else {
      idExisted = true;
      newDm.conversation.push(messageData); // push message into conversation array

      await newDm.save();
    }
    let totalMessages = newDm.conversation.length - 1;
    let messageId = newDm.conversation[totalMessages]._id;

    res.status(201).json({
      type: "message_create",
      valid_object_id: validObjectId, // let client know if id sent was valid
      dm_existed: idExisted, // lets client know if the dm existed previously
      id,
      created_timestamp: timestamp,
      message_create: {
        recipient_name: recipientData.username,
        recipient_id: recipientId,
        username: req.user.username,
        sender_id: senderId,
        // In the future we may return attachments, user_mentions, etc inside message_data
        message_data: {
          message_id: messageId,
          text,
        },
      },
    });
  } catch (error) {
    console.log(error);
    return next(error);
  }
};

// Retrieves all dms associated with the user
const getAllMessages = async (req, res, next) => {
  const senderId = req.user._id;

  try {
    // Find all direct messages for this user sorted in reverse-chronological order
    let allMessages = await DirectMessage.find({
      senderId,
    }).sort("-conversation.created_timestamp");

    if (!allMessages.length) {
      return res
        .status(404)
        .json({ message: "No message history with any recipients." });
    }

    res.status(200).json({
      events: allMessages,
    });
  } catch (error) {
    console.log(error);
    return next(error);
  }
};

// Returns a single direct message event by given conversation id and message id
const showSingleMessage = async (req, res, next) => {
  const senderId = req.user._id;
  const conversationId = req.query.id;
  const messageId = req.query.messageId;

  try {
    if (
      !mongoose.isValidObjectId(messageId) ||
      !mongoose.isValidObjectId(conversationId)
    ) {
      return res.status(400).json({ message: "Invalid query params." });
    }

    let message;

    // Find the specific message by using document id and subdocument id
    let document = await DirectMessage.findOne(
      // We query by the authenticated user too to make sure that this message is associated with the user
      { senderId, _id: conversationId }
    );

    if (!document) {
      return res
        .status(404)
        .json({ message: "Direct message stream doesn't exist." });
    }

    message = document.conversation.id(messageId);

    if (!message) {
      return res.status(404).json({ message: "Message not found." });
    }

    res.status(200).json({
      event: {
        id: message._id,
        created_timestamp: message.created_timestamp,
        type: "message_create",
        message_create: {
          sender_id: senderId,
          recipient_id: document.recipientId,
          text: message.text,
        },
      },
    });
  } catch (error) {
    console.log(error);
    return next(error);
  }
};

const deleteMessage = async (req, res, next) => {
  const senderId = req.user._id;
  const conversationId = req.query.id;
  const messageId = req.query.messageId;

  try {
    // Check if message id or conversation id are valid ObjectIds
    if (
      !mongoose.isValidObjectId(messageId) ||
      !mongoose.isValidObjectId(conversationId)
    ) {
      return res.status(400).json({ message: "Invalid query params." });
    }

    let message;

    // Find the specific message by using document id and subdocument id
    let document = await DirectMessage.findOne(
      // We query by the authenticated user too to make sure that this message is associated with the user
      { senderId, _id: conversationId }
    );

    if (!document) {
      return res
        .status(404)
        .json({ message: "Direct message stream doesn't exist." });
    }

    message = document.conversation.id(messageId);

    if (!message) {
      return res
        .status(404)
        .json({ message: "You are not the author or message not found." });
    }

    // Remove message then save document
    message.remove();
    await document.save();

    return res.status(204).send();
  } catch (error) {
    console.log(error);
    return next(error);
  }
};

module.exports = {
  createMessage,
  getAllMessages,
  showSingleMessage,
  deleteMessage,
};

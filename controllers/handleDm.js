const User = require("../models/user");
const DirectMessage = require("../models/directMessage");
const mongoose = require("mongoose");

// Publishes a new mesage_create event which sends a message to a specificied user
const createMessage = async (req, res, next) => {
  let { id, recipient, text } = req.body;
  let recipientId;
  const senderId = req.user._id;
  const timestamp = Date.now();

  try {
    const recipientData = await User.findOne({ username: recipient });

    // Return error message if recipient does not exist
    if (!recipientData) {
      return res.status(404).json({ message: "Recipient not found." });
    }

    recipientId = recipientData._id;

    // Return error message if text field is empty
    if (text.trim() === "") {
      return res.status(422).json({ message: "Text field empty." });
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
      // Push new message into existing DM
      newDm.conversation.push(messageData);

      // Save updates to document
      await newDm.save();
    }
    // Gets the total number of messages within this direct message history
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

// Gets all direct messages (both sent and received) between two users
const getAllMessages = async (req, res, next) => {
  const senderId = req.user._id;

  try {
    // Find all direct messages for this user sorted in reverse-chronological order
    let allMessages = await DirectMessage.find({
      senderId,
    }).sort("-conversation.created_timestamp");

    // Return an error message if there are no messages associated with the user
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

    // If no document was found then the conversation doesn't exist
    if (!document) {
      return res
        .status(404)
        .json({ message: "Direct message stream doesn't exist." });
    }

    // Store the single message id in a variable
    message = document.conversation.id(messageId);

    // If message doesn't exist return 404
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

// Deletes a direct message from a conversation
const deleteMessage = async (req, res, next) => {
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

    // Store the single message id in a variable
    message = document.conversation.id(messageId);

    // If message doesn't exist return 404
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

const User = require("../models/user");
const DirectMessage = require("../models/directMessage");

// Publishes a new mesage_create event which sends a message to a specificied user
const createMessage = async (req, res, next) => {
  let { id, recipient, text } = req.body;
  const senderId = req.user._id;
  const timestamp = Date.now();

  // Find recipient id
  let recipientData = await User.findOne(
    { username: recipient },
    (err, data) => {
      if (err) return next(err);
      recipientId = data._id;
      recipientName = data.username;
    }
  );

  // Return error message if recipient does not exist
  if (!recipientData)
    return res.status(404).json({ message: "Recipient not found." });

  // update properties for this specific mongoose update
  const options = {
    new: true,
    upsert: true,
    safe: true,
  };

  const dmData = {
    conversation: {
      recipientId: recipientData._id,
      senderId,
      created_timestamp: timestamp,
      text,
    },
  };

  // Update the conversation array if there is an exiting DM between the two accounts
  let newDm = await DirectMessage.findByIdAndUpdate(
    id,
    {
      $push: dmData,
    },
    options,
    (err, data) => {
      if (err) return next(err);
    }
  );

  // If there is no existing DM between the two accounts, create a new document
  if (!newDm) {
    newDm = DirectMessage.create(dmData, (err, data) => {
      if (err) return next(err);
      console.log("create new dm id");
      id = data._id;
    });
  }

  console.log(newDm);

  console.log("message created");
  res.status(200).json({
    type: "message_create",
    id: id,
    created_timestamp: timestamp,
    message_create: {
      recipient_name: recipientData.username,
      recipient_id: recipientData._id,
      username: req.user.username,
      sender_id: senderId,
      message_data: {
        text,
      },
    },
  });
};

module.exports = { createMessage };

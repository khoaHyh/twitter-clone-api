const User = require("../models/user");
const DirectMessage = require("../models/directMessage");

// Publishes a new mesage_create event which sends a message to a specificied user
const createMessage = async (req, res, next) => {
  let { id, recipient, text } = req.body;
  const senderId = req.user._id;
  const timestamp = Date.now();

  let recipientId;
  let recipientName;

  // Find recipient id
  await User.findOne({ username: recipient }, (err, data) => {
    if (err) return next(err);
    recipientId = data._id;
    recipientName = data.username;
  });

  // update properties for this specific mongoose update
  const update = {
    new: true,
    upsert: true,
    safe: true,
  };

  // Update the conversation array if there is an exiting DM between the two accounts
  let newDm = await DirectMessage.findByIdAndUpdate(
    id,
    {
      $push: { conversation: { recipient, sender, text } },
    },
    update,
    (err, data) => {
      if (err) return next(err);
    }
  );

  // If there is no existing DM between the two accounts, create a new document
  if (!newDm) {
    DirectMessage.create(
      { conversation: { recipient, sender, text } },
      (err, data) => {
        if (err) return next(err);
        console.log("create new dm id");
        id = data._id;
      }
    );
  }

  console.log("message created");
  res.status(200).json({
    type: "message_create",
    id: "unique document id (_id of document)",
    created_timestamp: timestamp,
    message_create: {
      recipient_name: recipientName,
      recipient_id: recipientId,
      username: req.user.username,
      sender_id: senderId,
      text: text,
    },
  });
};

module.exports = { createMessage };

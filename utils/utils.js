const ConversationData = require("./models/conversationData");

// Middleware to check if a user is authenticated
const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  res.status(401).json({ message: "Please log in to access this route." });
};

// success callback function for socket.io
const onAuthorizeSuccess = (data, accept) => {
  console.log("successful connection to socket.io");
  accept(null, true);
};

// fail callback function for socket.io
const onAuthorizeFail = (data, message, error, accept) => {
  if (error) throw new Error(message);
  console.log("failed connection to socket.io:", message);
  accept(null, false);
};

// send message handler event listener 'send-message' with socket.io
const sendMessage = async ({ chatId, sender, message, timestamp }) => {
  const update = {
    new: true,
    upsert: true,
    safe: true,
  };

  const chatData = { conversation: { message, timestamp, sender } };

  try {
    // Update conversation history by finding the chatId and updating the document
    let conversation = await ConversationData.findByIdAndUpdate(
      chatId,
      {
        $push: chatData,
      },
      update,
      (err, data) => {
        if (err) {
          console.log(err);
          return res.status(500).json(err);
        }
      }
    );

    // If this is a new conversation, insert a new document and add the conversation information
    if (!conversation) {
      ConversationData.create(chatData, (err, data) => {
        if (err) console.log(err);
      });
    }

    // Emit a 'receive-message' event for the client containing conversation data
    socket.emit("receive-message", chatData);
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  ensureAuthenticated,
  onAuthorizeSuccess,
  onAuthorizeFail,
  sendMessage,
};

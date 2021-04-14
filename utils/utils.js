const ChatData = require("../models/chatData");

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
const sendMessage = ({ chatId, sender, message, timestamp }) => {
  const update = {
    new: true,
    upsert: true,
    safe: true,
  };

  // Update chat history by finding the chatId and updating the document
  ChatData.findByIdAndUpdate(
    chatId,
    {
      $push: { chat: { message, timestamp, sender } },
    },
    update,
    (err, data) => {
      if (err) {
        console.log(err);
        return res.status(500).json(err);
      }
      // Emit a 'receive-message' event for the client containing chat data
      socket.emit("receive-message", data.chat);
    }
  );

  //if (!conversation) {
  //  ChatData.create({ chat: { message, timestamp, sender } }, (err, data) => {
  //    if (err) console.log(err);
  //  });
  //}
};

module.exports = {
  ensureAuthenticated,
  onAuthorizeSuccess,
  onAuthorizeFail,
  sendMessage,
};

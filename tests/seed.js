const faker = require("faker");

// Generate a random username and password to user for test cases
const newUser = {
  username: faker.internet.userName(),
  password: faker.internet.password(),
};
// Use existing account credentials for test cases
const existingUser = {
  username: "test3",
  password: "test123",
};

// Second existing account to send DMs to
const existingUser2 = {
  username: "anotherUser",
  password: "test123",
};

// Request body for new create message with valid recipient and text
const validRecipientTextMsg = {
  recipient: "anotherUser",
  text: "Valid recipient and text field message.",
};

module.exports = {
  newUser,
  existingUser,
  existingUser2,
  validRecipientTextMsg,
};

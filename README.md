# Twitter-clone-api                                                                         
A backend exposing an API that is similar to Twitter.

## Known issues

  * Unit/Integration tests may hang or not run at all.
      * A current fix is adding `--timeout 10000` to our test script to lengthen timeout
      * It's possible that the connection to our MongoDB database is the problem.
      * It's also possible that async/await syntax is incorrectly being used.
#### `Possible solution to this:`
```javascript
describe("Some route", function () {
    it("should return 200", function(done) {
        asyncMethod()
            .then(() => {
                done();
            });
    });
});
```

## Local development   

#### `Setup`
```shell
$ git clone https://github.com/khoaHyh/twitter-clone-api.git

$ cd twitter-clone-api

$ npm i
```

#### `.env file`
> The method you use to come up with the session secret is up to your preference. You can set up your own MongoDB cluster using MongoAtlas for free.
```shell
SESSION_SECRET=createYourOwnSessionSecret
MONGO_URI='mongodb+srv://<username>:<password>@clusterName.somethingElseHere.mongodb.net/databaseNameHere?retryWrites=true&w=majority'

```
#### `Run server`
```shell
$ npm run dev
```
#### `Test`
```shell
$ npm test
```

## Features
  * Endpoints with Unit/Integration testing
      * User registration using unique username  and password
      * User login (including session maintenance)
      * Chat with other users (direct messages)
      * Create, read, update, and delete tweet
  * Like/unlike a tweet, and list liked tweets
  * Retweet/unretweet a tweet, and list retweeted tweets
  * Twitter 'Threads'

## Tech/framework used
#### Built with:                                                                 
  * MongoDB
  * Express
  * Node.js
  * Mocha
  * Chai
  * Passport.js

## Postman/Insomnia/cURL usage examples
> ObjectId: 6080d7e4272244772c589d0f is used only as an example and may or may not exist in the database.
### Getting all tweets
`GET` `http://localhost:8080/home/tweets/lookup`
##### `cURL`
```shell
$ curl --request GET \
    --url http://localhost:8080/home/tweets/lookup \
      --cookie express.sid=s%253Av9TA4jEHtDtsd1CpJyBZ-jTzH-J7ZWJG.x9dXU8Pt7Bv0zttxVQ6V0xkrCIhLQcjtKhUsKOLbBPc
```

<br />

### Showing a single tweet
`GET` `http://localhost:8080/home/tweets/show/6080d7e4272244772c589d0f`
##### `cURL`
```shell
$ curl --request GET \
    --url http://localhost:8080/home/tweets/show/6080d7e4272244772c589d0f \
      --cookie express.sid=s%253Av9TA4jEHtDtsd1CpJyBZ-jTzH-J7ZWJG.x9dXU8Pt7Bv0zttxVQ6V0xkrCIhLQcjtKhUsKOLbBPc
```

<br />

### Creating a tweet
`POST` `http://localhost:8080/home/tweets/create`
```
## Request body in JSON format
{ "text": "Hello twitter clone!" }
```
##### `cURL`
```shell
$ curl --request POST \
  --url http://localhost:8080/home/tweets/create \
    --header 'Content-Type: application/json' \
      --cookie express.sid=s%253Av9TA4jEHtDtsd1CpJyBZ-jTzH-J7ZWJG.x9dXU8Pt7Bv0zttxVQ6V0xkrCIhLQcjtKhUsKOLbBPc \
        --data '{"text":"Hello twitter clone!"}'
```

<br />

### Updating/Editing a tweet
`PUT` `http://localhost:8080/home/tweets/update`
```
{ "id": "6080d7e4272244772c589d0f", "text": "Update this tweet." }
```
##### `cURL`
```shell
$ curl --request PUT \
  --url http://localhost:8080/home/tweets/update \
    --header 'Content-Type: application/json' \
      --cookie express.sid=s%253Av9TA4jEHtDtsd1CpJyBZ-jTzH-J7ZWJG.x9dXU8Pt7Bv0zttxVQ6V0xkrCIhLQcjtKhUsKOLbBPc \
        --data '{"id": "6080d7e4272244772c589d0f", "text": "Update this tweet."}'
```

<br />

### Deleting a tweet
`DELETE` `http://localhost:8080/home/tweets/delete?tweetId=6080d7e4272244772c589d0f`
##### `cURL`
```shell
$ curl --request DELETE \
  --url 'http://localhost:8080/home/tweets/delete?tweetId=6080d7e4272244772c589d0f' \
    --header 'Authorization: Basic Og==' \
      --cookie express.sid=s%253Av9TA4jEHtDtsd1CpJyBZ-jTzH-J7ZWJG.x9dXU8Pt7Bv0zttxVQ6V0xkrCIhLQcjtKhUsKOLbBPc
```

<br />

## Real-time queries
The current version of the API does not have message queues/real-time queries but in the future it may implement these features through the use of Socket.IO.

```javascript
// Example socket io code in server.js

// Parse and decode the cookie that contains the passport session
// then deserialize to obtain user object
io.use(
  passportSocketIo.authorize({
    cookieParser: cookieParser,
    key: "express.sid",
    secret: process.env.SESSION_SECRET,
    store: sessionStore,
    success: onAuthorize.success,
    fail: onAuthorize.fail,
  })
);

io.on('connection', socket => {
  const user = socket.request.user.username;

  // Listen for user disconnect event
  socket.on('disconnect', () => {
    io.emit('message', `${user} has left the chat.`);
  });

  // Listen for sent message
  socket.on('send-message', async ({ id, text, recipient }) => {
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

      let responseObj = {
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
      }

      // Emit 'receive-message' event with message data
      socket.emit('receive-message', responseObj);
    } catch (error) {
      console.log(error);
      return next(error);
    }
  });
});
```

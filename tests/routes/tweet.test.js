const chai = require("chai");
const { expect } = chai;
const { app } = require("../../server");
const chaiHttp = require("chai-http");
const seed = require("../seed");
const Tweet = require("../../models/tweet");
const User = require("../../models/user");

chai.use(chaiHttp);

describe("Tweets route", function () {
  const agent = chai.request.agent(app);
  const oneFourtyString =
    "fj32qo8fjfsdlkjgj982h4qgkfsahkjnvka9842qrsjdglkja98234fsjgkjlhgkj29qjgsahgljkh2ifjl2rfoifjldsgjoiru2oihffhgoi24foigejoijfoijr32jfoidhsafhds2";
  const invalidTextField =
    "Text is required and cannot be or exceed 140 characters in length.";
  let user, anotherUser;

  // Delete all documents for the Tweet model and authenticate one user
  before(async function () {
    try {
      // Delete all tweets and login our existing user
      await Tweet.deleteMany({});
      await agent.post("/login").send(seed.existingUser);

      // Search for user's information for their id and store in variable to use later
      user = await User.findOne({ username: seed.existingUser.username });
      anotherUser = await User.findOne({ username: seed.anotherUser.username });
    } catch (error) {
      console.log(error);
    }
  });

  describe("POST /home/tweets/create", function () {
    it("should return 201 and response body if tweet is successfully created", async function () {
      try {
        const createTweetRes = await agent
          .post("/home/tweets/create")
          .send({ text: "I am hungry!" });
        expect(createTweetRes.status).to.equal(201);
        expect(createTweetRes.body).to.have.property("text");
      } catch (error) {
        console.log(error);
      }
    });

    it("should return 422 if text field is empty", async function () {
      try {
        const emptyTextRes = await agent.post("/home/tweets/create").send({
          text: "",
        });
        expect(emptyTextRes.status).to.equal(422);
        expect(emptyTextRes.body)
          .to.have.property("message")
          .equal(invalidTextField);
      } catch (error) {
        console.log(error);
      }
    });
  });

  it("should return 422 if text >= 140 characters in length", async function () {
    try {
      const tooLongRes = await agent.post("/home/tweets/create").send({
        text: oneFourtyString,
      });
      expect(tooLongRes.status).to.equal(422);
      expect(tooLongRes.body)
        .to.have.property("message")
        .equal(invalidTextField);
    } catch (error) {
      console.log(error);
    }
  });

  describe("GET /home/tweets/lookup", function () {
    it("should return 200 and an array if there are tweets to retrieve from database", async function () {
      try {
        const successLookupRes = await agent.get("/home/tweets/lookup");
        expect(successLookupRes.status).to.equal(200);
        expect(successLookupRes.body).to.be.an("array");
      } catch (error) {
        console.log(error);
      }
    });

    it("should return 404 and a message if there are no tweets to retrieve from database", async function () {
      try {
        await Tweet.deleteMany({});
        const failLookupRes = await agent.get("/home/tweets/lookup");
        expect(failLookupRes.status).to.equal(404);
        expect(failLookupRes.body)
          .to.have.property("message")
          .equal("No tweets found.");
      } catch (error) {
        console.log(error);
      }
    });
  });

  describe("GET /home/tweets/show/:id", function () {
    it("should return 200 if tweet is successfully retrieved", async function () {
      try {
        const newTweet = await Tweet.create({
          authorId: user._id,
          text: "Retrieve this tweet.",
        });

        const successShowTweetRes = await agent.get(
          `/home/tweets/show/${newTweet._id}`
        );
        expect(successShowTweetRes.status).to.equal(200);
      } catch (error) {
        console.log(error);
      }
    });

    it("should return 404 if tweet cannot be found ", async function () {
      try {
        const notFoundShowRes = await agent.get(
          `/home/tweets/show/607c80f55e305e14254f3b85`
        );
        expect(notFoundShowRes.status).to.equal(404);
        expect(notFoundShowRes.body)
          .to.have.property("message")
          .equal("Tweet not found.");
      } catch (error) {
        console.log(error);
      }
    });

    it("should return 400 if tweet id is invalid", async function () {
      try {
        const invalidShowRes = await agent.get(
          `/home/tweets/show/607c80f55e305e14`
        );
        expect(invalidShowRes.status).to.equal(400);
        expect(invalidShowRes.body)
          .to.have.property("message")
          .equal("Invalid tweet id.");
      } catch (error) {
        console.log(error);
      }
    });
  });

  describe("PUT /home/tweets/update", function () {
    it("should return 200 if tweet is successfully updated", async function () {
      try {
        const text = "Just updated this tweet!";

        const tweetToUpdate = await Tweet.create({
          authorId: user._id,
          text: "Update this tweet.",
        });

        const successUpdateTweet = await agent.put("/home/tweets/update").send({
          tweetId: tweetToUpdate._id,
          text,
        });
        expect(successUpdateTweet.status).to.equal(200);
        expect(successUpdateTweet.body).to.have.property("text").equal(text);
      } catch (error) {
        console.log(error);
      }
    });

    it("should return 422 if text >= 140 characters in length", async function () {
      try {
        const tooLongUpdateRes = await agent.put("/home/tweets/update").send({
          tweetId: user._id,
          text: oneFourtyString,
        });
        expect(tooLongUpdateRes.status).to.equal(422);
        expect(tooLongUpdateRes.body)
          .to.have.property("message")
          .equal(invalidTextField);
      } catch (error) {
        console.log(error);
      }
    });

    it("should return 422 if text field is empty", async function () {
      try {
        const emptyTestUpdateRes = await agent.put("/home/tweets/update").send({
          tweetId: user._id,
          text: "",
        });
        expect(emptyTestUpdateRes.status).to.equal(422);
        expect(emptyTestUpdateRes.body)
          .to.have.property("message")
          .equal(invalidTextField);
      } catch (error) {
        console.log(error);
      }
    });

    it("should return 400 if tweet id is invalid", async function () {
      try {
        const invalidIdUpdateRes = await agent.put("/home/tweets/update").send({
          tweetId: "invalidtweetid",
          text: "Perfectly fine tweet.",
        });
        expect(invalidIdUpdateRes.status).to.equal(400);
        expect(invalidIdUpdateRes.body)
          .to.have.property("message")
          .equal("Invalid tweet id.");
      } catch (error) {
        console.log(error);
      }
    });

    it("should return 404 if tweet could not be found to update", async function () {
      try {
        const notFoundUpdateRes = await agent.put("/home/tweets/update").send({
          tweetId: user._id,
          text: "Perfectly fine tweet.",
        });
        expect(notFoundUpdateRes.status).to.equal(404);
        expect(notFoundUpdateRes.body)
          .to.have.property("message")
          .equal("No tweet found. Update failed.");
      } catch (error) {
        console.log(error);
      }
    });
  });

  describe("DELETE /home/tweets/destroy", function () {
    it("should return 204 if tweet is successfully deleted", async function () {
      try {
        const tweetToDelete = await Tweet.create({
          authorId: user._id,
          text: "Delete this tweet.",
        });

        const successDeleteRes = await agent.delete(
          `/home/tweets/destroy?tweetId=${tweetToDelete._id}`
        );
        expect(successDeleteRes.status).to.equal(204);

        // Check if the tweet was deleted
        const checkTweetDeletedRes = await Tweet.findById(tweetToDelete._id);
        expect(checkTweetDeletedRes).equal(null);
      } catch (error) {
        console.log(error);
      }
    });

    it("should return 400 if tweet id is invalid", async function () {
      try {
        const invalidDeleteRes = await agent.get(
          `/home/tweets/show/607c80f55e305e14`
        );
        expect(invalidDeleteRes.status).to.equal(400);
        expect(invalidDeleteRes.body)
          .to.have.property("message")
          .equal("Invalid tweet id.");
      } catch (error) {
        console.log(error);
      }
    });

    it("should return 404 if the user is not the author of the tweet to delete", async function () {
      try {
        const tweetToDelete = await Tweet.create({
          authorId: anotherUser._id,
          text: "Delete this tweet.",
        });

        const notAuthorDeleteRes = await agent.delete(
          `/home/tweets/destroy?tweetId=${tweetToDelete._id}`
        );
        expect(notAuthorDeleteRes.status).to.equal(404);
      } catch (error) {
        console.log(error);
      }
    });

    it("should return 404 if there is no tweet to delete", async function () {
      try {
        const noTweetDeleteRes = await agent.delete(
          `/home/tweets/destroy?=${user._id}`
        );
        expect(noTweetDeleteRes.status).to.equal(404);
      } catch (error) {
        console.log(error);
      }
    });
  });
});

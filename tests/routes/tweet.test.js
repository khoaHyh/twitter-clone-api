const chai = require("chai");
const { expect } = chai;
const { app } = require("../../server");
const chaiHttp = require("chai-http");
const seed = require("../seed");
const Tweet = require("../../models/tweet");

chai.use(chaiHttp);

describe("Tweets route", function () {
  const agent = chai.request.agent(app);

  // Delete all documents for the Tweet model and authenticate one user
  before(async function () {
    try {
      await Tweet.deleteMany({});
      await agent.post("/login").send(seed.ghostUser);
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

        //// Save the newly created message's ids to user later in the showMessage test
        //existingDm = recipientTextRes.body.id;
        //console.log("existingDm:", existingDm);
        //existingMessage =
        //  recipientTextRes.body.message_create.message_data.message_id;
        //console.log("existingMessage:", existingMessage);
      } catch (error) {
        console.log(error);
      }
    });

    it("should return 422 if text field is empty", async function () {
      try {
        const invalidTweetRes = await agent.post("/home/tweets/create").send({
          text: "",
        });
        expect(invalidTweetRes.status).to.equal(422);
        expect(invalidTweetRes.body)
          .to.have.property("message")
          .equal(
            "Text is required and cannot be or exceed 140 characters in length."
          );
      } catch (error) {
        console.log(error);
      }
    });
  });

  it("should return 422 if text >= 140 characters in length", async function () {
    try {
      const invalidTweetRes = await agent.post("/home/tweets/create").send({
        text:
          "fj32qo8fjfsdlkjgj982h4qgkfsahkjnvka9842qrsjdglkja98234fsjgkjlhgkj29qjgsahgljkh2ifjl2rfoifjldsgjoiru2oihffhgoi24foigejoijfoijr32jfoidhsafhds2",
      });
      expect(invalidTweetRes.status).to.equal(422);
      expect(invalidTweetRes.body)
        .to.have.property("message")
        .equal(
          "Text is required and cannot be or exceed 140 characters in length."
        );
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
          authorId: test3,
          text: "Retrieve this tweet.",
        });
        const successShowTweetRes = await agent.get(
          `/home/tweets/show/${newTweet._id}`
        );
      } catch (error) {
        console.log(error);
      }
    });
  });
});

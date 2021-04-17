const chai = require("chai");
const { expect } = chai;
const { app } = require("../../server");
const chaiHttp = require("chai-http");
const seed = require("../seed");
const DirectMessage = require("../../models/directMessage");

chai.use(chaiHttp);

describe("Direct message route", function () {
  const agent = chai.request.agent(app);
  const anotherAgent = chai.request.agent(app);
  let existingMessage;

  before(async function () {
    try {
      await DirectMessage.deleteMany({});
      await agent.post("/login").send(seed.existingUser);
      await anotherAgent.post("/login").send(seed.ghostUser);
    } catch (error) {
      console.log(error);
    }
  });

  describe("POST /home/direct_messages/events/new", function () {
    it("should return 201 and response body if a message is created", async function () {
      try {
        const recipientTextRes = await agent
          .post("/home/direct_messages/events/new")
          .send(seed.validRecipientTextMsg);
        expect(recipientTextRes.status).to.equal(201);
        expect(recipientTextRes.body)
          .to.have.property("type")
          .equal("message_create");

        //existingMessage = recipientTextRes.body.
      } catch (error) {
        console.log(error);
      }
    });

    it("should return 404 and a message if recipient doesn't exist", async function () {
      try {
        const invalidRecipientRes = await agent
          .post("/home/direct_messages/events/new")
          .send({
            recipient: "thisUserDoesntExist",
            text: "hello",
          });
        expect(invalidRecipientRes.status).to.equal(404);
        expect(invalidRecipientRes.body)
          .to.have.property("message")
          .equal("Recipient not found.");
      } catch (error) {
        console.log(error);
      }
    });

    it("should return 400 and a message if text field is empty", async function () {
      try {
        const textEmptyRes = await agent
          .post("/home/direct_messages/events/new")
          .send({
            recipient: "anotherUser",
            text: "",
          });
        expect(textEmptyRes.status).to.equal(400);
        expect(textEmptyRes.body)
          .to.have.property("message")
          .equal("Text field empty.");
      } catch (error) {
        console.log(error);
      }
    });
  });

  describe("GET /home/direct_messages/events/list", function () {
    it("should return 200 and a response body if there are messages associated with the user", async function () {
      try {
        const successGetMessagesRes = await agent.get(
          "/home/direct_messages/events/list"
        );
        expect(successGetMessagesRes.status).to.equal(200);
        expect(successGetMessagesRes.body).to.have.property("events");
      } catch (error) {
        console.log(error);
      }
    });

    it("should return 404 and a message if there are no messages associated with the user", async function () {
      try {
        const failGetMessagesRes = await anotherAgent.get(
          "/home/direct_messages/events/list"
        );
        expect(failGetMessagesRes.status).to.equal(404);
        expect(failGetMessagesRes.body)
          .to.have.property("message")
          .equal("No message history with any recipients.");
      } catch (error) {
        console.log(error);
      }
    });
  });

  describe("GET /home/direct_messages/events/show", function () {
    it("should return 200 and a response body if the message exists", async function () {
      try {
        const successShowMessage = await agent.get(
          "/home/direct_messages/events/show/"
        );
        expect(successShowMessage.status).to.equal(200);
        expect(successShowMessage.body).to.have.property("events");
      } catch (error) {
        console.log(error);
      }
    });
  });
});

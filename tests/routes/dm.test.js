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
  let existingDm, existingMessage;

  // Delete all documents for the DirectMessage model and authenticate 2 users
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

        // Save the newly created message's ids to user later in the showMessage test
        existingDm = recipientTextRes.body.id;
        console.log("existingDm:", existingDm);
        existingMessage =
          recipientTextRes.body.message_create.message_data.message_id;
        console.log("existingMessage:", existingMessage);
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
          `/home/direct_messages/events/show?id=${existingDm}&messageId=${existingMessage}`
        );
        expect(successShowMessage.status).to.equal(200);
        expect(successShowMessage.body).to.have.property("event");
      } catch (error) {
        console.log(error);
      }
    });

    it("should return 400 and a message if the query params are invalid", async function () {
      try {
        const invalidShowMessage = await agent.get(
          "/home/direct_messages/events/show?id=this1id2wont3work&messageId=orthis1"
        );
        expect(invalidShowMessage.status).to.equal(400);
        expect(invalidShowMessage.body)
          .to.have.property("message")
          .equal("Invalid query params.");
      } catch (error) {
        console.log(error);
      }
    });

    it("should return 404 and a message if the direct message stream doesn't exist", async function () {
      try {
        const convoNotFound = await agent.get(
          "/home/direct_messages/events/show?id=607a3d3f72aec51111111111&messageId=1111111112aec54d59c30c94"
        );
        expect(convoNotFound.status).to.equal(404);
        expect(convoNotFound.body)
          .to.have.property("message")
          .equal("Direct message stream doesn't exist.");
      } catch (error) {
        console.log(error);
      }
    });

    it("should return 404 and a message if the message doesn't exist", async function () {
      try {
        const failShowMessage = await agent.get(
          `/home/direct_messages/events/show?id=${existingDm}&messageId=1111111112aec54d59c30c94`
        );
        expect(failShowMessage.status).to.equal(404);
        expect(failShowMessage.body)
          .to.have.property("message")
          .equal("Message not found.");
      } catch (error) {
        console.log(error);
      }
    });
  });

  describe("DELETE /home/direct_messages/events/destroy", function () {
    it("should return 204 if the message is successfully deleted", async function () {
      try {
        const successDeleteMessage = await agent.delete(
          `/home/direct_messages/events/destroy?id=${existingDm}&messageId=${existingMessage}`
        );
        expect(successDeleteMessage.status).to.equal(204);
      } catch (error) {
        console.log(error);
      }
    });

    it("should return 400 and a message if the query params are invalid", async function () {
      try {
        const invalidDeleteMessage = await agent.delete(
          "/home/direct_messages/events/destroy?id=this1id2wont3work&messageId=orthis1"
        );
        expect(invalidDeleteMessage.status).to.equal(400);
        expect(invalidDeleteMessage.body)
          .to.have.property("message")
          .equal("Invalid query params.");
      } catch (error) {
        console.log(error);
      }
    });

    it("should return 404 and a message if the direct message stream doesn't exist", async function () {
      try {
        const convoNotFound = await agent.delete(
          "/home/direct_messages/events/destroy?id=607b5ca29148b48a36a8a3b2&messageId=1111111112aec54d59c30c94"
        );
        expect(convoNotFound.status).to.equal(404);
        expect(convoNotFound.body)
          .to.have.property("message")
          .equal("Direct message stream doesn't exist.");
      } catch (error) {
        console.log(error);
      }
    });

    it("should return 404 and a message if message doesn't exist", async function () {
      try {
        const failShowMessage = await agent.delete(
          `/home/direct_messages/events/destroy?id=${existingDm}&messageId=1111111112aec54d59c30c94`
        );
        expect(failShowMessage.status).to.equal(404);
        expect(failShowMessage.body)
          .to.have.property("message")
          .equal("Message not found.");
      } catch (error) {
        console.log(error);
      }
    });
  });
});

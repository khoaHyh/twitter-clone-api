const chai = require("chai");
const { expect } = chai;
const { app } = require("../../server");
const chaiHttp = require("chai-http");
const seed = require("../seed");
const DirectMessage = require("../../models/directMessage");

chai.use(chaiHttp);

describe("Direct message route", function () {
  describe("POST /home/direct_messages/events/new", function () {
    const agent = chai.request.agent(app);

    before(async function () {
      try {
        await DirectMessage.deleteMany({});
        await agent.post("/login").send(seed.existingUser);
      } catch (error) {
        console.log(error);
      }
    });

    it("should return 201 and response body if a message is created", async function () {
      try {
        const recipientTextRes = await agent
          .post("/home/direct_messages/events/new")
          .send(seed.validRecipientTextMsg);
        expect(recipientTextRes.status).to.equal(201);
        expect(recipientTextRes.body)
          .to.have.property("type")
          .equal("message_create");
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
  });
});

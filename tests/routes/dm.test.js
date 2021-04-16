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

    // Make a request to create message with agent
    //async function createMessage(message) {
    //  await agent.post("/home/direct_messages/events/new").send(message);
    //}

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
        //expect(recipientTextRes).to.have.status(201);
        expect(recipientTextRes.status).to.equal(201);
        //expect(recipientTextRes.body)
        //  .to.have.property("type")
        //  .equal("message_create");
        //expect(recipientTextRes.body.message_create).to.have.property(
        //  "message_data"
        //);
      } catch (error) {
        console.log(error);
      }
    });

    //it("should return 404 and a message if recipient doesn't exist", async function () {});
  });
});

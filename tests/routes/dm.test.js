const chai = require("chai");
const { expect } = chai;
const { app } = require("../../server");
const chaiHttp = require("chai-http");
const seed = require("../seed");

chai.use(chaiHttp);

describe("Direct message route", function () {
  describe("POST /home/direct_messages/events/new", function () {
    it("should return 201 if a message is created", async function () {
      const agent = chai.request.agent(app);

      try {
        await agent.post("/login").send(seed.existingUser);
        const authenticatedResponse = await agent
          .post("/home/direct_messages/events/new")
          .send(seed.newCreateMessage);
        expect(authenticatedResponse).to.have.status(201);
        expect(authenticatedResponse).to.have.property("body");
        expect(authenticatedResponse.body)
          .to.have.property("type")
          .equal("message_create");
        expect(authenticatedResponse.body)
          .to.have.property("message_create")
          .to.have.property("message_data");
      } catch (error) {
        console.log(error);
      }
    });
  });
});

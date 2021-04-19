const chai = require("chai");
const { expect } = chai;
const { app } = require("../../server");
const faker = require("faker");
const chaiHttp = require("chai-http");
const seed = require("../seed");
const User = require("../../models/user");

chai.use(chaiHttp);

describe("Auth route", function () {
  // Clear database and register our existingUser before auth tests
  before(async function () {
    try {
      await User.deleteMany({});
      const userArray = [seed.existingUser, seed.anotherUser, seed.ghostUser];

      // Loops through our userArray and makes async/await calls to register each account
      (async function registerUsers() {
        for (let i = 0; i < userArray.length; i++) {
          await chai.request(app).post("/register").send(userArray[i]);
        }
      })();
    } catch (error) {
      console.log(error);
    }
  });

  describe("POST /register", function () {
    it("should return 201 and user's id if successful", async function () {
      try {
        const result = await chai
          .request(app)
          .post("/register")
          .send(seed.newUser);
        expect(result.status).to.equal(201);
        expect(result.body).to.have.property("userId");
      } catch (error) {
        console.log(error);
      }
    });

    it("should return 409 if the user already exists", async function () {
      try {
        const result = await chai
          .request(app)
          .post("/register")
          .send(seed.existingUser);
        expect(result.status).to.equal(409);
      } catch (error) {
        console.log(error);
      }
    });

    it("should return 422 if there are missing credentials", async function () {
      try {
        const result = await chai.request(app).post("/register").send({
          username: "",
          password: "",
        });
        expect(result.status).to.equal(422);
        expect(result.body)
          .to.have.property("message")
          .equal("Missing credentials");
      } catch (error) {
        console.log(error);
      }
    });

    it("should return 400 if the username contains profanity", async function () {
      try {
        const result = await chai.request(app).post("/register").send({
          username: "badword",
          password: "password",
        });
        expect(result.status).to.equal(400);
        expect(result.body)
          .to.have.property("message")
          .equal("Username must not contain profanity.");
      } catch (error) {
        console.log(error);
      }
    });
  });

  describe("POST /login", function () {
    it("should return 200 and user's id if user successfully logs in", async function () {
      try {
        const result = await chai
          .request(app)
          .post("/login")
          .send(seed.existingUser);

        expect(result.status).to.equal(200);
        expect(result.body).to.have.property("userId");
      } catch (error) {
        console.log(error);
      }
    });

    it("should return 401 if user does not exist or credentials are invalid", async function () {
      try {
        await chai.request(app).post("/login").send(seed.newUser);
      } catch (error) {
        expect(error.status).to.be.equal(401);
      }
    });
  });

  // Utilize .request.agent from chai-http to authenticate user and perform requests as an authenticated user
  const agent = chai.request.agent(app);

  describe("GET /home to test user session", function () {
    it("should return 200 if user session exists", async function () {
      try {
        await agent.post("/login").send(seed.existingUser);
        const authenticatedResponse = await agent.get("/home");
        expect(authenticatedResponse).to.have.status(200);
      } catch (error) {
        console.log(error);
      }
    });

    it("should return 401 if user session does not exist", async function () {
      try {
        const result = await chai.request(app).get("/home");
        expect(result.status).to.equal(401);
      } catch (error) {
        console.log(error);
      }
    });
  });

  describe("GET /logout to test logout", function () {
    it("should return 200 and 'Unauthenticated' if user logs out", async function () {
      try {
        await agent.post("/login").send(seed.existingUser);
        const authenticatedResponse = await agent.get("/logout");
        expect(authenticatedResponse).to.have.status(200);
        expect(authenticatedResponse).to.have.property("body");
        expect(authenticatedResponse.body)
          .to.have.property("message")
          .equal("Unauthenticated.");
      } catch (error) {
        console.log(error);
      }
    });
  });
  it("should return 'No user session to unauthenticate' if no user session exists to logout", async function () {
    try {
      const noSessionResponse = await agent.get("/logout");
      expect(noSessionResponse).to.have.status(200);
      expect(noSessionResponse).to.have.property("body");
      expect(noSessionResponse.body)
        .to.have.property("message")
        .equal("No user session to unauthenticate.");
    } catch (error) {
      console.log(error);
    }
  });
});

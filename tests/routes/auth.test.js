const chai = require("chai");
const { expect } = chai;
const { app } = require("../../server");
const faker = require("faker");
const chaiHttp = require("chai-http");

chai.use(chaiHttp);

describe("Auth route", function () {
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

  describe("POST /register", function () {
    it("should return 201 if user does not already exist", async function () {
      try {
        const result = await chai.request(app).post("/register").send(newUser);
        expect(result.status).to.equal(201);
      } catch (error) {
        console.log(error);
      }
    });

    it("should return 409 if the user already exists", async function () {
      try {
        await chai.request(app).post("/register").send(existingUser);
      } catch (error) {
        console.log("error:", error);
        expect(error.status).to.equal(409);
      }
    });
  });

  describe("POST /login", function () {
    it("should return 200 if user successfully logs in", async function () {
      try {
        const result = await chai
          .request(app)
          .post("/login")
          .send(existingUser);

        expect(result.status).to.equal(200);
        expect(result.body).to.have.property("username");
      } catch (error) {
        console.log(error);
      }
    });

    it("should return 401 if user does not exist or credentials are invalid", async function () {
      try {
        await chai.request(app).post("/login").send(newUser);
      } catch (error) {
        expect(error.status).to.be.equal(401);
      }
    });
  });

  describe("GET /home to test user session", function () {
    it("should return 200 if user session exists", async function () {
      // Keep cookies from request and send them with the next using .request.agent from chai-http
      const agent = chai.request.agent(app);

      try {
        await agent.post("/login").send(existingUser);
        const authenticatedResponse = await agent.get("/home");
        expect(authenticatedResponse).to.have.status(200);
      } catch (error) {
        console.log(error);
      }
    });
  });

  describe("GET /logout to test logout", function () {
    it("should return 200 and 'Unauthenticated' if user logs out", async function () {
      // Utilize .request.agent from chai-http to authenticated user then subsequently unauthenticate them
      const agent = chai.request.agent(app);

      try {
        await agent.post("/login").send(existingUser);
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
    const agent = chai.request.agent(app);
    const noSessionResponse = await agent.get("/logout");
    expect(noSessionResponse).to.have.status(200);
    expect(noSessionResponse).to.have.property("body");
    expect(noSessionResponse.body)
      .to.have.property("message")
      .equal("No user session to unauthenticate.");
  });
});

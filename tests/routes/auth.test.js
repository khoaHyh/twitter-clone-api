const chai = require("chai");
const { expect } = chai;
const { app } = require("../../server");
const faker = require("faker");
const chaiHttp = require("chai-http");

chai.use(chaiHttp);

describe("Auth route", function () {
  const newUser = {
    username: faker.internet.userName(),
    password: faker.internet.password(),
  };
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
        expect(result.body).to.not.be.empty;
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
});

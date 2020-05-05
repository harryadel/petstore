const request = require("supertest");
const faker = require("faker");

const app = require("../../src/api");
const user = require("../../src/api/services/user");
const db = require("../../src/api/db");

const createAndLoginUser = async ({
  firstName = faker.name.firstName(),
  lastName = faker.name.lastName(),
}) => {

  const fakeUser = {
    username: faker.internet.userName(),
    firstName,
    lastName,
    email: faker.internet.email(),
    password: faker.internet.password(),
    phone: 1234567891111,
  };

  await user.createUser({
    body: fakeUser,
  });

  return await request(app).get("/v2/user/login").query({
    username: fakeUser.username,
    password: fakeUser.password,
  });
};

const insertPet = async ({ token }) => {
  return await request(app)
    .post("/v2/pet")
    .set({ Authorization: token })
    .send({
      category: { name: faker.lorem.words() },
      name: faker.name.firstName(),
      tags: [
        {
          name: faker.lorem.word(),
        },
      ],
      status: "Available",
    });
};

const insertBid = async ({ token, petId, amount = faker.random.number() }) => {
  return await request(app)
    .post("/v2/pet/upsertBid")
    .set({ Authorization: token })
    .send({
      petId,
      amount,
    });
};

const clearCollections = (collections) => {
  collections.forEach((collection) => {
    db.get(collection).remove().write(); // remove users collection
  });
};

module.exports = {
  createAndLoginUser,
  clearCollections,
  insertPet,
  insertBid,
};

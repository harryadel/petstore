const request = require("supertest");
const faker = require("faker");
const app = require("../../src/api");
const user = require("../../src/api/services/user");
const db = require("../../src/api/db");

const getAccessTokenAndId = async () => {
  const fakeUser = {
    username: faker.internet.userName(),
    firstName: faker.name.firstName(),
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

const clearCollections = (collections) => {
  collections.forEach(collection => {
        db.get(collection).remove().write(); // remove users collection
  });
}

module.exports = {
  getAccessTokenAndId,
  clearCollections
};

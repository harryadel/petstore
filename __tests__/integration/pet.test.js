const request = require("supertest");
const app = require("../../src/api");
const db = require("../../src/api/db");
const user = require("../../src/api/services/user");
const pet = require("../../src/api/services/pet");
const {
  createAndLoginUser,
  clearCollections,
  insertPet,
  insertBid,
} = require("../helpers");

describe("Pets Endpoints", () => {
  beforeEach(() => {
    clearCollections(["users", "pets", "bids"]);
  });

  it("should reject unauthorized request", async () => {
    const res = await request(app).post("/v2/pet").send({});

    expect(res.statusCode).toEqual(401);
    expect(res.body).toHaveProperty("error");
    expect(res.body.error).toEqual("No authorization token was found");
  });

  it("should allow users to add pets", async () => {
    const {
      body: { token, _id },
    } = await createAndLoginUser({});

    const res = await insertPet({ token });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("ownerId");
    expect(res.body.ownerId).toEqual(_id);
    expect(res.body).toHaveProperty("_id");
  });

  it("should allow users to bid on pets", async () => {
    const {
      body: { token, _id },
    } = await createAndLoginUser({});

    const addPetResult = await pet.addPet({
      body: {
        category: { name: "Home Pets" },
        name: "Hachiko",
        tags: [
          {
            name: "dog",
          },
        ],
        status: "Available",
      },
      payload: { _id },
    });

    const amount = 500;
    const res = await request(app)
      .post("/v2/pet/upsertBid")
      .set({ Authorization: token })
      .send({
        amount,
        petId: addPetResult.data._id,
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.bidderId).toEqual(_id);
    expect(res.body.amount).toEqual(amount);
    expect(res.body.petId).toEqual(addPetResult.data._id);
  });

  it("should allow owner to list bids", async () => {
    const createAndLoginUserResult = await createAndLoginUser({});

    const {
      body: { _id: petId }, // petId
    } = await insertPet({ token: createAndLoginUserResult.body.token });

    const bidderAmounts = [{ amount: 500 }, { amount: 600 }, { amount: 700 }];

    for (let obj of bidderAmounts) {
      const {
        body: { token },
      } = await createAndLoginUser({});

      const bidInsertionResult = await insertBid({
        token,
        petId,
        amount: obj.amount,
      });
    }

    const res = await request(app)
      .get(`/v2/pet/${petId}/bids`)
      .set({ Authorization: createAndLoginUserResult.body.token });

    expect(res.statusCode).toEqual(200);
    bidderAmounts.forEach((obj, index) => {
      expect(res.body[index].petId).toEqual(petId);
      expect(res.body[index].amount).toEqual(obj.amount);
    });
  });

  // disallow non-owners to list bids
  it("should disallow non-owners from listing bids", async () => {
    const createAndLoginUserResult = await createAndLoginUser({});

    const {
      body: { _id: petId }, // petId
    } = await insertPet({ token: createAndLoginUserResult.body.token });

    const newUser = await createAndLoginUser({});

    const res = await request(app)
      .get(`/v2/pet/${petId}/bids`)
      .set({ Authorization: newUser.body.token });

    expect(res.statusCode).toEqual(401);
    expect(res.body).toHaveProperty("error");
    expect(res.body.error[0].message).toEqual(
      "You're not authorized to perform such request"
    );
  });

  it("evaluate bid result", async () => {
    const createAndLoginUserResult = await createAndLoginUser({});

    const {
      body: { _id: petId }, // petId
    } = await insertPet({ token: createAndLoginUserResult.body.token });

    const bidders = [
      { amount: 100, firstName: "John", lastName: "Doe" },
      { amount: 500, firstName: "John", lastName: "Smith" },
      { amount: 280, firstName: "Sara", lastName: "Conor" },
      { amount: 320, firstName: "Martin", lastName: "Fowler" },
    ];

    for (let obj of bidders) {
      const {
        body: { token },
      } = await createAndLoginUser({
        firstName: obj.firstName,
        lastName: obj.lastName,
      });

      const bidInsertionResult = await insertBid({
        token,
        petId,
        amount: obj.amount,
      });
    }

    const res = await request(app)
      .get(`/v2/pet/${petId}/getBidsResult`)
      .set({ Authorization: createAndLoginUserResult.body.token });

    expect(res.statusCode).toEqual(200);

    expect(res.body[0].fullName).toEqual("John Smith");
    expect(res.body[0].amount).toEqual(320);

    expect(res.body[1].fullName).toEqual("Martin Fowler");
    expect(res.body[1].amount).toEqual(280);

    expect(res.body[2].fullName).toEqual("Sara Conor");
    expect(res.body[2].amount).toEqual(100);

  });
});

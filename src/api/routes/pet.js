const express = require("express");
const pet = require("../services/pet");
const auth = require("../auth");

const router = new express.Router();

/**
 * uploads an image
 */
router.post("/:petId/uploadImage", async (req, res, next) => {
  const options = {
    petId: req.params["petId"],
  };

  try {
    const result = await pet.uploadFile(options);
    res.status(result.status || 200).send(result.data);
  } catch (err) {
    return res.status(500).send({
      status: 500,
      error: "Server Error",
    });
  }
});

/**
 * Add a new pet to the store
 */
router.post("/", auth.required, async (req, res, next) => {
  const options = {
    body: req.body,
    payload: req.payload,
  };

  try {
    const result = await pet.addPet(options);
    res.status(200).send(result.data);
  } catch (err) {
    next(err);
  }
});

/**
 * Update an existing pet
 */
router.put("/", async (req, res, next) => {
  const options = {
    body: req.body["body"],
  };

  try {
    const result = await pet.updatePet(options);
    res.status(200).send(result.data);
  } catch (err) {
    next(err);
  }
});

/**
 * Multiple status values can be provided with comma separated
 * strings
 */
router.get("/findByStatus", async (req, res, next) => {
  const options = {
    status: req.query["status"],
  };

  try {
    const result = await pet.findPetsByStatus(options);
    res.status(result.status || 200).send(result.data);
  } catch (err) {
    next(err);
  }
});

/**
 * Multiple tags can be provided with comma separated strings.
 * Use tag1, tag2, tag3 for testing.
 */
router.get("/findByTags", async (req, res, next) => {
  const options = {
    tags: req.query["tags"],
  };

  try {
    const result = await pet.findPetsByTags(options);
    res.status(result.status || 200).send(result.data);
  } catch (err) {
    next(err);
  }
});

/**
 * Returns a single pet
 */
router.get("/:petId", async (req, res, next) => {
  const options = {
    petId: req.params["petId"],
  };

  try {
    const result = await pet.getPetById(options);
    res.status(result.status || 200).send(result.data);
  } catch (err) {
    next(err);
  }
});

/**
 * Upsert a bid on pet in the store with form data
 */
router.get("/:petId/bids", auth.required, async (req, res, next) => {
  const options = {
    petId: req.params["petId"],
    payload: req.payload,
  };

  try {
    const result = await pet.getBids(options);
    res.status(200).send(result.data);
  } catch (err) {
    next(err);
  }
});

/**
 * Evalute bids
 */
router.get("/:petId/getBidsResult", auth.required, async (req, res, next) => {
  const options = {
    petId: req.params["petId"],
    payload: req.payload,
  };

  try {
    const result = await pet.getBidsResult(options);
    res.status(200).send(result.data);
  } catch (err) {
    next(err);
  }
});

/**
 * Upsert a bid on pet in the store with form data
 */
router.post("/upsertBid", auth.required, async (req, res, next) => {
  const options = {
    body: req.body,
    payload: req.payload,
  };

  try {
    const result = await pet.upsertBid(options);
    res.status(200).send(result.data);
  } catch (err) {
    next(err);
  }
});

/**
 * Deletes a pet
 */
router.delete("/:petId", async (req, res, next) => {
  const options = {
    api_key: req.header["api_key"],
    petId: req.params["petId"],
  };

  try {
    const result = await pet.deletePet(options);
    res.status(200).send(result.data);
  } catch (err) {
    next(err);
  }
});

module.exports = router;

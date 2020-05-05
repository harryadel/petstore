const SimpleSchema = require("simpl-schema");
const shortid = require("shortid");
const isEmpty = require("lodash/isEmpty");
const orderBy = require("lodash/orderBy");
const omit = require("lodash/omit");
const ServerError = require("../../lib/error");
const db = require("../db");
const auth = require("../auth");

/**
 * @param {Object} options
 * @param {Integer} options.petId ID of pet to update
 * @param {String} options.additionalMetadata Additional data to pass to server
 * @param {File} options.file file to upload
 * @throws {Error}
 * @return {Promise}
 */
module.exports.uploadFile = async (options) => {
  // Implement your business logic here...
  //
  // This function should return as follows:
  //
  // return {
  //   status: 200, // Or another success code.
  //   data: [] // Optional. You can put whatever you want here.
  // };
  //
  // If an error happens during your business logic implementation,
  // you should throw an error as follows:
  //
  // throw new ServerError({
  //   status: 500, // Or another error code.
  //   error: 'Server Error' // Or another error message.
  // });

  return {
    status: 200,
    data: "uploadFile ok!",
  };
};

/**
 * @param {Object} options
 * @param {Object} options.body Pet object that needs to be added to the store
 * @throws {Error}
 * @return {Promise}
 */
module.exports.addPet = async (options) => {
  // Implement your business logic here...
  //
  // This function should return as follows:
  //
  // return {
  //   status: 200, // Or another success code.
  //   data: [] // Optional. You can put whatever you want here.
  // };
  //
  // If an error happens during your business logic implementation,
  // you should throw an error as follows:
  //
  // throw new ServerError({
  //   status: 500, // Or another error code.
  //   error: 'Server Error' // Or another error message.
  // });

  try {
    new SimpleSchema({
      category: Object,
      "category.name": String,
      name: String,
      photoUrls: {
        type: String,
        optional: true,
        regEx: SimpleSchema.RegEx.Url,
      },
      tags: Array,
      "tags.$": Object,
      "tags.$.name": String,
      status: String,
    }).validate(options.body);
  } catch (error) {
    throw new ServerError({
      status: 422,
      error: error.details.map((obj) => omit(obj, ["type", "regExp"])), // only return the error details
    });
  }

  options.body._id = shortid.generate();

  options.body.category._id = shortid.generate();

  options.body.tags = options.body.tags.map((obj) => {
    return { ...obj, _id: shortid.generate() };
  });

  options.body.ownerId = options.payload._id;

  db.get("pets").push(options.body).write();

  return {
    status: 200,
    data: options.body,
  };
};

/**
 * @param {Object} options
 * @param {String} options.petId ID of pet that needs to be updated
 * @throws {Error}
 * @return {Promise}
 */
module.exports.getBidsResult = async (options) => {
  // Implement your business logic here...
  //
  // This function should return as follows:
  //
  // return {
  //   status: 200, // Or another success code.
  //   data: [] // Optional. You can put whatever you want here.
  // };
  //
  // If an error happens during your business logic implementation,
  // you should throw an error as follows:
  //
  // throw new ServerError({
  //   status: 500, // Or another error code.
  //   error: 'Server Error' // Or another error message.
  // });

  try {
    new SimpleSchema({
      petId: String,
    }).validate({ petId: options.petId });
  } catch (error) {
    throw new ServerError({
      status: 422,
      error: error.details.map((obj) => omit(obj, ["type", "regExp"])), // only return the error details
    });
  }

  const pet = db.get("pets").find({ _id: options.petId }).value();

  if (isEmpty(pet)) {
    throw new ServerError({
      status: 404,
      error: [
        {
          message: "No pet with such id",
        },
      ],
    });
  }

  if (pet.ownerId !== options.payload._id) {
    throw new ServerError({
      status: 401,
      error: [
        {
          message: "You're not authorized to perform such request",
        },
      ],
    });
  }

  let bids = db.get("bids").filter({ petId: options.petId }).value();

  if (isEmpty(bids)) {
    return {
      status: 200,
      message: "No bidders",
    };
  }

  bids = db
    .get("bids")
    .filter({ petId: options.petId })
    .map((bid) => {
      const { firstName, lastName } = db
        .get("users")
        .find({ _id: bid.bidderId })
        .value();
      return {
        ...bid,
        fullName: `${firstName} ${lastName}`,
      };
    }) // Add firstName as it'd be used along the amount for sorting
    .orderBy(["amount", "fullName"], ["desc"])
    .take(4) // Grab the first four as we're about to replace the amount of a bid with the next one in the array
    .map((bid, index, arr) => {
      if (index <= 2) {
        return { ...bid, amount: arr[index + 1].amount };
      }
      return bid;
    }) // Finally cut off the fourth element as there can only be three winners
    .take(3)
    .value();

  return {
    status: 200,
    data: bids,
  };
};

/**
 * @param {Object} options
 * @param {String} options.petId ID of pet that needs to be updated
 * @throws {Error}
 * @return {Promise}
 */
module.exports.getBids = async (options) => {
  // Implement your business logic here...
  //
  // This function should return as follows:
  //
  // return {
  //   status: 200, // Or another success code.
  //   data: [] // Optional. You can put whatever you want here.
  // };
  //
  // If an error happens during your business logic implementation,
  // you should throw an error as follows:
  //
  // throw new ServerError({
  //   status: 500, // Or another error code.
  //   error: 'Server Error' // Or another error message.
  // });

  try {
    new SimpleSchema({
      petId: String,
    }).validate({ petId: options.petId });
  } catch (error) {
    throw new ServerError({
      status: 422,
      error: error.details.map((obj) => omit(obj, ["type", "regExp"])), // only return the error details
    });
  }

  const pet = db.get("pets").find({ _id: options.petId }).value();

  if (isEmpty(pet)) {
    throw new ServerError({
      status: 404,
      error: [
        {
          message: "No pet with such id",
        },
      ],
    });
  }

  if (pet.ownerId !== options.payload._id) {
    throw new ServerError({
      status: 401,
      error: [
        {
          message: "You're not authorized to perform such request",
        },
      ],
    });
  }

  const bids = db.get("bids").filter({ petId: options.petId }).value();

  return {
    status: 200,
    data: bids,
  };
};

/**
 * @param {Object} options
 * @param {String} options.petId ID of pet that needs to be updated
 * @param {Integer} options.amount Amount of the bid
 * @throws {Error}
 * @return {Promise}
 */
module.exports.upsertBid = async (options) => {
  // Implement your business logic here...
  //
  // This function should return as follows:
  //
  // return {
  //   status: 200, // Or another success code.
  //   data: [] // Optional. You can put whatever you want here.
  // };
  //
  // If an error happens during your business logic implementation,
  // you should throw an error as follows:
  //
  // throw new ServerError({
  //   status: 500, // Or another error code.
  //   error: 'Server Error' // Or another error message.
  // });

  try {
    new SimpleSchema({
      petId: String,
      amount: Number,
    }).validate(options.body);
  } catch (error) {
    throw new ServerError({
      status: 422,
      error: error.details.map((obj) => omit(obj, ["type", "regExp"])), // only return the error details
    });
  }

  const pet = db.get("pets").find({ _id: options.body.petId }).value();

  if (isEmpty(pet)) {
    throw new ServerError({
      status: 404,
      error: [
        {
          message: "No pet with such id",
        },
      ],
    });
  }

  const bid = { ...options.body, bidderId: options.payload._id };

  db.get("bids").updateOrAdd(bid, ["bidderId"]).write();

  return {
    status: 200,
    data: bid,
  };
};

/**
 * @param {Object} options
 * @param {Object} options.body Pet object that needs to be added to the store
 * @throws {Error}
 * @return {Promise}
 */
module.exports.updatePet = async (options) => {
  // Implement your business logic here...
  //
  // This function should return as follows:
  //
  // return {
  //   status: 200, // Or another success code.
  //   data: [] // Optional. You can put whatever you want here.
  // };
  //
  // If an error happens during your business logic implementation,
  // you should throw an error as follows:
  //
  // throw new ServerError({
  //   status: 500, // Or another error code.
  //   error: 'Server Error' // Or another error message.
  // });

  return {
    status: 200,
    data: "updatePet ok!",
  };
};

/**
 * @param {Object} options
 * @param {Array} options.status Status values that need to be considered for filter
 * @throws {Error}
 * @return {Promise}
 */
module.exports.findPetsByStatus = async (options) => {
  // Implement your business logic here...
  //
  // This function should return as follows:
  //
  // return {
  //   status: 200, // Or another success code.
  //   data: [] // Optional. You can put whatever you want here.
  // };
  //
  // If an error happens during your business logic implementation,
  // you should throw an error as follows:
  //
  // throw new ServerError({
  //   status: 500, // Or another error code.
  //   error: 'Server Error' // Or another error message.
  // });

  return {
    status: 200,
    data: "findPetsByStatus ok!",
  };
};

/**
 * @param {Object} options
 * @param {Array} options.tags Tags to filter by
 * @throws {Error}
 * @return {Promise}
 */
module.exports.findPetsByTags = async (options) => {
  // Implement your business logic here...
  //
  // This function should return as follows:
  //
  // return {
  //   status: 200, // Or another success code.
  //   data: [] // Optional. You can put whatever you want here.
  // };
  //
  // If an error happens during your business logic implementation,
  // you should throw an error as follows:
  //
  // throw new ServerError({
  //   status: 500, // Or another error code.
  //   error: 'Server Error' // Or another error message.
  // });

  return {
    status: 200,
    data: "findPetsByTags ok!",
  };
};

/**
 * @param {Object} options
 * @param {Integer} options.petId ID of pet to return
 * @throws {Error}
 * @return {Promise}
 */
module.exports.getPetById = async (options) => {
  // Implement your business logic here...
  //
  // This function should return as follows:
  //
  // return {
  //   status: 200, // Or another success code.
  //   data: [] // Optional. You can put whatever you want here.
  // };
  //
  // If an error happens during your business logic implementation,
  // you should throw an error as follows:
  //
  // throw new ServerError({
  //   status: 500, // Or another error code.
  //   error: 'Server Error' // Or another error message.
  // });

  return {
    status: 200,
    data: "getPetById ok!",
  };
};

/**
 * @param {Object} options
 * @param {Integer} options.petId ID of pet that needs to be updated
 * @param {String} options.name Updated name of the pet
 * @param {String} options.status Updated status of the pet
 * @throws {Error}
 * @return {Promise}
 */
module.exports.updatePetWithForm = async (options) => {
  // Implement your business logic here...
  //
  // This function should return as follows:
  //
  // return {
  //   status: 200, // Or another success code.
  //   data: [] // Optional. You can put whatever you want here.
  // };
  //
  // If an error happens during your business logic implementation,
  // you should throw an error as follows:
  //
  // throw new ServerError({
  //   status: 500, // Or another error code.
  //   error: 'Server Error' // Or another error message.
  // });

  return {
    status: 200,
    data: "updatePetWithForm ok!",
  };
};

/**
 * @param {Object} options
 * @param {String} options.api_key
 * @param {Integer} options.petId Pet id to delete
 * @throws {Error}
 * @return {Promise}
 */
module.exports.deletePet = async (options) => {
  // Implement your business logic here...
  //
  // This function should return as follows:
  //
  // return {
  //   status: 200, // Or another success code.
  //   data: [] // Optional. You can put whatever you want here.
  // };
  //
  // If an error happens during your business logic implementation,
  // you should throw an error as follows:
  //
  // throw new ServerError({
  //   status: 500, // Or another error code.
  //   error: 'Server Error' // Or another error message.
  // });

  return {
    status: 200,
    data: "deletePet ok!",
  };
};

const SimpleSchema = require("simpl-schema");
const omit = require("lodash/omit");
const isEmpty = require("lodash/isEmpty");
const crypto = require("crypto");
const shortid = require("shortid");
const ServerError = require("../../lib/error");
const db = require("../db");
const auth = require("../auth");

const salt = crypto.randomBytes(16).toString("hex");

/**
 * @param {Object} options
 * @param {Array} options.body List of user object
 * @throws {Error}
 * @return {Promise}
 */
module.exports.createUsersWithArrayInput = async (options) => {
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
    data: "createUsersWithArrayInput ok!",
  };
};

/**
 * @param {Object} options
 * @param {Array} options.body List of user object
 * @throws {Error}
 * @return {Promise}
 */
module.exports.createUsersWithListInput = async (options) => {
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
    data: "createUsersWithListInput ok!",
  };
};

/**
 * @param {Object} options
 * @param {String} options.username The name that needs to be fetched. Use user1 for testing.
 * @throws {Error}
 * @return {Promise}
 */
module.exports.getUserByName = async (options) => {
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
    data: "getUserByName ok!",
  };
};

/**
 * @param {Object} options
 * @param {String} options.username name that need to be updated
 * @param {Object} options.body Updated user object
 * @throws {Error}
 * @return {Promise}
 */
module.exports.updateUser = async (options) => {
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
    data: "updateUser ok!",
  };
};

/**
 * @param {Object} options
 * @param {String} options.username The name that needs to be deleted
 * @throws {Error}
 * @return {Promise}
 */
module.exports.deleteUser = async (options) => {
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
    data: "deleteUser ok!",
  };
};

/**
 * @param {Object} options
 * @param {String} options.username The user name for login
 * @param {String} options.password The password for login in clear text
 * @throws {Error}
 * @return {Promise}
 */
module.exports.loginUser = async (options) => {
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
      username: String,
      password: {
        type: String,
        min: 8,
      },
    }).validate(options);
  } catch (error) {
    throw new ServerError({
      status: 422,
      error: error.details.map((obj) => omit(obj, ["type", "regExp"])), // only return the error details
    });
  }

  try {
    const { password, _id, email } = db
      .get("users")
      .find({ username: options.username })
      .value();

    const hash = crypto
      .pbkdf2Sync(options.password, salt, 10000, 512, "sha512")
      .toString("hex");
    password === hash;

    return {
      status: 200,
      data: {
        _id,
        email,
        token: auth.generateToken({ email, _id }),
      },
    };
  } catch (e) {
    throw new ServerError({
      status: 500,
      error: [
        {
          message: "username or password is invalid",
        },
      ],
    });
  }

  return {
    status: 200,
    data: "loginUser ok!",
  };
};

/**
 * @param {Object} options
 * @throws {Error}
 * @return {Promise}
 */
module.exports.logoutUser = async (options) => {
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
    data: "logoutUser ok!",
  };
};

/**
 * @param {Object} options
 * @param {Object} options.body Created user object
 * @throws {Error}
 * @return {Promise}
 */
module.exports.createUser = async (options) => {
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
      username: String,
      firstName: String,
      email: {
        type: String,
        regEx: SimpleSchema.RegEx.Email,
      },
      password: {
        type: String,
        min: 8,
      },
      phone: Number,
    }).validate(options.body);
  } catch (error) {
    throw new ServerError({
      status: 422,
      error: error.details.map((obj) => omit(obj, ["type", "regExp"])), // only return the error details
    });
  }

  const duplicateEmail = db
    .get("users")
    .find({ email: options.body.email })
    .value();

  if (duplicateEmail && !isEmpty(duplicateEmail)) {
    throw new ServerError({
      status: 409,
      error: [
        {
          message: "Email already exists",
        },
      ],
    });
  }

  const duplicateUsername = db
    .get("users")
    .find({ username: options.body.username })
    .value();

  if (duplicateUsername && !isEmpty(duplicateUsername)) {
    throw new ServerError({
      status: 409,
      error: [
        {
          message: "Username already exists",
        },
      ],
    });
  }

  options.body.password = crypto
    .pbkdf2Sync(options.body.password, salt, 10000, 512, "sha512")
    .toString("hex");

  const user = db
    .get("users")
    .push({ ...options.body, _id: shortid.generate() })
    .write();

  return {
    status: 200,
    data: { ...omit(user[0], ["password"]) },
  };
};

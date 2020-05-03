const jwtExpress = require("express-jwt");
const jwt = require("jsonwebtoken");
const db = require("./db");

const auth = {
  generateToken: ({ email, _id }) => {
    const today = new Date();
    const expirationDate = new Date(today);
    expirationDate.setDate(today.getDate() + 60);

    return jwt.sign(
      {
        email,
        _id,
        exp: parseInt(expirationDate.getTime() / 1000, 10),
      },
      process.env.JWT_SECRET
    );
  },
  required: jwtExpress({
    secret: process.env.JWT_SECRET,
    userProperty: "payload",
    getToken: (req) => {
      const {
        headers: { authorization },
      } = req;

      if (authorization) {
        return authorization;
      }
      return null;
    },
  }),
};

module.exports = auth;

const auth = {
  required: jwt({
    secret: "secret",
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

const jwt = require("jsonwebtoken");

module.exports = {
  verifyToken: (token) => {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {
      // if (e.name === "JsonWebTokenError") return undefined;
      // else return null;
      return null;
    }
  },
  issueAccessToken: (email) => {
    return jwt.sign({ email }, process.env.JWT_SECRET, {
      expiresIn: "10m",
    });
  },
  issueRefreshToken: (email) => {
    return jwt.sign({ email }, process.env.JWT_SECRET, {
      expiresIn: "14d",
    });
  },
};

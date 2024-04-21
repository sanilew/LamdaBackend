const jwt = require("jsonwebtoken");

function generateToken(userinfo) {
  if (!userinfo) {
    return null;
  }

  const userinfo = {
    username: user.username,
    email: user.email,
  };

  return jwt.sign(userinfo, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
}

function verifyToken(username, token) {
  return jwt.verify(token, process.env.JWT_SECRET, (error, response) => {
    if (error) {
      return {
        verified: false,
        message: "invalid token",
      };
    }

    if (response.username !== username) {
      return {
        verified: false,
        message: "invalid user",
      };
    }

    return {
      verified: true,
      message: "verified",
    };
  });
}

module.exports.generateToken = generateToken;
module.exports.verifyToken = verifyToken;

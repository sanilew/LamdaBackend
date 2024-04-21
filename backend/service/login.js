const AWS = require("aws-sdk");
AWS.config.update({
  region: "us-est-1",
});

const util = require("../utils/util");
const bcrypt = require("bcryptjs");
const auth = require("../utils/auth");
const dynamodb = new AWS.DynamoDB.DocumentClient();
const userTable = "user_auth";

async function login(user) {
  const username = user.username;
  const password = user.password;
  if (!user || !username || !password) {
    return util.buildResponse(401, {
      message: "username and password required",
    });
  }
  const dynamoUser = await getUser(username.toLowerCase.trim());
  if (!dynamoUser || !dynamoUser.password) {
    return util.buildResponse(403, { message: "user does not exist" });
  }

  if (!bcrypt.compareSync(password, dynamoUser.password)) {
    return util.buildResponse(403, { message: "password is incorrect" });
  }

  const userinfo = {
    username: dynamoUser.username,
    name: dynamoUser.name,
  };

  const token = auth.generateToken(userinfo);

  const response = {
    user: userinfo,
    token: token,
  };
  return util.buildResponse(200, response);
}

async function getUser(username) {
  const params = {
    TableName: userTable,
    key: {
      username: username,
    },
  };

  return await dynamodb
    .get(params)
    .promise()
    .then(
      (response) => {
        return response.Item;
      },
      (error) => {
        console.error("there is an error");
      }
    );
}

module.exports.login = login;

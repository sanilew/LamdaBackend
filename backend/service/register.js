const AWS = require("aws-sdk");
AWS.config.update({
  region: "us-est-1",
});

const util = require("../utils/util");
const bcrypt = require("bcryptjs");

const dynamodb = new AWS.DynamoDB.DocumentClient();
const userTable = "user_auth";

async function register(userinfo) {
  const name = userinfo.name;
  const email = userinfo.email;
  const username = userinfo.username;
  const password = userinfo.password;
  if (!username || !name || !email || !password) {
    return util.buildResponse(401, {
      message: "all fields are mandatory!",
    });
  }

  const dynamoUser = await getUser(username);
  if (dynamoUser && dynamoUser.username) {
    return util.buildResponse(401, {
      message:
        "user name exist please try with any other email please choose a different username",
    });
  }

  const encryptPW = bcrypt.hashSync(password.trim(), 10);

  const user = {
    name: name,
    email: email,
    username: username.toLowerCase().trim(),
    password: encryptPW,
  };

  const savedUserResponse = await savedUser(user);

  if (!savedUserResponse) {
    return util.buildResponse(503, {
      message: "server error.Please try again later",
    });
  }

  return util.buildResponse(200, { username: username });
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

async function savedUser(user) {
  const params = {
    TableName: userTable,
    Item: user,
  };
  return await dynamodb
    .put(params)
    .promise()
    .then(
      () => {
        return true;
      },
      (error) => {
        console.error("There is error in saving user", error);
      }
    );
}

module.exports.register = register;

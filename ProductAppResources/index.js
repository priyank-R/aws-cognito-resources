const AWS = require("aws-sdk");
const createUserAndIdentityPool = require("./src/Cognito");
const createRoles = require("./src/IdentityRoles");
const attachRolesToIdentityPool = require("./src/AttachRoles");
const createTable = require("./src/DynamoDB");
const test = require("./src/test");
require("dotenv").config();
AWS.config.update({ region: process.env.AWS_REGION });

const main = async () => {
  // await test()
  await createUserAndIdentityPool();
  await createTable();

  await createRoles();
  await attachRolesToIdentityPool();
};

main();

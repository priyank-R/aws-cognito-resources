const AWS = require("aws-sdk");
const createUserAndIdentityPool = require("./src/Cognito");
const createRoles = require("./src/IdentityRoles");
const attachRolesToIdentityPool = require("./src/AttachRoles");
const createTable = require("./src/DynamoDB");
require("dotenv").config();
AWS.config.update({ region: process.env.AWS_REGION });

const main = async () => {
  console.log('Starting to create resources on AWS.')
  console.log('-----------------------Creating: User Pool and Identity Pool--------------------------------')
  await createUserAndIdentityPool();
  console.log('-----------------------Creating: Dynamo DB Table--------------------------------')
  await createTable();
  console.log('-----------------------Creating: User Roles for Identity Pool--------------------------------')
  await createRoles();
  console.log('-----------------------Attaching: User Roles to Identity Pool--------------------------------')
  await attachRolesToIdentityPool();
  console.log('!!!!!!!!!!!!!!!!!!!!!!!PROCESS COMPLETED SUCCESSFULLY !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')
};

main();

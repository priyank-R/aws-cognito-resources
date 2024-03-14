const AWS = require("aws-sdk");
const { getUserPoolId, getIdentityPoolId } = require("./src/helper");
require("dotenv").config();
AWS.config.update({ region: "us-east-1" }); // Set your desired AWS region

const cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider();
const cognitoIdentity = new AWS.CognitoIdentity();
const iam = new AWS.IAM();

async function deleteCognitoUserPool(userPoolName) {
  try {
    const userPoolParams = {
      UserPoolName: userPoolName,
      UserPoolId: await getUserPoolId(userPoolName),
    };
    await cognitoIdentityServiceProvider
      .deleteUserPool(userPoolParams)
      .promise();
    console.log(`Cognito User Pool '${userPoolName}' deleted successfully.`);
  } catch (err) {
    console.error(`Error deleting Cognito User Pool '${userPoolName}':`, err);
    throw err;
  }
}

async function deleteIdentityPool(identityPoolName) {
  try {
    const identityPoolParams = {
      IdentityPoolName: identityPoolName,
      IdentityPoolId: await getIdentityPoolId(identityPoolName),
    };
    await cognitoIdentity.deleteIdentityPool(identityPoolParams).promise();
    console.log(`Identity Pool '${identityPoolName}' deleted successfully.`);
  } catch (err) {
    console.error(`Error deleting Identity Pool '${identityPoolName}':`, err);
    throw err;
  }
}

async function deleteIAMRole(roleName) {
  try {
    const roleParams = {
      RoleName: roleName,
    };
    await iam.deleteRole(roleParams).promise();
    console.log(`IAM Role '${roleName}' deleted successfully.`);
  } catch (err) {
    console.error(`Error deleting IAM Role '${roleName}':`, err);
    throw err;
  }
}

async function deleteResources() {
  try {
    // Delete Cognito User Pool
    await deleteCognitoUserPool(process.env.AWS_COGNITO_USER_POOL_NAME);

    // Delete Identity Pool
    await deleteIdentityPool(process.env.AWS_COGNITO_IDENTITY_POOL_NAME);

    // Delete IAM Roles
    await deleteIAMRole("AuthenticatedRole");
    await deleteIAMRole("GuestRole");
    await deleteIAMRole("SuperAdminRole");
    // Add more role names as needed

    console.log("All resources deleted successfully.");
  } catch (err) {
    console.error("Error deleting resources:", err);
  }
}

deleteResources();

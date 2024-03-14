const AWS = require("aws-sdk");

async function getIdentityPoolId(identityPoolName) {
  const cognito = new AWS.CognitoIdentity();

  try {
    const params = {
      MaxResults: 60, // Adjust as needed
    };

    const data = await cognito.listIdentityPools(params).promise();
    const identityPools = data.IdentityPools;

    for (const pool of identityPools) {
      if (pool.IdentityPoolName === identityPoolName) {
        return pool.IdentityPoolId;
      }
    }

    throw new Error(`Identity Pool '${identityPoolName}' not found`);
  } catch (err) {
    console.error("Error getting Identity Pool ID:", err);
    throw err;
  }
}

async function getUserPoolId(userPoolName) {
  const cognito = new AWS.CognitoIdentityServiceProvider();
  try {
    const params = {
      MaxResults: 60, // Adjust as needed
    };

    const data = await cognito.listUserPools(params).promise();
    const userPools = data.UserPools;

    for (const pool of userPools) {
      if (pool.Name === userPoolName) {
        return pool.Id;
      }
    }

    throw new Error(`User Pool '${userPoolName}' not found`);
  } catch (err) {
    console.error("Error getting User Pool ID:", err);
    throw err;
  }
}

async function listUserPoolClients(userPoolId) {
  const cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider();
  const params = {
    UserPoolId: userPoolId,
  };

  try {
    const data = await cognitoIdentityServiceProvider
      .listUserPoolClients(params)
      .promise();
    return data.UserPoolClients.map((client) => client.ClientId);
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}

module.exports = {
  getIdentityPoolId: getIdentityPoolId,
  getUserPoolId: getUserPoolId,
  listUserPoolClients: listUserPoolClients,
};

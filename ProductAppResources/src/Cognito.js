const AWS = require("aws-sdk");

module.exports = async function createUserAndIdentityPool() {
  const cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider();

  const createUserPoolParams = {
    PoolName: process.env.AWS_COGNITO_USER_POOL_NAME,
    Policies: {
      PasswordPolicy: {
        MinimumLength: 8,
        RequireUppercase: false,
        RequireLowercase: false,
        RequireNumbers: false,
        RequireSymbols: false,
      },
    },
  };

  // Create Identity Pool
  const createIdentityPoolParams = {
    IdentityPoolName: process.env.AWS_COGNITO_IDENTITY_POOL_NAME,
    CognitoIdentityProviders: [],
    AllowUnauthenticatedIdentities: true,
  };

  try {
    // Create User Pool
    const userPoolData = await cognitoIdentityServiceProvider.createUserPool(createUserPoolParams).promise();
    console.log("User Pool created successfully:", userPoolData?.UserPool?.Id);

    // Create User Pool Client
    const createUserPoolClientParams = {
      UserPoolId: userPoolData.UserPool.Id,
      ClientName: process.env.AWS_COGNITO_USER_POOL_CLIENT_NAME,
      CallbackURLs: ["http://localhost:3000"],
      LogoutURLs: ["http://localhost:3000/logout"],
    };

    const userPoolClientData = await cognitoIdentityServiceProvider.createUserPoolClient(createUserPoolClientParams).promise();
    console.log("User Pool client created successfully:", userPoolClientData?.UserPoolClient?.ClientId);

    // Update Identity Pool parameters with User Pool details
    createIdentityPoolParams.CognitoIdentityProviders.push({
      ClientId: userPoolClientData.UserPoolClient.ClientId,
      ProviderName: `cognito-idp.us-east-1.amazonaws.com/${userPoolData.UserPool.Id}`,
    });

    // Create Identity Pool
    const identityPoolData = await createIdentityPool(createIdentityPoolParams);
    console.log("Identity Pool created successfully:", identityPoolData?.IdentityPoolId);

  } catch (err) {
    console.error("Error creating User or Identity Pool:", err);
    throw err;
  }
};

function createIdentityPool(params) {
  const cognitoIdentity = new AWS.CognitoIdentity();
  return cognitoIdentity.createIdentityPool(params).promise();
}

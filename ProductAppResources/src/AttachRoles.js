const AWS = require("aws-sdk");
const {
  getUserPoolId,
  getIdentityPoolId,
  listUserPoolClients,
} = require("./helper");

module.exports = async function attachRolesToIdentityPool() {
  const aws_identity_pool_name = process.env.AWS_COGNITO_IDENTITY_POOL_NAME;
  const aws_account_id = process.env.AWS_ACCOUNT_ID;
  const aws_user_pool_name = process.env.AWS_COGNITO_USER_POOL_NAME;
  const cognitoidentity = new AWS.CognitoIdentity();
  const aws_user_pool_id = await getUserPoolId(aws_user_pool_name);
  const client_ids = await listUserPoolClients(aws_user_pool_id);
  const role_mapping = `cognito-idp.us-east-1.amazonaws.com/${aws_user_pool_id}:${client_ids[0]}`;

  try {
    const params = {
      IdentityPoolId: await getIdentityPoolId(aws_identity_pool_name),
      Roles: {
        authenticated: `arn:aws:iam::${aws_account_id}:role/${process.env.AWS_ROLE_AUTHENTICATED}`,
        unauthenticated: `arn:aws:iam::${aws_account_id}:role/${process.env.AWS_ROLE_GUEST}`,
      },
      RoleMappings: {
        [role_mapping]: {
          Type: "Rules",
          AmbiguousRoleResolution: "AuthenticatedRole",
          RulesConfiguration: {
            Rules: [
              {
                Claim: "cognito:groups",
                MatchType: "Contains",
                Value: "admin",
                RoleARN: `arn:aws:iam::${aws_account_id}:role/${process.env.AWS_ROLE_ADMIN}`,
              },
            ],
          },
        },
      },
    };

    const data = await cognitoidentity.setIdentityPoolRoles(params).promise();
    console.log("Roles attached to Identity Pool");
  } catch (err) {
    console.error("Error attaching roles to Identity Pool:", err);
  }
};

const AWS = require("aws-sdk");
const { getIdentityPoolId } = require("./helper");

// Create the roles
module.exports = async function createRoles() {
  const aws_identity_pool_name = process.env.AWS_COGNITO_IDENTITY_POOL_NAME;
  const aws_account_id = process.env.AWS_ACCOUNT_ID;
  const aws_dynamo_db_table_name = process.env.AWS_DYNAMO_DB_TABLE_NAME;
  const aws_region = process.env.AWS_REGION;
  const iam = new AWS.IAM();
  // Define policies for each role
  const guestPolicy = {
    Version: "2012-10-17",
    Statement: [
      {
        Effect: "Allow",
        Action: "dynamodb:GetItem",
        Resource: `arn:aws:dynamodb:${aws_region}:${aws_account_id}:table/${aws_dynamo_db_table_name}`,
      },
      // Add more policies as needed for guest role
    ],
  };

  const authenticatedPolicy = {
    Version: "2012-10-17",
    Statement: [
      {
        Effect: "Allow",
        Action: "dynamodb:GetItem",
        Resource: `arn:aws:dynamodb:${aws_region}:${aws_account_id}:table/${aws_dynamo_db_table_name}`,
      },
      {
        Effect: "Allow",
        Action: "dynamodb:PutItem",
        Resource: `arn:aws:dynamodb:${aws_region}:${aws_account_id}:table/${aws_dynamo_db_table_name}`,
      },
      // Add more policies as needed for authenticated role
    ],
  };

  const superadminPolicy = {
    Version: "2012-10-17",
    Statement: [
      {
        Effect: "Allow",
        Action: "dynamodb:GetItem",
        Resource: `arn:aws:dynamodb:${aws_region}:${aws_account_id}:table/${aws_dynamo_db_table_name}`,
      },
      {
        Effect: "Allow",
        Action: "dynamodb:PutItem",
        Resource: `arn:aws:dynamodb:${aws_region}:${aws_account_id}:table/${aws_dynamo_db_table_name}`,
      },
      {
        Effect: "Allow",
        Action: "dynamodb:UpdateItem",
        Resource: `arn:aws:dynamodb:${aws_region}:${aws_account_id}:table/${aws_dynamo_db_table_name}`,
      },
      // Add more policies as needed for superadmin role
    ],
  };

  try {
    const aws_identity_pool_id = await getIdentityPoolId(aws_identity_pool_name);
    // Create GuestRole
    const guestRoleParams = {
      AssumeRolePolicyDocument: JSON.stringify({
        Version: "2012-10-17",
        Statement: [
          {
            Effect: "Allow",
            Principal: {
              "Federated": "cognito-identity.amazonaws.com",
            },
            Action: "sts:AssumeRoleWithWebIdentity",
            Condition: {
              StringEquals: {
                "cognito-identity.amazonaws.com:aud": `${aws_identity_pool_id}`,
              },
              "ForAnyValue:StringLike": {
                "cognito-identity.amazonaws.com:amr": "unauthenticated",
              },
            },
          },
        ],
      }),
      RoleName: `${process.env.AWS_ROLE_GUEST}`,
    };
    iam.createI
    const guestRole = await iam.createRole(guestRoleParams).promise();
    console.log("Guest Role created:", guestRole.Role.RoleName);
    await attachPolicy(guestRole.Role.RoleName, guestPolicy);

    // Create AuthenticatedRole
    const authenticatedRoleParams = {
      AssumeRolePolicyDocument: JSON.stringify({
        Version: "2012-10-17",
        Statement: [
          {
            Effect: "Allow",
            Principal: {
              "Federated": "cognito-identity.amazonaws.com",
            },
            Action: "sts:AssumeRoleWithWebIdentity",
            Condition: {
              StringEquals: {
                "cognito-identity.amazonaws.com:aud": `${aws_identity_pool_id}`,
              },
              "ForAnyValue:StringLike": {
                "cognito-identity.amazonaws.com:amr": "authenticated",
              },
            },
          },
        ],
      }),
      RoleName: `${process.env.AWS_ROLE_AUTHENTICATED}`,
    };
    const authenticatedRole = await iam
      .createRole(authenticatedRoleParams)
      .promise();
    console.log("Authenticated Role created:", authenticatedRole.Role.RoleName);
    await attachPolicy(authenticatedRole.Role.RoleName, authenticatedPolicy);

    // Create SuperadminRole
    const superadminRoleParams = {
      AssumeRolePolicyDocument: JSON.stringify({
        Version: "2012-10-17",
        Statement: [
          {
            Effect: "Allow",
            Principal: {
              "Federated": "cognito-identity.amazonaws.com",
            },
            Action: "sts:AssumeRoleWithWebIdentity",
            Condition: {
              StringEquals: {
                "cognito-identity.amazonaws.com:aud": `${aws_identity_pool_id}`,
              },
              "ForAnyValue:StringLike": {
                "cognito-identity.amazonaws.com:amr": "authenticated",
              },
            },
          },
        ],
      }),
      RoleName: `${process.env.AWS_ROLE_ADMIN}`,
    };
    iam.createRole({
      AssumeRolePolicyDocument: {}
    })
    const superadminRole = await iam.createRole(superadminRoleParams).promise();
    console.log("Superadmin Role created:", superadminRole.Role.RoleName);
    await attachPolicy(superadminRole.Role.RoleName, superadminPolicy);
  } catch (err) {
    console.error("Error creating roles:", err);
  }
};

// Function to attach policies to the roles
async function attachPolicy(roleName, policy) {
  const iam = new AWS.IAM();
  try {
    const params = {
      PolicyDocument: JSON.stringify(policy),
      PolicyName: `${roleName}Policy`,
      RoleName: roleName,
    };
    await iam.putRolePolicy(params).promise();
    console.log(`Policy attached to ${roleName}`);
  } catch (err) {
    console.error(`Error attaching policy to ${roleName}:`, err);
  }
}

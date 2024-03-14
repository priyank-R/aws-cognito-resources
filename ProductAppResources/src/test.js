const {
  getUserPoolId,
  listUserPoolClients,
} = require("./helper");
module.exports = async function test() {
  const aws_user_pool_name = process.env.AWS_COGNITO_USER_POOL_NAME;
  const aws_user_pool_id = await getUserPoolId(aws_user_pool_name);
  const data = await listUserPoolClients(aws_user_pool_id);
  console.log(data);
};

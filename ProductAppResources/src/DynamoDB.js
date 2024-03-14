// src/DynamoDB.js
const AWS = require("aws-sdk");

module.exports = async function createTable() {
  const dynamoDB = new AWS.DynamoDB();
  const createTableParams = {
    TableName: process.env.AWS_DYNAMO_DB_TABLE_NAME,
    KeySchema: [{ AttributeName: "product_id", KeyType: "HASH" }],
    AttributeDefinitions: [
      { AttributeName: "product_id", AttributeType: "S" },
      // Add other attributes here
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5,
    },
  };
  dynamoDB.createTable(createTableParams, (err, data) => {
    if (err) console.error("Error creating table:", err);
    else console.log("Table created successfully:", data);
  });
}

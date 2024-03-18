import { DatabaseManager } from "db";
import { useState } from "react";

const Operations = () => {
  const dbManager = new DatabaseManager();
  const onNewRecord = async () => {
    try {
      await dbManager.createObject(
        process.env.REACT_APP_AWS_DYNAMO_DB_TABLE_NAME,
        {
          product_id: "45",
          product_name: "My new record",
        }
      );
      window.alert("New record added successfully !");
    } catch (e) {
      window.alert("Failed to create a new record");
    }
  };
  const onFetchRecords = async () => {
    window.alert(
      "This action will throw an error since we dont have SCAN permission"
    );
    let records = await dbManager.getAllObjects(
      process.env.REACT_APP_AWS_DYNAMO_DB_TABLE_NAME,
      ["product_id,product_name"]
    );
  };
  const onUpdateRecord = async () => {
    await dbManager.updateRecord(
      process.env.REACT_APP_AWS_DYNAMO_DB_TABLE_NAME,
      "product_id",
      "123",
      "product_name",
      { product_name: "new product name" }
    );
  };

  return (
    <div>
      <button onClick={onNewRecord}>Create new record</button>
      <br />
      <br />
      <button onClick={onFetchRecords}>Fetch all records</button>
      <br />
      <br />
      <button onClick={onUpdateRecord}>Update a record</button>
    </div>
  );
};

export default Operations;

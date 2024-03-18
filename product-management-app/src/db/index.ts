import { fetchAuthSession } from '@aws-amplify/auth';
import AWS, { DynamoDB } from 'aws-sdk';
import {handleError} from './error_handler';
import { Key } from 'aws-sdk/clients/dynamodb';
interface Credentials {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  sessionToken: string
}

export class DatabaseManager {
  private dynamoDBService: DynamoDB.DocumentClient = new AWS.DynamoDB.DocumentClient();
  private credential_type: 'amplify' | 'manual' = 'amplify'
  private credentials: Credentials | null = null

  constructor(credential_type?: 'amplify' | 'manual', credential_obj?: Credentials) {
    if (credential_type === 'manual' && credential_obj) {
      this.credentials = credential_obj
      this.configureDynamoDBService();
    } else {
      // Initialize DynamoDB service without explicit credentials (use default credentials provider chain)
      this.dynamoDBService = new AWS.DynamoDB.DocumentClient();
    }
  }

  private async configureDynamoDBService(): Promise<any> {
    // Configure DynamoDB service with provided credentials
    if (this.credential_type == 'manual') {
      AWS.config.update({
        accessKeyId: this.credentials?.accessKeyId,
        secretAccessKey: this.credentials?.secretAccessKey,
        region: this.credentials?.region ? this.credentials.region : 'us-east-1',
        sessionToken: this.credentials?.sessionToken
      });
    }
    if (this.credential_type == 'amplify') {
      const session = await fetchAuthSession()
      //@ts-ignore
      AWS.config.update({ ...session.credentials, region: process.env.REACT_APP_AWS_DEFAULT_REGION })
    }


    // Create DynamoDB service object
    this.dynamoDBService = new AWS.DynamoDB.DocumentClient();
  }

  public async createObject(tableName: string, item: any): Promise<void> {
    const params: DynamoDB.DocumentClient.Put = {
      TableName: tableName,
      Item: item
    };

    try {
      await this.configureDynamoDBService()
      await this.dynamoDBService.put(params).promise();
      console.log(`Object created successfully in table ${tableName}`);
    } catch (error: any) {
      handleError(error)

    }
  }

  public async deleteObject(tableName: string, key: any): Promise<void> {
    const params: DynamoDB.DocumentClient.Delete = {
      TableName: tableName,
      Key: key
    };

    try {
      await this.dynamoDBService.delete(params).promise();
      console.log(`Object deleted successfully from table ${tableName}`);
    } catch (error: any) {
      handleError(error)
    }
  }

  public async getObjectById(tableName: string, id_value: string, id_key: string = "Id"): Promise<any> {
    await this.configureDynamoDBService()
    const params: DynamoDB.DocumentClient.GetItemInput = {
      TableName: tableName,
      Key: { [id_key]: id_value }
    };

    try {
      const data = await this.dynamoDBService.get(params).promise();
      if (!data.Item) {
        throw new Error(`Item with ID ${id_value} not found in table ${tableName}`);
      }
      console.log(data)
      return { ...data.Item }
    } catch (error: any) {
      handleError(error)
    }
  }

  public async getAllObjects(tableName: string, fields?: string[], limit?: number, startKey?: any): Promise<{ items: any[], nextStartKey: Key | undefined }> {
    await this.configureDynamoDBService();
    const params: DynamoDB.DocumentClient.ScanInput = {
      TableName: tableName,
      ProjectionExpression: fields ? fields.join(', ') : undefined,
      Limit: limit,
      ExclusiveStartKey: startKey,
    };

    try {
      const data = await this.dynamoDBService.scan(params).promise();
      const items: any[] = data.Items || [];
      // If there are more records, return a start key for pagination
      const nextStartKey = data.LastEvaluatedKey;
      return { items, nextStartKey };
    } catch (error: any) {
      handleError(error);
      return { items: [], nextStartKey: undefined };
    }
  }
  public async updateRecord(TableName: string, IdKey: string, IdValue:string | number, PathToUpdate:string, ValueToUpdate:any): Promise<DynamoDB.DocumentClient.AttributeMap> {
    try {
      await this.configureDynamoDBService();
      let input = {
        TableName,
        Key: {
          [IdKey]: IdValue,
        },
        ...getUpdateParamsFromPath(PathToUpdate, ValueToUpdate),
        ReturnValues: 'NONE',
      };
      const { Attributes: updatedRecord } = await this.dynamoDBService.update(input).promise();
      return updatedRecord as DynamoDB.DocumentClient.AttributeMap;
    } catch (error: any) {
      handleError(error)
      return {}
    }
  }
}

export function getUpdateParamsFromPath(path: string, value: any) {
  let pathSegments = path.split('.')
  let _pathSegments = pathSegments.map((seg) => '#' + seg.replaceAll(/[ \/]/g, '_'))
  let result: any = {
    UpdateExpression:'',
    ExpressionAttributeNames: {},
    ExpressionAttributeValues: {}
  }

  pathSegments.forEach((seg, idx) => {
    result.ExpressionAttributeNames[_pathSegments[idx]] = seg
  })
  result.UpdateExpression = 'SET ' + _pathSegments.join('.') + ' = :value'
  result.ExpressionAttributeValues = { ':value': value }
  return result

}
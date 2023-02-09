import { DynamoDBClient, DynamoDB } from "@aws-sdk/client-dynamodb";
import { fromCognitoIdentity } from "@aws-sdk/credential-providers";
import * as dynamoose from "dynamoose";

export function createDynamooseInstance(
  custormerRoleArn: string,
  idJwtToken: string
) {
  const dynamooseInstance = new dynamoose.Instance();

  dynamooseInstance.aws.ddb.set(
    new DynamoDB({
      region: process.env.AWS_DYNAMODB_REGION,
      credentials: fromCognitoIdentity({
        identityId: process.env.AWS_COGNITO_IDENTITY_POOL_ID as string,
        customRoleArn: custormerRoleArn,
        logins: {
          [`cognito-idp.${process.env.AWS_COGNITO_REGION}.amazonaws.com/${process.env.AWS_COGNITO_USER_POOL_ID}`]:
            idJwtToken,
        },
      }),
    })
    // new DynamoDBClient({
    //   region: process.env.AWS_DYNAMODB_REGION,
    //   credentials: fromCognitoIdentity({
    //     identityId: process.env.AWS_COGNITO_IDENTITY_POOL_ID as string,
    //     customRoleArn: custormerRoleArn,
    //     logins: {
    //       [`cognito-idp.${process.env.AWS_COGNITO_REGION}.amazonaws.com/${process.env.AWS_COGNITO_USER_POOL_ID}`]:
    //         idJwtToken,
    //     },
    //   }),
    // })
  );

  return dynamooseInstance;
}

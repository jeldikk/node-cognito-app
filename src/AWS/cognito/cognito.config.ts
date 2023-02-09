import AWS from "aws-sdk";
import jwtDecode from "jwt-decode";
import {
  CognitoUser,
  CognitoUserAttribute,
  CognitoUserPool,
  ICognitoUserAttributeData,
  ICognitoUserData,
  ICognitoUserPoolData,
} from "amazon-cognito-identity-js";

AWS.config.region = process.env.AWS_COGNITO_REGION;
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
  IdentityPoolId: process.env.AWS_COGNITO_IDENTITY_POOL_ID as string,
});

export const userPoolData: ICognitoUserPoolData = {
  UserPoolId: process.env.AWS_COGNITO_USER_POOL_ID as string,
  ClientId: process.env.AWS_COGNITO_CLIENT_ID as string,
};

export const UserPool = new CognitoUserPool(userPoolData);

export function createCognitoUser(username: string): CognitoUser {
  const data: ICognitoUserData = {
    Username: username,
    Pool: UserPool,
  };
  return new CognitoUser(data);
}

export function createCognitoUserAttribute(
  name: string,
  value: string
): CognitoUserAttribute {
  const data: ICognitoUserAttributeData = {
    Name: name,
    Value: value,
  };
  return new CognitoUserAttribute(data);
}

export function createCognitoUserAttributeList(attributes: {
  [key: string]: any;
}): CognitoUserAttribute[] {
  return Object.entries(attributes).map(([key, value]) =>
    createCognitoUserAttribute(key, value)
  );
}

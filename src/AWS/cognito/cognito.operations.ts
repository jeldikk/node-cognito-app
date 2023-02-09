import util from "util";
import { createCognitoUser, UserPool, userPoolData } from "./cognito.config";
import {
  CognitoUserAttribute,
  IAuthenticationDetailsData,
  ISignUpResult,
  AuthenticationDetails,
  IAuthenticationCallback,
} from "amazon-cognito-identity-js";

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  fromCognitoIdentity,
  FromCognitoIdentityParameters,
} from "@aws-sdk/credential-providers";
import { LoginsList } from "aws-sdk/clients/cognitoidentity";

// const dynamoDb = new DynamoDBClient({
//   region: process.env.AWS_DYNAMODB_REGION,
//   credentials: fromCognitoIdentity({
//     identityId: process.env.AWS_COGNITO_IDENTITY_POOL_ID as string,
//     customRoleArn: "arn role from token payload",
//     logins: [
//       `cognito-idp.${process.env.AWS_COGNITO_REGION}.amazonaws.com/${process.env.AWS_COGNITO_USER_POOL_ID}`:
//     ],
//   }),
// });

export async function SignUp(
  username: string,
  password: string,
  attribList?: CognitoUserAttribute[]
): Promise<ISignUpResult | undefined> {
  const signUpPromise = util.promisify(UserPool.signUp).bind(UserPool);
  try {
    const signUpResult = await signUpPromise(
      username,
      password,
      attribList || [],
      []
    );
    return signUpResult;
  } catch (err) {
    // console.log(.message);
    console.log(err);
    // throw new Error(err);
  }
}

export async function SignIn(
  username: string,
  password: string,
  callbacks: IAuthenticationCallback
) {
  const data: IAuthenticationDetailsData = {
    Username: username,
    Password: password,
  };
  const authDetails = new AuthenticationDetails(data);
  const cognitoUser = createCognitoUser(username);
  // const callbacks: IAuthenticationCallback;
  // cognitoUser.authenticateUser(authDetails, {
  //   onSuccess: (session, confirmNecessary) => {
  //     console.log({ session, confirmNecessary });
  //     const idTokenPayload = session.getIdToken().payload;
  //     //   const idToken = session.getIdToken().getJwtToken();
  //     const accessTokenPayload = session.getAccessToken().payload;
  //     console.log({ idTokenPayload, accessTokenPayload });
  //   },
  //   onFailure: (err) => {
  //     console.log("Error occured while authenticating an user");
  //     console.log((err as Error).message);
  //   },
  // });
  cognitoUser.authenticateUser(authDetails, callbacks);
}

export async function SignOut(username: string) {
  const cognitoUser = createCognitoUser(username);
  const signOutPromise = util.promisify(cognitoUser.signOut).bind(cognitoUser);
  try {
    await signOutPromise();
  } catch (err) {
    throw new Error((err as Error).message);
  }
}

export async function deleteUser(username: string) {
  const cognitoUser = createCognitoUser(username);
  const deleteUserPromise = util
    .promisify(cognitoUser.deleteUser)
    .bind(cognitoUser);
  try {
    const result = await deleteUserPromise();
    return result;
  } catch (err) {
    throw new Error((err as Error).message);
  }
}

export async function resendConfirmationCode(username: string) {
  const cognitoUser = createCognitoUser(username);
  const asyncOperation = util
    .promisify(cognitoUser.resendConfirmationCode)
    .bind(cognitoUser);

  const result = await asyncOperation();
  console.log({ result });
  return result;
}

export async function confirmUserByCode(username: string, code: string) {
  const cognitoUser = createCognitoUser(username);
  const asyncOperation = util
    .promisify(cognitoUser.confirmRegistration)
    .bind(cognitoUser);
  try {
    const result = await asyncOperation(code, true);
    console.log({ result });
    return result;
  } catch (err) {
    throw new Error((err as Error).message);
  }
}

export async function listUsersInUserPool() {}

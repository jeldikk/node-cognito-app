import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import bodyParser from "body-parser";
import * as dynamoose from "dynamoose";
dotenv.config();

import {
  confirmUserByCode,
  deleteUser,
  resendConfirmationCode,
  SignIn,
  SignOut,
  SignUp,
} from "./AWS/cognito/cognito.operations";
import { createCognitoUserAttribute } from "./AWS/cognito/cognito.config";
import {
  CognitoUserSession,
  IAuthenticationCallback,
} from "amazon-cognito-identity-js";
import { createDynamooseInstance } from "./AWS/dynamo-db/dynamod-db.config";
import { createUserModelWithInstance } from "./models/user.model";

const app: Express = express();
const port = process.env.SERVER_PORT;

app.use(morgan("dev"));
app.use(bodyParser.urlencoded());
app.use(bodyParser.json());

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "success message is being sent",
  });
});

app.post("/signup", async (req: Request, res: Response) => {
  const { username, password, details } = req.body;
  const attributeList = Object.entries(details).map(([key, value]) =>
    createCognitoUserAttribute(key, value as string)
  );
  const signUpResult = await SignUp(username, password, attributeList);
  signUpResult?.user.resendConfirmationCode((err, metadata) => {
    if (err) {
      console.log(err);
      return;
    }
    console.log({ metadata });
  });
  console.log({ signUpResult });
  res.status(200).json({
    status: "success",
  });
});

app.post("/login", async (req: Request, res: Response) => {
  const { username, password } = req.body;
  const callbacks: IAuthenticationCallback = {
    onSuccess: (session: CognitoUserSession) => {
      // console.log({ session });
      // console.log(session.getIdToken().decodePayload());
      res.status(200).json({
        status: "success",
        tokens: {
          idToken: session.getIdToken(),
          accessToken: session.getAccessToken(),
          refreshToken: session.getRefreshToken(),
        },
      });
    },
    onFailure: (err) => {
      console.log(err);
      res.status(200).json({
        status: "error",
        message: (err as Error).message,
      });
    },
  };
  await SignIn(username, password, callbacks);
});

app.post("/logout/:username", async (req: Request, res: Response) => {
  const { username } = req.params;
  try {
    await SignOut(username);
  } catch (err) {}
});

app.post(
  "/resend-confirmation/:username",
  async (req: Request, res: Response) => {
    const { username } = req.params;
    const result = await resendConfirmationCode(username);
    res.status(200).json({
      result,
    });
  }
);

app.delete("/delete-user/:username", async (req: Request, res: Response) => {
  const { username } = req.params;
  try {
    const result = await deleteUser(username);
    res.status(200).json({
      status: "success",
      message: result,
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: (err as Error).message,
    });
  }
});

app.post("/confirm-user/:username", async (req: Request, res: Response) => {
  const { username } = req.params;
  const { code } = req.body;
  try {
    const result = await confirmUserByCode(username, code);
    res.status(200).json({
      result,
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: (err as Error).message,
    });
  }
});

app.get("/instances", async (req: Request, res: Response) => {
  console.log({ instances: dynamoose.aws });
  // dynamoose.aws.ddb = createDbInstance();
  const db = createDynamooseInstance("arn-string", "jwt-token");
  console.log({ db });
  // const UserModel = createUserModelWithInstance(db, "Users");
  try {
    // const createPromise = await UserTable.create();
    // const user = new UserModel({
    //   id: "initial_id",
    //   age: 34,
    // });
    // // console.log({ createPromise });
    // const response = await user.save();
    // console.log({ response });
    res.status(200).json({
      status: "success",
      message: "this is the success message",
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "there is error in creating table",
    });
  }
});

// app.post("/c")

app.listen(port, () => console.log("listening server on port ", port));

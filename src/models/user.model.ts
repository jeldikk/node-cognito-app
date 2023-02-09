import { DynamodbDataSourceConfig } from "aws-sdk/clients/appsync";
import * as dynamoose from "dynamoose";
import { Instance } from "dynamoose/dist/Instance";
import { Schema } from "dynamoose/dist/Schema";

const userSchema = new dynamoose.Schema(
  {
    id: String,
    age: {
      type: Number,
      default: 5,
    },
  },
  {
    saveUnknown: true,
    timestamps: true,
  }
);

// export const UserModel = dynamoose.model("User", userSchema);

// export const UserTable = new dynamoose.Table("Users", [UserModel], {
//   initialize: true,
// });

export function createUserModelWithInstance(
  instance: typeof dynamoose,
  name: string,
  schema?: Schema[]
) {
  return instance.model(name, userSchema);
}

console.log(dynamoose.Table.defaults);

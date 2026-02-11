import { DB_URI } from "../../config/config.service.js";
import { UserModel } from "./model/user.model.js";
import mongoose from "mongoose";
export const authenticateDB = async () => {
  try {
    const databaseConnectionResult = await mongoose.connect(DB_URI, {
      serverSelectionTimeoutMS: 5000, 
    });
    await UserModel.syncIndexes() //this is to sync the indexes in the database with the schema defined in the model, it will create indexes if they are not present in the database and also update the existing indexes if there are any changes in the schema
    //console.log({ databaseConnectionResult });
    console.log(`DataBase connected successfully`);

  } catch (error) {
    console.log(`Database Connection Failed ${error}`);
  }
};

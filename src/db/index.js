//connect the db index.js to mongodb atlas


import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {  //bd is on other continent
  try {
  const connectionInstance=  await mongoose.connect
  (`${process.env.MONGODB_URI}/${DB_NAME}`)
  console.log(`\n mongoDB connected !! DB HOST: ${connectionInstance.connection.host}`)
//   console.log(connectionInstance);
  } catch (error) {
    console.log("MONGOOSE connection error", error);
    process.exit(1);
  }
};
export default connectDB;
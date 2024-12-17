import mongoose from "mongoose";
const dotenv = await import("dotenv");
import("dotenv").then(({ config }) => config());

const ConnectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log(`MongoDB is Connected on backend`);
  } catch (error) {
    console.error(error.message);
  }
};

export default ConnectDB;

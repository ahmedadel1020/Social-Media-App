import mongoose from "mongoose";
import { DB_URI } from "../config";
import type { Application } from "express";
export const testConnection = async (app: Application, port: number) => {
  try {
    await mongoose.connect(DB_URI, { serverSelectionTimeoutMS: 30000 });
    console.log("db connect successfully");
    app.listen(port, () => console.log(`app is running on ${port}`));
  } catch (error) {
    console.log("failed to connect on DB");
    console.log(error);
  }
};

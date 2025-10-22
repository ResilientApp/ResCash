import mongoose from "mongoose";

const connectMongo = async ({ uri, dbName }) => {
  if (!uri) {
    throw new Error("MongoDB connection uri is required");
  }

  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(uri, dbName ? { dbName } : undefined);
  }

  return mongoose.connection;
};

export default connectMongo;

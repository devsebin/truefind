import mongoose from "mongoose";
import { MongoMemoryReplSet } from "mongodb-memory-server";

let mongo: MongoMemoryReplSet;

export const connectDB = async () => {
  if (mongoose.connection.readyState === 1) return;

  mongo = await MongoMemoryReplSet.create({
    replSet: {
      count: 1,
    },
  });

  const uri = mongo.getUri();
  mongoose.set("strictQuery", false);
  await mongoose.connect(uri);
};

export const clearDB = async () => {
  const collections = mongoose.connection.collections;

  for (const key in collections) {
    await collections[key].deleteMany({});
  }
};

export const closeDB = async () => {
  // Make shutdown deterministic for jest: avoid long dropDatabase calls.
  try {
    await mongoose.connection.close();
  } finally {
    if (mongo) {
      await mongo.stop();
    }
  }
};

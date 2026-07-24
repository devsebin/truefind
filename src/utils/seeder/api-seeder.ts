import mongoose from "mongoose";
import dotenv from "dotenv";
import { seedActivity } from "./seeder-source/api-seeder";
dotenv.config();

const MONGO_PATH = process.env.MONGO_PATH as string;

const seedDatabase = async () => {
  try {
    mongoose.set("strictQuery", false);
    await mongoose.connect(MONGO_PATH as string, {
      readPreference: "primary",
      writeConcern: { w: "majority", j: true, wtimeout: 5000 },
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    // Call your seed functions
    await seedActivity();

    console.log("API Seeding complete!");
    process.exit();
  } catch (error) {
    console.error("Error during seeding:", error);
    process.exit(1);
  }
};

seedDatabase();

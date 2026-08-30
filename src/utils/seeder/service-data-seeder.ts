import mongoose from "mongoose";
import dotenv from "dotenv";
import { seedServices } from "./seeder-source/services-seeder";
import { seedRole } from "./seeder-source/role-seeder";
dotenv.config();

const MONGO_PATH = process.env.MONGO_PATH as string;

if (!MONGO_PATH) throw new Error("MONGO_PATH is not defined");

const runServiceSeeder = async () => {
  try {
    mongoose.set("strictQuery", false);
    await mongoose.connect(MONGO_PATH as string, {
      readPreference: "primary",
      writeConcern: { w: "majority", j: true, wtimeout: 5000 },
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log("Loading roles...");
    const RolesModel = (await import("../../database/roles/roles-db-model")).default;
    let roles = await RolesModel.find({});
    if (roles.length === 0) {
      await seedRole();
      roles = await RolesModel.find({});
    }
    (global as any).rolesCookie = roles;

    console.log("Seeding Categories, Subcategories & Services...");
    await seedServices();

    console.log("Services Seeding complete!");
    process.exit(0);
  } catch (error) {
    console.error("Error during services seeding:", error);
    process.exit(1);
  }
};

runServiceSeeder();

import mongoose from "mongoose";
import { seedRole } from "./seeder-source/role-seeder";
import { seedUser } from "./seeder-source/user-seeder";
import { seedStatus } from "./seeder-source/status-seeder";
import { seedServiceStatus } from "./seeder-source/service-status-seeder";
import { seedBundleStatus } from "./seeder-source/bundle-statuses-seeder";
import { seedBundleUserMappingStatus } from "./seeder-source/bundle-user-mapping-status-seeder";
import { seedBundleLocationConfigStatus } from "./seeder-source/bundle-location-config-statuses-seeder";
import dotenv from "dotenv";
dotenv.config();

const MONGO_PATH = process.env.MONGO_PATH as string; // Replace with your DB URI

if (!MONGO_PATH) throw new Error("MONGO_PATH is not defined"); // Debugging line to check the URI

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
    const database = mongoose.connection.db;
    if (!database) {
      throw new Error("Database connection failed");
    }
    const collections = await database.listCollections().toArray();
    // delete all collections
    for (const collection of collections) {
      await database.dropCollection(collection.name);
    }

    await seedRole();
    const RolesModel = (await import("../../database/roles/roles-db-model")).default;
    const roles = await RolesModel.find({});
    (global as any).rolesCookie = roles;

    await seedUser();
    await seedStatus();
    await seedServiceStatus();
    await seedBundleStatus();
    await seedBundleUserMappingStatus();
    await seedBundleLocationConfigStatus();

    console.log("Seeding complete!");
    process.exit();
  } catch (error) {
    console.error("Error during seeding:", error);
    process.exit(1);
  }
};

seedDatabase();

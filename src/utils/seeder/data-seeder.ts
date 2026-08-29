import mongoose from "mongoose";
import { seedRole } from "./seeder-source/role-seeder";
import { seedUser } from "./seeder-source/user-seeder";
import { seedStatus } from "./seeder-source/status-seeder";
import { seedServiceStatus } from "./seeder-source/service-status-seeder";
import { seedPriority } from "./seeder-source/priority-seeder";
import { seedUnit } from "./seeder-source/unit-seeder";
import { seedCurrency } from "./seeder-source/currency-seeder";
import { seedLocations } from "./seeder-source/location-seeder";
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

    console.log("Seeding Roles...");
    await seedRole();
    const RolesModel = (await import("../../database/roles/roles-db-model")).default;
    const roles = await RolesModel.find({});
    (global as any).rolesCookie = roles;

    console.log("Seeding Statuses...");
    await seedStatus();

    console.log("Seeding Priorities...");
    await seedPriority();

    console.log("Seeding Users...");
    await seedUser();

    console.log("Seeding Units...");
    await seedUnit();

    console.log("Seeding Currencies...");
    await seedCurrency();

    console.log("Seeding Locations (Countries, Regions, Districts, Suburbs)...");
    await seedLocations();

    console.log("Seeding Service Statuses...");
    await seedServiceStatus();

    console.log("Seeding complete!");
    process.exit();
  } catch (error) {
    console.error("Error during seeding:", error);
    process.exit(1);
  }
};

seedDatabase();

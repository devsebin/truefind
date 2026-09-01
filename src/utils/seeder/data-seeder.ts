import mongoose from "mongoose";
import dotenv from "dotenv";
import { seedRole } from "./seeder-source/role-seeder";
import { seedUser } from "./seeder-source/user-seeder";
import { seedStatus } from "./seeder-source/status-seeder";
import { seedServiceStatus } from "./seeder-source/service-status-seeder";
import { seedPriority } from "./seeder-source/priority-seeder";
import { seedUnit } from "./seeder-source/unit-seeder";
import { seedCurrency } from "./seeder-source/currency-seeder";
import { seedLocations } from "./seeder-source/location-seeder";
import { seedServices } from "./seeder-source/services-seeder";
import { seedEnablementPolicies } from "./seeder-source/enablement-policy-seeder";
dotenv.config();

const MONGO_PATH = process.env.MONGO_PATH as string;

if (!MONGO_PATH) throw new Error("MONGO_PATH is not defined");

// Map of available seeders by name / alias / url slug
const SEEDER_MAP: Record<string, { label: string; fn: () => Promise<any> }> = {
  roles: { label: "Roles", fn: seedRole },
  role: { label: "Roles", fn: seedRole },
  
  statuses: { label: "Statuses", fn: seedStatus },
  status: { label: "Statuses", fn: seedStatus },
  
  priorities: { label: "Priorities", fn: seedPriority },
  priority: { label: "Priorities", fn: seedPriority },
  
  users: { label: "Users", fn: seedUser },
  user: { label: "Users", fn: seedUser },
  
  units: { label: "Units", fn: seedUnit },
  unit: { label: "Units", fn: seedUnit },
  
  currencies: { label: "Currencies", fn: seedCurrency },
  currency: { label: "Currencies", fn: seedCurrency },
  
  locations: { label: "Locations (Countries, Regions, Districts, Suburbs)", fn: seedLocations },
  location: { label: "Locations (Countries, Regions, Districts, Suburbs)", fn: seedLocations },
  countries: { label: "Locations (Countries, Regions, Districts, Suburbs)", fn: seedLocations },
  country: { label: "Locations (Countries, Regions, Districts, Suburbs)", fn: seedLocations },
  
  "service-statuses": { label: "Service Statuses", fn: seedServiceStatus },
  "service-status": { label: "Service Statuses", fn: seedServiceStatus },
  
  services: { label: "Categories, Subcategories & Services", fn: seedServices },
  service: { label: "Categories, Subcategories & Services", fn: seedServices },
  categories: { label: "Categories, Subcategories & Services", fn: seedServices },
  category: { label: "Categories, Subcategories & Services", fn: seedServices },

  enablement: { label: "Enablement Policies", fn: seedEnablementPolicies },
  "enablement-policies": { label: "Enablement Policies", fn: seedEnablementPolicies },
  policies: { label: "Enablement Policies", fn: seedEnablementPolicies },
  policy: { label: "Enablement Policies", fn: seedEnablementPolicies },
};

const ensureRolesAndCookies = async () => {
  const RolesModel = (await import("../../database/roles/roles-db-model")).default;
  let roles = await RolesModel.find({});
  if (roles.length === 0) {
    console.log("Auto-initializing roles for cookie resolution...");
    await seedRole();
    roles = await RolesModel.find({});
  }
  (global as any).rolesCookie = roles;
};

const runSeeder = async () => {
  // Read target argument (e.g. npm run seed:data services OR npm run seed:data "services")
  const rawArg = process.argv.slice(2).join(" ").trim().toLowerCase();
  // Normalize target: remove leading slashes, quotes, or whitespace
  const target = rawArg.replace(/^[/"]+|[/" ]+$/g, "");

  try {
    mongoose.set("strictQuery", false);
    await mongoose.connect(MONGO_PATH, {
      readPreference: "primary",
      writeConcern: { w: "majority", j: true, wtimeout: 5000 },
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    // If no specific target provided or 'all' is passed, run everything (full reset)
    if (!target || target === "all") {
      console.log("No specific target provided. Running FULL database seeder reset...");
      const database = mongoose.connection.db;
      if (!database) {
        throw new Error("Database connection failed");
      }
      const collections = await database.listCollections().toArray();
      for (const collection of collections) {
        await database.dropCollection(collection.name);
      }

      console.log("Seeding Roles...");
      await seedRole();
      await ensureRolesAndCookies();

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

      console.log("Seeding Categories, Subcategories & Services...");
      await seedServices();

      console.log("Seeding Enablement Policies...");
      await seedEnablementPolicies();

      console.log("Full Database Seeding complete!");
      process.exit(0);
    }

    // Check if target is supported
    const seeder = SEEDER_MAP[target];
    if (!seeder) {
      console.error(`\nUnknown seeder target: "${target}"`);
      console.log("\nAvailable targets:");
      const uniqueTargets = Array.from(new Set(Object.values(SEEDER_MAP).map((s) => s.label)));
      uniqueTargets.forEach((name) => console.log(`  - ${name}`));
      console.log("\nUsage examples:");
      console.log('  npm run seed:data services');
      console.log('  npm run seed:data "locations"');
      console.log('  npm run seed:data "units"');
      console.log('  npm run seed:data "currencies"');
      console.log('  npm run seed:data "priorities"');
      console.log('  npm run seed:data "roles"');
      console.log('  npm run seed:data "statuses"');
      console.log('  npm run seed:data "all"');
      process.exit(1);
    }

    await ensureRolesAndCookies();

    console.log(`\nExecuting target seeder: [${seeder.label}]...`);
    await seeder.fn();
    console.log(`[${seeder.label}] Seeding complete!\n`);

    process.exit(0);
  } catch (error) {
    console.error("Error during seeding:", error);
    process.exit(1);
  }
};

runSeeder();

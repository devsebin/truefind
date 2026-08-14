import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(__dirname, "../.env") });

import ServiceAreaConfigurationModel from "../src/database/service-area-configuration/service-area-configuration.model";
import ServiceCountryConfigurationModel from "../src/database/service-country-configuration/service-country-configuration.model";
import SuburbModel from "../src/database/suburbs/suburbs-db-model";
import { ServiceModel } from "../src/database/services/services-db-model";

async function run() {
  const mongoUri = (process.env.MONGO_PATH || "").trim().replace(/['"]/g, "");
  console.log("Connecting to:", mongoUri);
  await mongoose.connect(mongoUri);

  try {
    // 1. Fetch all service area configurations
    const areaConfigs = await ServiceAreaConfigurationModel.find({ is_deleted: false });
    console.log(`\nFound ${areaConfigs.length} non-deleted service area configurations:`);
    for (const ac of areaConfigs) {
      console.log(`- ID: ${ac._id}, Service: ${ac.service_id}, Suburb: ${ac.suburb_id}, Active: ${ac.is_active}`);
    }

    // 2. Fetch suburbs
    const suburbs = await SuburbModel.find({ is_deleted: false });
    console.log(`\nFound ${suburbs.length} non-deleted suburbs:`);
    for (const sub of suburbs) {
      console.log(`- Suburb ID: ${sub._id}, Name: ${sub.name}, Country ID: ${sub.country_id}`);
    }

    // 3. Fetch country configs
    const countryConfigs = await ServiceCountryConfigurationModel.find({ is_deleted: false });
    console.log(`\nFound ${countryConfigs.length} non-deleted country configurations:`);
    for (const cc of countryConfigs) {
      console.log(`- Service: ${cc.service_id}, Country: ${cc.country_id}, Active: ${cc.is_active}`);
    }

    // 4. Fetch services
    const services = await ServiceModel.find({ is_deleted: false });
    console.log(`\nFound ${services.length} non-deleted services:`);
    for (const s of services) {
      console.log(`- Service ID: ${s._id}, Name: ${s.name}, Active: ${s.is_active}`);
    }

  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

run();

import { faker } from "@faker-js/faker";
import mongoose from "mongoose";

export const buildSuburbPayload = (overrides: any = {}) => ({
  name: faker.location.city() + " " + faker.string.alphanumeric(5),
  code: faker.string.alpha({ length: 3 }).toUpperCase() + faker.string.alphanumeric(2),
  country_id: new mongoose.Types.ObjectId().toString(),
  region_id: new mongoose.Types.ObjectId().toString(),
  district_id: new mongoose.Types.ObjectId().toString(),
  post_code: faker.location.zipCode(),
  latitude: faker.location.latitude(),
  longitude: faker.location.longitude(),
  ...overrides,
});

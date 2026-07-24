import { faker } from "@faker-js/faker";
import mongoose from "mongoose";

export const buildDistrictPayload = (overrides: any = {}) => ({
  name: faker.location.city() + " " + faker.string.alphanumeric(5), // ensure uniqueness
  code: faker.string.alpha({ length: 3 }).toUpperCase() + faker.string.alphanumeric(2),
  country_id: new mongoose.Types.ObjectId().toString(),
  region_id: new mongoose.Types.ObjectId().toString(),
  ...overrides,
});

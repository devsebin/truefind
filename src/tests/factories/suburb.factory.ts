import { faker } from "@faker-js/faker";
import mongoose from "mongoose";

export const buildSuburbPayload = (overrides: any = {}) => {
  const lat = faker.location.latitude();
  const lon = faker.location.longitude();
  const delta = 0.001;
  return {
    name: faker.location.city() + " " + faker.string.alphanumeric(5),
    code: faker.string.alpha({ length: 3 }).toUpperCase() + faker.string.alphanumeric(2),
    country_id: new mongoose.Types.ObjectId().toString(),
    region_id: new mongoose.Types.ObjectId().toString(),
    district_id: new mongoose.Types.ObjectId().toString(),
    post_code: faker.location.zipCode(),
    boundary: {
      type: "Polygon",
      coordinates: [[
        [lon, lat],
        [lon + delta, lat],
        [lon + delta, lat + delta],
        [lon, lat + delta],
        [lon, lat]
      ]]
    },
    ...overrides,
  };
};

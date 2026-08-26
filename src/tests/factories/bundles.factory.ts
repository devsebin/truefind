import { faker } from "@faker-js/faker";
import mongoose from "mongoose";

export const buildBundlePayload = (overrides: any = {}) => ({
  name: faker.commerce.productName() + " " + faker.string.alphanumeric(4),
  display_name: faker.commerce.product() + " Display",
  code: (faker.string.alphanumeric(6) + "_" + faker.string.alphanumeric(4)).toUpperCase(),
  description: faker.commerce.productDescription(),
  icon: new mongoose.Types.ObjectId().toString(),
  sort_order: faker.number.int({ min: 0, max: 100 }),
  tags: [faker.word.sample(), faker.word.sample()],
  metadata: { tier: "standard" },
  ...overrides,
});

import { faker } from "@faker-js/faker";
import { declaimerKeys } from "@/resources/v1/masters/declaimers/declaimers.validator";
import mongoose from "mongoose";

export const buildDeclaimerPayload = (overrides: any = {}) => ({
  key: faker.helpers.arrayElement(Object.values(declaimerKeys)),
  title: faker.lorem.words(3),
  content: faker.lorem.paragraphs(2),
  language: "en",
  country: new mongoose.Types.ObjectId().toString(),
  metadata: {},
  ...overrides,
});

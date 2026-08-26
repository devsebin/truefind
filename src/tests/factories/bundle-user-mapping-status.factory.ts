import { faker } from "@faker-js/faker";

export const buildBundleUserMappingStatusPayload = (overrides: any = {}) => ({
  title: faker.word.noun() + " " + faker.string.alphanumeric(5),
  label: faker.word.adjective().toLowerCase() + "_" + faker.string.alphanumeric(5).toLowerCase(),
  color: faker.color.rgb(),
  is_default: false,
  ...overrides,
});

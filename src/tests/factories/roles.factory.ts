import { faker } from "@faker-js/faker";

export const buildRolesPayload = (overrides: any = {}) => ({
  title: faker.word.noun(),
  label: faker.word.adjective().toLowerCase(),
  dimension: faker.word.noun(),
  color: faker.color.rgb(),
  is_default: false,
  ...overrides,
});

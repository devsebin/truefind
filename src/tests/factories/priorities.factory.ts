import { faker } from "@faker-js/faker";

export const buildPrioritiesPayload = (overrides: any = {}) => ({
  title: faker.word.noun(),
  label: faker.word.adjective().toLowerCase(),
  color: faker.color.rgb(),
  is_default: false,
  ...overrides,
});

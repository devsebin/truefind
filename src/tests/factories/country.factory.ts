import { faker } from "@faker-js/faker";

export const buildCountryPayload = (overrides: any = {}) => ({
  name: faker.location.country(),
  iso_code: faker.string.alpha({ length: 2 }).toUpperCase(),
  iso_code_3: faker.string.alpha({ length: 3 }).toUpperCase(),
  phone_code: `+${faker.number.int({ min: 1, max: 999 })}`,
  currency: faker.finance.currencyCode(),
  continent: faker.location.continent(),
  timezone: faker.location.timeZone(),
  ...overrides,
});

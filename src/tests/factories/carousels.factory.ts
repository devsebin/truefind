import { faker } from "@faker-js/faker";

export const buildCarouselPayload = (overrides: any = {}) => ({
  slideType: "promotion",
  title: faker.commerce.productName(),
  description: faker.commerce.productDescription(),
  image: faker.image.url(),
  target: {
    type: "everyone",
  },
  button: {
    text: "Click Here",
    action: "navigate",
    url: faker.internet.url(),
  },
  colorPattern: {
    primary: faker.color.rgb(),
    secondary: faker.color.rgb(),
  },
  ...overrides,
});

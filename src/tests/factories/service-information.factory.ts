import { faker } from "@faker-js/faker";
import { Types } from "mongoose";

export const buildServiceInformationPayload = (overrides: any = {}) => ({
  service_id: new Types.ObjectId().toString(),
  how_it_works: [
    {
      step: 1,
      title: faker.lorem.words(3),
      description: faker.lorem.sentence(),
      sort_order: 1,
    },
    {
      step: 2,
      title: faker.lorem.words(3),
      description: faker.lorem.sentence(),
      sort_order: 2,
    },
  ],
  included_items: [
    {
      title: faker.lorem.words(2),
      description: faker.lorem.sentence(),
      sort_order: 1,
    },
    {
      title: faker.lorem.words(2),
      description: faker.lorem.sentence(),
      sort_order: 2,
    },
  ],
  insurance_coverage: {
    enabled: true,
    title: "Full Coverage Guarantee",
    description: faker.lorem.sentence(),
    coverage_items: ["Accidental Damage", "Public Liability"],
    disclaimer: "Terms and conditions apply.",
    sort_order: 1,
  },
  faqs: [
    {
      question: faker.lorem.sentence() + "?",
      answer: faker.lorem.paragraph(),
      sort_order: 1,
    },
    {
      question: faker.lorem.sentence() + "?",
      answer: faker.lorem.paragraph(),
      sort_order: 2,
    },
  ],
  disclaimers: [
    {
      title: "General Disclaimer",
      content: faker.lorem.paragraph(),
      sort_order: 1,
    },
  ],
  ...overrides,
});

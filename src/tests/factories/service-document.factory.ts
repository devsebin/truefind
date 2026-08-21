import { faker } from "@faker-js/faker";
import { Types } from "mongoose";

export const buildServiceDocumentPayload = (overrides: any = {}) => ({
  name: `${faker.word.noun()}_${faker.string.alphanumeric(5)}`,
  display_name: faker.company.name(),
  item_code: `DOC_${faker.string.alphanumeric(8).toUpperCase()}`,
  document_type_id: new Types.ObjectId().toString(),
  description: faker.lorem.sentence(),
  max_file_size: faker.number.int({ min: 1, max: 20 }),
  accepted_mimeTypes: ["application/pdf", "image/jpeg", "image/png"],
  samples: [],
  data_requirements: [
    {
      field_name: "document_number",
      display_label: "Document Number",
      data_type: "string",
      validation_rules: {
        required: true,
      },
    },
  ],
  ...overrides,
});

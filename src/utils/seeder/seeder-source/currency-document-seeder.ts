import DocumentModel from "../../../database/documents/documents-db-model";
import User from "../../../database/users/users-db-model";
import { getRoleId } from "../seeder-cookie";

export const seedCurrencyDocuments = async (): Promise<Record<string, any>> => {
  const user = await User.findOne({ role: getRoleId("super_admin") });
  const userId = user ? user._id : undefined;

  const currencySymbols = [
    { code: "USD", name: "US Dollar Symbol ($)" },
    { code: "NZD", name: "NZ Dollar Symbol (NZ$)" },
    { code: "AUD", name: "AU Dollar Symbol (A$)" },
    { code: "EUR", name: "Euro Symbol (€)" },
    { code: "GBP", name: "British Pound Symbol (£)" },
    { code: "CAD", name: "Canadian Dollar Symbol (C$)" },
    { code: "JPY", name: "Japanese Yen Symbol (¥)" },
    { code: "INR", name: "Indian Rupee Symbol (₹)" },
    { code: "SGD", name: "Singapore Dollar Symbol (S$)" },
    { code: "AED", name: "UAE Dirham Symbol (د.إ)" },
  ];

  const symbolDocumentMap: Record<string, any> = {};

  for (const item of currencySymbols) {
    let doc = await DocumentModel.findOne({ name: item.name });
    if (!doc) {
      doc = await DocumentModel.create({
        name: item.name,
        document_type: "icon",
        content_type: "image/svg+xml",
        keys: {
          original: `currency-symbols/${item.code.toLowerCase()}.svg`,
          thumbnails: [],
          webpThumbnails: [],
        },
        unsigned_urls: {
          original: `https://assets.trufindo.com/currency/${item.code.toLowerCase()}.svg`,
          thumbnails: [],
          webpThumbnails: [],
        },
        is_active: true,
        is_deleted: false,
        created_by: userId,
      });
    }
    symbolDocumentMap[item.code] = doc._id;
  }

  return symbolDocumentMap;
};

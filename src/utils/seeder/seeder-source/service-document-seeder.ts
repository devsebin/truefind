import DocumentModel from "../../../database/documents/documents-db-model";
import User from "../../../database/users/users-db-model";
import { getRoleId } from "../seeder-cookie";

export const seedServiceDocuments = async (): Promise<Record<string, any>> => {
  const user = await User.findOne({ role: getRoleId("super_admin") });
  const userId = user ? user._id : undefined;

  const serviceIcons = [
    // Categories
    { key: "home_cleaning", name: "Home Cleaning Icon" },
    { key: "plumbing", name: "Plumbing Icon" },
    { key: "electrical", name: "Electrical Icon" },
    { key: "landscaping", name: "Landscaping & Gardening Icon" },
    // Subcategories & Services
    { key: "deep_cleaning", name: "Deep Cleaning Icon" },
    { key: "regular_cleaning", name: "Regular Cleaning Icon" },
    { key: "pipe_repair", name: "Pipe Repair Icon" },
    { key: "drain_cleaning", name: "Drain Cleaning Icon" },
    { key: "wiring", name: "Wiring & Rewiring Icon" },
    { key: "lighting", name: "Lighting Installation Icon" },
    { key: "lawn_mowing", name: "Lawn Mowing Icon" },
    { key: "tree_trimming", name: "Tree Trimming Icon" },
    { key: "generic_service", name: "Generic Service Icon" },
  ];

  const iconDocumentMap: Record<string, any> = {};

  for (const item of serviceIcons) {
    let doc = await DocumentModel.findOne({ name: item.name });
    if (!doc) {
      doc = await DocumentModel.create({
        name: item.name,
        document_type: "icon",
        content_type: "image/svg+xml",
        keys: {
          original: `service-icons/${item.key}.svg`,
          thumbnails: [],
          webpThumbnails: [],
        },
        unsigned_urls: {
          original: `https://assets.trufindo.com/services/${item.key}.svg`,
          thumbnails: [],
          webpThumbnails: [],
        },
        is_active: true,
        is_deleted: false,
        created_by: userId,
      });
    }
    iconDocumentMap[item.key] = doc._id;
  }

  return iconDocumentMap;
};

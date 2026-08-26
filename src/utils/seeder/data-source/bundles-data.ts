import mongoose from "mongoose";
import User from "../../../database/users/users-db-model";
import DocumentModel from "../../../database/documents/documents-db-model";
import BundleStatusesModel from "../../../database/bundle-statuses/bundle-statuses-db-model";
import { getRoleId } from "../seeder-cookie";
import { IBundleDocument } from "../../../database/bundles/bundles-db-interface";

export async function generateBundleData(): Promise<Partial<IBundleDocument>[]> {
  const user = await User.findOne({ role: getRoleId("super_admin") });

  if (!user) {
    console.log("No users found for bundle seeding. Please add a user first.");
    return [];
  }

  // Ensure an icon document exists for seeding
  let defaultIcon = await DocumentModel.findOne({ is_deleted: false });
  if (!defaultIcon) {
    defaultIcon = await DocumentModel.create({
      name: "default_bundle_icon.png",
      document_type: "image",
      content_type: "image/png",
      keys: {
        original: "bundles/icons/default.png",
        thumbnails: [],
        webpThumbnails: [],
      },
      created_by: user._id,
      is_active: true,
      is_deleted: false,
    });
  }

  const defaultBundleStatus = await BundleStatusesModel.findOne({
    is_default: true,
    is_deleted: false,
  });

  const bundleData: Partial<IBundleDocument>[] = [
    {
      name: "Home Cleaning Package",
      display_name: "Complete Home Cleaning",
      code: "HOME_CLEAN_PKG",
      description: "Full residential cleaning bundle including deep cleaning and sanitation.",
      icon: defaultIcon._id as mongoose.Types.ObjectId,
      status_id: defaultBundleStatus?._id as mongoose.Types.ObjectId,
      sort_order: 1,
      tags: ["cleaning", "home", "residential"],
      metadata: { tier: "premium" },
      is_active: true,
      is_deleted: false,
      created_by: user._id,
    },
    {
      name: "Electrical & Plumbing Maintenance",
      display_name: "Essential Home Repairs",
      code: "HOME_REPAIR_PKG",
      description: "Complete repair bundle covering electrical checkups and plumbing fixtures.",
      icon: defaultIcon._id as mongoose.Types.ObjectId,
      status_id: defaultBundleStatus?._id as mongoose.Types.ObjectId,
      sort_order: 2,
      tags: ["repair", "plumbing", "electrical"],
      metadata: { tier: "standard" },
      is_active: true,
      is_deleted: false,
      created_by: user._id,
    },
  ];

  return bundleData;
}

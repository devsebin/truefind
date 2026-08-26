import BundleUserMappingStatusModel from "../../../database/bundle-user-mapping-status/bundle-user-mapping-status-db-model";
import { generateBundleUserMappingStatusData } from "../data-source/bundle-user-mapping-status-data";

export const seedBundleUserMappingStatus = async () => {
  await BundleUserMappingStatusModel.deleteMany({});
  const statuses = await generateBundleUserMappingStatusData();
  if (statuses && statuses.length > 0) {
    await BundleUserMappingStatusModel.insertMany(statuses);
  }
};

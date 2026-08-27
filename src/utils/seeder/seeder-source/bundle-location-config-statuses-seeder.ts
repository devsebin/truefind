import BundleLocationConfigStatusesModel from "../../../database/bundle-location-config-status/bundle-location-config-status-db-model";
import { generateBundleLocationConfigStatusData } from "../data-source/bundle-location-config-statuses-data";

export const seedBundleLocationConfigStatus = async () => {
  await BundleLocationConfigStatusesModel.deleteMany({});
  const bundleLocationConfigStatuses = await generateBundleLocationConfigStatusData();
  if (bundleLocationConfigStatuses && bundleLocationConfigStatuses.length > 0) {
    await BundleLocationConfigStatusesModel.insertMany(bundleLocationConfigStatuses);
  }
};

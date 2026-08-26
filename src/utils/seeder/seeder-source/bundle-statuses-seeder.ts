import BundleStatusesModel from "../../../database/bundle-statuses/bundle-statuses-db-model";
import { generateBundleStatusData } from "../data-source/bundle-statuses-data";

export const seedBundleStatus = async () => {
  await BundleStatusesModel.deleteMany({});
  const bundleStatuses = await generateBundleStatusData();
  if (bundleStatuses && bundleStatuses.length > 0) {
    await BundleStatusesModel.insertMany(bundleStatuses);
  }
};

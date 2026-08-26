import BundleModel from "../../../database/bundles/bundles-db-model";
import { generateBundleData } from "../data-source/bundles-data";

export const seedBundle = async () => {
  await BundleModel.deleteMany({});
  const bundles = await generateBundleData();
  if (bundles && bundles.length > 0) {
    await BundleModel.insertMany(bundles);
  }
};

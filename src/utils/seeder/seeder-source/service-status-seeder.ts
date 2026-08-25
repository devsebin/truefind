import ServiceStatusModel from "../../../database/service-status/service-status-db-model";
import { generateServiceStatusData } from "../data-source/service-status-data";

export const seedServiceStatus = async () => {
  await ServiceStatusModel.deleteMany({});
  const serviceStatuses = await generateServiceStatusData();
  if (serviceStatuses && serviceStatuses.length > 0) {
    await ServiceStatusModel.insertMany(serviceStatuses);
  }
};

import StatusModel from "../../../database/status/status-db-model";
import { generateStatusData } from "../data-source/status-data";

export const seedStatus = async () => {
  //user apis

  await StatusModel.deleteMany({});
  const statuses = await generateStatusData();
  await StatusModel.insertMany(statuses);
};

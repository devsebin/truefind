import PrioritiesModel from "../../../database/priorities/priorities-db-model";
import { generatePriorityData } from "../data-source/priority-data";

export const seedPriority = async () => {
  await PrioritiesModel.deleteMany({});
  const priorities = await generatePriorityData();
  await PrioritiesModel.insertMany(priorities);
};

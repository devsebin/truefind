import UnitsModel from "../../../database/units/units-db-model";
import { generateUnitData } from "../data-source/unit-data";

export const seedUnit = async () => {
  await UnitsModel.deleteMany({});
  const units = await generateUnitData();
  await UnitsModel.insertMany(units);
};

import mongoose from "mongoose";
import CountryModel from "../../database/countries/countries-db-model";
import RegionModel from "../../database/regions/regions-db-model";
import DistrictModel from "../../database/districts/districts-db-model";
import SuburbModel from "../../database/suburbs/suburbs-db-model";
import UnitsModel from "../../database/units/units-db-model";
import CurrencyModel from "../../database/currencies/currencies-db-model";
import PrioritiesModel from "../../database/priorities/priorities-db-model";
import RolesModel from "../../database/roles/roles-db-model";
import StatusModel from "../../database/status/status-db-model";
import dotenv from "dotenv";
dotenv.config();

const verifyCounts = async () => {
  await mongoose.connect(process.env.MONGO_PATH as string);

  const countries = await CountryModel.countDocuments();
  const regions = await RegionModel.countDocuments();
  const districts = await DistrictModel.countDocuments();
  const suburbs = await SuburbModel.countDocuments();
  const units = await UnitsModel.countDocuments();
  const currencies = await CurrencyModel.countDocuments();
  const priorities = await PrioritiesModel.countDocuments();
  const roles = await RolesModel.countDocuments();
  const statuses = await StatusModel.countDocuments();

  console.log("SEEDED_COUNTS_RESULT:", JSON.stringify({
    countries,
    regions,
    districts,
    suburbs,
    units,
    currencies,
    priorities,
    roles,
    statuses
  }, null, 2));

  process.exit(0);
};

verifyCounts();

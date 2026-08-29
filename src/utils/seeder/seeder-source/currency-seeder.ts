import CurrencyModel from "../../../database/currencies/currencies-db-model";
import { generateCurrencyData } from "../data-source/currency-data";
import { seedCurrencyDocuments } from "./currency-document-seeder";

export const seedCurrency = async () => {
  await CurrencyModel.deleteMany({});
  const symbolMap = await seedCurrencyDocuments();
  const currencies = await generateCurrencyData(symbolMap);
  await CurrencyModel.insertMany(currencies);
};

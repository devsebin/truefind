import CountryModel from "../../../database/countries/countries-db-model";
import RegionModel from "../../../database/regions/regions-db-model";
import DistrictModel from "../../../database/districts/districts-db-model";
import SuburbModel from "../../../database/suburbs/suburbs-db-model";
import User from "../../../database/users/users-db-model";
import { getRoleId } from "../seeder-cookie";
import { locationHierarchyData } from "../data-source/location-data";

export const seedLocations = async () => {
  const user = await User.findOne({ role: getRoleId("super_admin") });
  const userId = user ? user._id : undefined;

  // Clean existing collections
  await SuburbModel.deleteMany({});
  await DistrictModel.deleteMany({});
  await RegionModel.deleteMany({});
  await CountryModel.deleteMany({});

  for (const countryConfig of locationHierarchyData) {
    // 1. Create Country
    const createdCountry: any = await CountryModel.create({
      name: countryConfig.name,
      iso_code: countryConfig.iso_code,
      iso_code_3: countryConfig.iso_code_3,
      phone_code: countryConfig.phone_code,
      currency: countryConfig.currency,
      continent: countryConfig.continent,
      timezone: countryConfig.timezone,
      region_ids: [],
      providers: [],
      is_active: true,
      is_deleted: false,
      created_by: userId,
    });

    const regionIds: any[] = [];

    for (const regionConfig of countryConfig.regions) {
      // 2. Create Region
      const createdRegion: any = await RegionModel.create({
        name: regionConfig.name,
        code: regionConfig.code,
        country_id: createdCountry._id,
        district_ids: [],
        is_active: true,
        is_deleted: false,
        created_by: userId,
      });

      regionIds.push(createdRegion._id);
      const districtIds: any[] = [];

      for (const districtConfig of regionConfig.districts) {
        // 3. Create District
        const createdDistrict: any = await DistrictModel.create({
          name: districtConfig.name,
          code: districtConfig.code,
          country_id: createdCountry._id,
          region_id: createdRegion._id,
          suburb_ids: [],
          is_active: true,
          is_deleted: false,
          created_by: userId,
        });

        districtIds.push(createdDistrict._id);
        const suburbIds: any[] = [];

        // 4. Create Suburbs
        for (const suburbConfig of districtConfig.suburbs) {
          const createdSuburb: any = await SuburbModel.create({
            name: suburbConfig.name,
            code: suburbConfig.code,
            post_code: suburbConfig.post_code,
            boundary: suburbConfig.boundary,
            country_id: createdCountry._id,
            region_id: createdRegion._id,
            district_id: createdDistrict._id,
            is_active: true,
            is_deleted: false,
            created_by: userId,
          });

          suburbIds.push(createdSuburb._id);
        }

        // Update district with its suburb_ids
        await DistrictModel.findByIdAndUpdate(createdDistrict._id, {
          $set: { suburb_ids: suburbIds },
        });
      }

      // Update region with its district_ids
      await RegionModel.findByIdAndUpdate(createdRegion._id, {
        $set: { district_ids: districtIds },
      });
    }

    // Update country with its region_ids
    await CountryModel.findByIdAndUpdate(createdCountry._id, {
      $set: { region_ids: regionIds },
    });
  }
};

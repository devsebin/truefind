import ICountry from "@/database/countries/countries-db-interface";
import { ISupportedCountry } from "@/database/providers/providers-db-interface";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";
import mongoose, { Model, Types } from "mongoose";
import { throwError } from "../../providers.helper";

export async function validateCountriesFromDB(
    supportedCountries: ISupportedCountry[],
    countryRepository: Model<ICountry>,
    session: mongoose.ClientSession,
) {
    const ids = supportedCountries.map((c) => c.countryId);

    ids.forEach((id) => {
        if (!Types.ObjectId.isValid(id)) {
            const response = ResponseBuilder.conflict(
                ErrorTypes.VALIDATION_ERROR,
                undefined,
                {
                    message: "Invalid country ID format",
                    data: { id },
                    filler: { id },
                },
            );
            throwError("invalid_country_id_format", response);
        }
    });

    const objectIds = ids.map((id) => new Types.ObjectId(id));

    const dbCountries = await countryRepository
        .find({ _id: { $in: objectIds } })
        .select("_id iso_code")
        .session(session)
        .lean();

    const dbMap = new Map(
        dbCountries.map((c) => [c._id.toString(), c.iso_code]),
    );

    for (const country of supportedCountries) {
        const id = country.countryId.toString();
        const dbCode = dbMap.get(id);

        if (!dbCode) {
            const response = ResponseBuilder.conflict(
                ErrorTypes.NOT_FOUND,
                undefined,
                {
                    message: "Country not found",
                    data: { countryId: id },
                    filler: { countryId: id },
                },
            );
            throwError("country_not_found", response);
        }

        if (dbCode !== country.countryCode) {
            const response = ResponseBuilder.conflict(
                ErrorTypes.CONFLICT,
                undefined,
                {
                    message: "Country code mismatch",
                    data: { countryId: id, providedCode: country.countryCode, dbCode },
                    filler: {
                        countryId: id,
                        providedCode: country.countryCode,
                        dbCode,
                    },
                },
            );
            throwError("country_code_mismatch", response);
        }
    }
}
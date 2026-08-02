import ICountry from "@/database/countries/countries-db-interface";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";
import mongoose, { Model } from "mongoose";
import { throwError } from "../../providers.helper";

export async function validateRemovedCountries(
    removedCountryIds: string[],
    providerId: mongoose.Types.ObjectId,
    countryRepository: Model<ICountry>,

    session: mongoose.ClientSession,
) {
    if (removedCountryIds.length === 0) return;

    const linkedCountries = await countryRepository
        .find({
            _id: { $in: removedCountryIds },
            provider: providerId, // 👈 IMPORTANT
            is_deleted: false, // if you use soft delete
        })
        .select("_id name iso_code")
        .session(session)
        .lean();

    if (linkedCountries.length > 0) {
        const codes = linkedCountries.map((c) => c.iso_code);
        const response = ResponseBuilder.conflict(
            ErrorTypes.CONFLICT,
            undefined,
            {
                message: "Cannot remove linked countries",
                data: { linkedCountries: codes },
                filler: { linkedCountries: codes },
            },
        );

        throwError("cannot_remove_linked_countries", response);
    }
}
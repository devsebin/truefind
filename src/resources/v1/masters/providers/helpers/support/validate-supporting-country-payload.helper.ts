import { ISupportedCountry } from "@/database/providers/providers-db-interface";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";
import { throwError } from "../../providers.helper";

export function validateSupportedCountries(supportedCountries: ISupportedCountry[]) {
    const countrySet = new Set<string>();
    let response: any;
    for (const country of supportedCountries) {
        const code = country.countryCode.trim().toUpperCase();

        if (countrySet.has(code)) {
            response = ResponseBuilder.conflict(ErrorTypes.CONFLICT, undefined, {
                message: "Duplicate country code",
            });
            throwError("duplicate_country_code", response);
        }
        countrySet.add(code);

        if (!country.countryId) {
            response = ResponseBuilder.conflict(
                ErrorTypes.CONFLICT,
                undefined,
                "Invalid country ID",
            );
            throwError("invalid_country_id", response);
        }

        if (!country.type || country.type.length === 0) {
            response = ResponseBuilder.conflict(ErrorTypes.CONFLICT, undefined, {
                message: "Country must have at least one type",
            });
            throwError("country_must_have_at_least_one_type", response);
        }

        const typeSet = new Set<string>();
        let defaultCount = 0;

        for (const t of country.type) {
            const typeName = t.name.trim().toLowerCase();

            if (typeSet.has(typeName)) {
                response = ResponseBuilder.conflict(ErrorTypes.CONFLICT, undefined, {
                    message: "Duplicate type name",
                    data: { typeName, code },
                    filler: { typeName, code },
                });
                throwError("duplicate_provider_type", response);
            }

            typeSet.add(typeName);

            if (t.is_default) defaultCount++;
        }

        if (defaultCount > 1) {
            response = ResponseBuilder.conflict(ErrorTypes.CONFLICT, undefined, {
                message: "Only one default type allowed per country",
                data: { code },
                filler: { code },
            });
            throwError("only_one_default_allowed_per_country", response);
        }

        if (defaultCount === 0) {
            country.type[0].is_default = true;
        }

        // ✅ assign normalized value safely
        country.countryCode = code;
    }
}
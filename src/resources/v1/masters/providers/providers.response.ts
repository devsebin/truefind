export const ProviderResponse = (data: any[]): any => {
    return data.map((provider) => {
        const supportedCountries = provider.supportedCountries || [];

        return {
            id: provider._id,
            name: provider.name,
            is_active: provider.is_active,
            is_deleted: provider.is_deleted,

            // Country counts
            country_count: supportedCountries.length,
            active_country_count: supportedCountries.filter((c: any) => c.is_active)
                .length,
            inactive_country_count: supportedCountries.filter(
                (c: any) => !c.is_active,
            ).length,

            config: {
                api_key: provider.config?.apiKey,
                api_secret: provider.config?.apiSecret,
                sender_id: provider.config?.senderId,
            },

            supported_countries: supportedCountries.map((country: any) => {
                const types = country.type || [];

                // Efficient summary calculation
                const typeSummary = types.reduce(
                    (acc: any, t: any) => {
                        acc.type_count++;

                        if (t.is_active) acc.active_type_count++;
                        else acc.inactive_type_count++;

                        if (t.is_tested) acc.tested_type_count++;
                        else acc.untested_type_count++;

                        return acc;
                    },
                    {
                        type_count: 0,
                        active_type_count: 0,
                        inactive_type_count: 0,
                        tested_type_count: 0,
                        untested_type_count: 0,
                    },
                );

                return {
                    id: country._id,
                    country_id: country.countryId,
                    code: country.countryCode,
                    is_active: country.is_active,
                    is_tested: country.is_tested,
                    support_from: country.supportFrom,
                    support_until: country.supportUntil,
                    config: country.config ? {
                        api_key: country.config.apiKey,
                        api_secret: country.config.apiSecret,
                        auth_token: country.config.authToken,
                        sender_id: country.config.senderId,
                        username: country.config.username,
                        password: country.config.password,
                        base_url: country.config.baseUrl,
                        api_version: country.config.apiVersion,
                        additional_config: country.config.additionalConfig,
                    } : null,

                    // Type counts
                    ...typeSummary,

                    types: types.map((type: any) => ({
                        id: type._id,
                        name: type.name,
                        description: type.description,
                        is_active: type.is_active,
                        is_tested: type.is_tested,
                        test_log: type.test_log,
                        is_default: type.is_default,
                    })),
                };
            }),

            created_by: provider.created_by,
            updated_by: provider.updated_by,
            deleted_by: provider.deleted_by,

            created_at: provider.createdAt,
            updated_at: provider.updatedAt,
            deleted_at: provider.deleted_at,
        };
    });
};

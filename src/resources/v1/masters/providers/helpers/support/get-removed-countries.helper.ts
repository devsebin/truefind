import { IProvider } from "@/database/providers/providers-db-interface";

export async function getRemovedCountries(
    existing: IProvider,
    payload: Partial<IProvider>,
) {
    if (!payload.supportedCountries) return [];

    const existingIds = new Set(
        existing.supportedCountries.map((c) => c.countryId.toString()),
    );

    const newIds = new Set(
        payload.supportedCountries.map((c) => c.countryId.toString()),
    );

    const removed: string[] = [];

    for (const id of existingIds) {
        if (!newIds.has(id)) {
            removed.push(id);
        }
    }

    return removed;
}
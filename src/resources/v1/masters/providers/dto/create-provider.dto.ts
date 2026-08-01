import { IInputProviderPayloadStrict } from "../payloads/provider-payload";

export interface IProviderDTO {
    name: string;
    supportedCountries?: any[];
}

export function toProviderDTO(body: IInputProviderPayloadStrict): IProviderDTO {
    return {
        name: body.name ? body.name.toUpperCase() : "",
        supportedCountries: body.supportedCountries,
    };
}

import { capitalize } from "lodash";
import { IInputUserBasicPayloadStrict, IInputUserPayloadStrict } from "../payloads/user-input.interface";

export interface ILocation {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
}

export interface IUserBasicDTO {
    first_name: string;
    last_name: string;
    business_name: string;
    year_of_experience: number;
    street_address: string;
    city: string;
    zip: string;
    gst_number?: string;
    ird_number: string;
    declaimer_id: string;
    location: ILocation;
}
export function toUserBasicDTO(body: IInputUserBasicPayloadStrict): IUserBasicDTO {
    return {
        first_name: capitalize(body.first_name),
        last_name: capitalize(body.last_name),
        business_name: capitalize(body.business_name),
        year_of_experience: body.year_of_experience,
        street_address: body.street_address,
        city: body.city,
        zip: body.zip,
        gst_number: body.gst_number,
        ird_number: body.ird_number,
        declaimer_id: body.declaimer_id,
        location: {
            type: "Point",
            coordinates: [
                Number(body.longitude),
                Number(body.latitude),
            ],
        },
    };
}
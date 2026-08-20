import { NextFunction, Request, Response } from "express";

// middlewares/transformLocation.middleware.ts
export function transformLatLongToLocation(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { latitude, longitude } = req.body;

  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);

  if (!isNaN(lat) && !isNaN(lng)) {
    req.body.location = {
      type: "Point",
      coordinates: [lng, lat], // GeoJSON format: [longitude, latitude]
    };
  }
  delete req.body.latitude;
  delete req.body.longitude;

  next(); // continue to Joi validation
}

export function localTimestamp() {
  const pad = (n: number): string => n.toString().padStart(2, "0");

  const now = new Date();
  const timestamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
  return timestamp;
}

export async function getLocationFromCoordinates(lat: number, lng: number) {
  if (
    typeof lat !== "number" ||
    typeof lng !== "number" ||
    !Number.isFinite(lat) ||
    !Number.isFinite(lng) ||
    lat < -90 ||
    lat > 90 ||
    lng < -180 ||
    lng > 180
  ) {
    throw new Error("Invalid latitude or longitude");
  }

  const url = new URL(
    "https://maps.googleapis.com/maps/api/geocode/json"
  );

  url.searchParams.set("latlng", `${lat},${lng}`);
  url.searchParams.set(
    "key",
    process.env.GOOGLE_LOCATION_API as string
  );

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Google Geocoding HTTP error: ${response.status}`
    );
  }

  const data = await response.json();

  if (data.status !== "OK") {
    throw new Error(
      `Google Geocoding error: ${data.status} ${data.error_message || ""
      }`
    );
  }

  const result = data.results[0];

  if (!result) {
    return null;
  }

  const components = result.address_components;

  const getComponent = (type: any) =>
    components.find((c: any) => c.types.includes(type));

  const country = getComponent("country");
  const region = getComponent(
    "administrative_area_level_1"
  );
  const district = getComponent(
    "administrative_area_level_2"
  );

  const city =
    getComponent("locality") ||
    getComponent("postal_town") ||
    getComponent("administrative_area_level_3");

  return {
    country: country?.long_name ?? null,
    countryCode: country?.short_name ?? null,

    region: region?.long_name ?? null,
    regionCode: region?.short_name ?? null,

    district: district?.long_name ?? null,

    city: city?.long_name ?? null,

    formattedAddress: result.formatted_address ?? null
  };
}

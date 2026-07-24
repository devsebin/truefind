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

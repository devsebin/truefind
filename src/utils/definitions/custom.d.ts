import { IUser } from "@/database/users/user.interface";
import { GeoData } from "@/middlewares/user-location-fetching.middleware";
import { Document } from "mongoose";
declare module "dotenv";

declare global {
  namespace Express {
    export interface Request {
      user: IUser;
      geoData?: GeoData | null;
    }
  }
}

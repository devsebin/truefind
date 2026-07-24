// types/express.d.ts
import { GeoData } from "@/middlewares/user-location-fetching.middleware"; // adjust path

declare namespace Express {
  interface Request {
    locals?: {
      routeParams: any;
      queryParams: any;
      fullUrl: string;
      geoData?: GeoData | null;
    };
  }
}

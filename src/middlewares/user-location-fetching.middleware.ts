import { Request, Response, NextFunction } from "express";
import axios from "axios";
import { EncryptedCookieService } from "@/utils/helpers/crypto.helper";
import {
    COOKIE_NAME,
    COOKIE_MAX_AGE,
    COOKIE_HTTP_ONLY,
    COOKIE_SECURE,
    COOKIE_SAME_SITE,
} from "@/utils/validate-env";

const cookieService = new EncryptedCookieService();

export interface GeoData {
    country: string;
    regionName: string;
    city: string;
    query: string; // IP
    [key: string]: any;
}

function isLocalIp(ip: string): boolean {
    return (
        ip === "::1" ||
        ip === "127.0.0.1" ||
        ip === "::ffff:127.0.0.1" ||
        ip.startsWith("192.168.") ||
        ip.startsWith("10.") ||
        ip.startsWith("172.16.") ||
        /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(ip) ||
        ip.startsWith("fe80:")
    );
}

export const geoMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const rawCookie = req.cookies[COOKIE_NAME];
        let geoData: GeoData | null = null;

        if (rawCookie) {
            try {
                const decrypted = cookieService.decrypt(rawCookie);
                geoData = JSON.parse(decrypted);
            } catch (e) {
                console.warn("Invalid or tampered geo cookie.");
            }
        }

        let ip = req.ip || "127.0.0.1";

        if (process.env.NODE_ENV === "development" && isLocalIp(ip)) {
            ip = "103.135.130.250";
        }

        // Fetch new geo data if cookie missing or IP changed
        if (!geoData || geoData.query !== ip) {
            if (isLocalIp(ip)) {
                // Use a mock/default geolocation for local/loopback IP addresses to avoid unnecessary external API calls
                geoData = {
                    status: "success",
                    country: "Localhost",
                    countryCode: "LH",
                    region: "LH",
                    regionName: "Localhost Region",
                    city: "Localhost City",
                    zip: "00000",
                    lat: 0,
                    lon: 0,
                    timezone: "UTC",
                    isp: "Local Loopback",
                    org: "Local Loopback",
                    as: "Local Loopback",
                    query: ip,
                };

                const encrypted = cookieService.encrypt(JSON.stringify(geoData));

                res.cookie(COOKIE_NAME, encrypted, {
                    maxAge: COOKIE_MAX_AGE,
                    httpOnly: COOKIE_HTTP_ONLY,
                    secure: COOKIE_SECURE,
                    sameSite: "lax",
                });
            } else {
                const { data } = await axios.get<GeoData>(`http://ip-api.com/json/${ip}`);

                if (data && data.status !== "fail") {
                    const encrypted = cookieService.encrypt(JSON.stringify(data));

                    res.cookie(COOKIE_NAME, encrypted, {
                        maxAge: COOKIE_MAX_AGE,
                        httpOnly: COOKIE_HTTP_ONLY,
                        secure: COOKIE_SECURE,
                        sameSite: "lax",
                    });

                    geoData = data;
                } else {
                    console.warn(`IP-API lookup failed for IP: ${ip}`);
                    geoData = null;
                }
            }
        }

        (req as any).geoData = geoData;
    } catch (err: any) {
        if (axios.isAxiosError(err)) {
            console.warn(`geoMiddleware lookup failed: ${err.message} (code: ${err.code})`);
        } else {
            console.error("geoMiddleware error:", err);
        }
        (req as any).geoData = null;
    }

    next();
};

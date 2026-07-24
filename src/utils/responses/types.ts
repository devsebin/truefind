import { Response, Request } from "express";

// Type JsonResponse represents return type of an API endpoint which returns response as JSON
export type JsonResponse = ReturnType<() => Response>;

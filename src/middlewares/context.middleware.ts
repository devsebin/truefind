import { Request, Response, NextFunction } from "express";
import { requestContext } from "@/utils/context/request-context";

export function contextMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  requestContext.run({}, () => {
    next();
  });
}

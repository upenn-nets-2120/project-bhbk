import { NextFunction, Request, Response } from "express";

import ErrorResponse from "./types/ErrorResponse";

export function notFound(req: Request, res: Response, next: NextFunction) {
  res.status(404);
  const error = new Error(`🔍 - Not Found - ${req.originalUrl}`);
  next(error);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(
  err: Error,
  req: Request,
  res: Response<ErrorResponse>,
  next: NextFunction
) {
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? "🥞" : err.stack,
  });
}

export const checkAuthentication = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.session.isLoggedIn && req.session.user) {
    next();
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
};

export const checkWSAuthentication = async (ws: ws, req: Request, next: NextFunction) => {
  if (req.session.isLoggedIn && req.session.user) {
      next();
  } else {
      ws.close(401, 'Unauthorized')
  }
}

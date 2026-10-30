import { NextFunction, Request, Response } from "express";
import { IError } from "../common/interface/error.interface";

export const globalErrorHandling = (
  error: IError,
  req: Request,
  res: Response,
  next: NextFunction,
): Response => {
  return res.status(error.status ?? 500).json({
    error,
    error_message: error.message || "something went wrong",
    stack: error.stack,
    cause: error.cause,
  });
};

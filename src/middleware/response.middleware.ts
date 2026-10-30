import { NextFunction, Request, Response } from "express";

export const ResponseFormatter = (handler: Function) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const result = await handler(req, res, next);
    if (res.headersSent) return;
    return res.status(result?.status ?? 200).json({
      message: result?.message ?? "done",
      data: result?.data,
      extra: result?.extra,
    });
  };
};

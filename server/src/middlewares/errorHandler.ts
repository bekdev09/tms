import { Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";
import { StatusCodes } from "http-status-codes";

interface CustomError {
  statusCode: number;
  msg: string;
}

export function errorHandlerMiddleware(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  // console.error("🔥 Error:", err);

  let customError: CustomError = {
    statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
    msg: err.message || "Something went wrong, please try again later",
  };

  if (err instanceof Prisma.PrismaClientValidationError) {
    customError.msg = err.message;
    customError.statusCode = StatusCodes.BAD_REQUEST;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case "P2002":
        customError.msg = `Duplicate value entered for field: ${err.meta?.target}`;
        customError.statusCode = StatusCodes.BAD_REQUEST;
        break;

      case "P2003": // Foreign key constraint failed
        customError.msg = `Invalid relation: ${err.meta?.field_name}`;
        customError.statusCode = StatusCodes.BAD_REQUEST;
        break;

      case "P2025":
        customError.msg = "Record not found";
        customError.statusCode = StatusCodes.NOT_FOUND;
        break;

      default:
        customError.msg = `Database error: ${err.message}`;
        customError.statusCode = StatusCodes.BAD_REQUEST;
    }
  }

  return res.status(customError.statusCode).json({ msg: customError.msg });
}

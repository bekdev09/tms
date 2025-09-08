import { ZodObject, ZodRawShape, ZodError } from "zod";
import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";

export const validate =
  <T extends ZodRawShape>(schema: ZodObject<T>) =>
    (req: Request, res: Response, next: NextFunction) => {
      try {
        req.body = schema.parse(req.body);
        next();
      } catch (err) {
        if (err instanceof ZodError) {
          const errorMessages = err.issues.map(issue => ({
            message: `${issue.path.join(".")} is ${issue.message}`,
          }));

          return res
            .status(StatusCodes.BAD_REQUEST)
            .json({ error: "Invalid data", details: errorMessages });
        }

        return res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .json({ error: "Internal Server Error" });
      }
    };

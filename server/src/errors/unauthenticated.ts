import { StatusCodes } from "http-status-codes";
import { CustomApiError } from "./custom-api.ts";

export class UnauthenticatedError extends CustomApiError {
  statusCode: number;

  constructor(message: string) {
    super(message);
    this.statusCode = StatusCodes.UNAUTHORIZED; // 401
  }
}

import { StatusCodes } from "http-status-codes";
import { CustomApiError } from "./custom-api.ts";

export class InternalServerError extends CustomApiError {
  statusCode: StatusCodes;
  constructor(message: string) {
    super(message);
    this.statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
  }
}
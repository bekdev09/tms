
// Extend Express Request to include user
import { DecodedAuthPayload } from "../modules/auth/auth.schemas.ts";

declare global {
	namespace Express {
		interface Request {
			user?: DecodedAuthPayload;
		}
	}
}
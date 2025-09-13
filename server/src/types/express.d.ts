
// Extend Express Request to include user
import { AuthPayload } from "./auth.js";

declare global {
	namespace Express {
		interface Request {
			user?: AuthPayload;
		}
	}
}
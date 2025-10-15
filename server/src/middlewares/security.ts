import { Application } from "express";
import express from 'express'
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import hpp from "hpp";
import morgan from "morgan"
import compression from "compression";
import { sanitizeHtmlBody } from "./sanitize-html.ts";
import cookieParser from "cookie-parser";

export function setupSecurity(app: Application) {
	app.disable("x-powered-by");
	app.use(helmet({
		contentSecurityPolicy: {
			directives: {
				defaultSrc: ["'self'"],
				scriptSrc: ["'self'"],
				objectSrc: ["'none'"]
			}
		}
	}));

	app.use(cors({
		origin: [process.env.CLIENT_URL || "http://localhost:5173", "https://yourdomain.com"],
		methods: ["GET", "POST", "PUT", "DELETE"],
		credentials: true,
		exposedHeaders: ["Content-Disposition"],
	}));

	app.use(rateLimit({
		windowMs: 15 * 60 * 1000,
		max: 100,
		standardHeaders: true,
		legacyHeaders: false,
	}));

	app.use(hpp());
	app.use(sanitizeHtmlBody);

	app.use(express.json());
	app.use(cookieParser());
	app.use(morgan('dev'))
	app.use(compression({
		level: 6,
		threshold: 1024, // Only compress responses > 1KB
	}));
}

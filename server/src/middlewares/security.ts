import { Application } from "express";
import express from 'express'
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
// import hpp from "hpp";
// import xss from "xss-clean";
import morgan from "morgan"
// import compression from "compression";

export function setupSecurity(app: Application) {
    app.disable("x-powered-by");
    app.use(helmet());

    app.use(cors({
        origin: ["https://yourdomain.com"],
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true,
    }));

    app.use(rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 100,
        standardHeaders: true,
        legacyHeaders: false,
    }));

    // app.use(hpp());
    // app.use(xss());

    app.use(express.json());
    app.use(morgan('dev'))
    // app.use(compression({
    //     level: 6, // Compression level (0–9, default 6 is good balance)
    //     threshold: 1024, // Only compress responses > 1KB
    // }));
}

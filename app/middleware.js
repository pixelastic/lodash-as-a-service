import helmet from "helmet";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";

// Configure middleware for the Express app
export function setup(app) {
  app.use(helmet());
  app.use(cors());
  app.use(express.json());

  // Rate limiting: 100req/min
  app.use(
    "/",
    rateLimit({
      windowMs: 1 * 60 * 1000,
      max: 100,
      message: "Too many requests, please try again later.",
    }),
  );

  // Healthcheck
  app.get("/health", (req, res) => {
    res.json({ status: "healthy", timestamp: new Date().toISOString() });
  });
}


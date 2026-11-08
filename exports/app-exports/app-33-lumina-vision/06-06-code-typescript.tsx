import winston from "winston";

// ─── Custom Log Format ─────────────────────────────────────────────────────────
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSS" }),
  winston.format.errors({ stack: true }),        // Include stack traces
  winston.format.splat(),                         // String interpolation
  winston.format.json()                           // Structured JSON output
);

// ─── Pretty Console Format (Development) ──────────────────────────────────────
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: "HH:mm:ss" }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
    return `[${timestamp}] ${level}: ${message}${metaStr}`;
  })
);

// ─── Logger Instance ───────────────────────────────────────────────────────────
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: logFormat,
  defaultMeta: { service: "neural-engine" },
  transports: [
    // Console transport (pretty in dev, JSON in prod)
    new winston.transports.Console({
      format: process.env.NODE_ENV === "production" ? logFormat : consoleFormat,
    }),
    // Persistent error log file
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
      maxsize: 10 * 1024 * 1024, // 10MB rotation
      maxFiles: 5,
    }),
    // Combined log file
    new winston.transports.File({
      filename: "logs/combined.log",
      maxsize: 50 * 1024 * 1024, // 50MB rotation
      maxFiles: 10,
    }),
  ],
});
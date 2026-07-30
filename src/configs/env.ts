export const env = {
  mode: process.env.ENV_MODE ?? "development",

  port: Number(process.env.PORT) || 8080,
  logLevel: (process.env.LOG_LEVEL ?? "debug") as "debug" | "info" | "warn" | "error",

  databaseUrl: process.env.DATABASE_URL!,
  dbMaxPool: Number(process.env.DB_MAX_POOL) || 20,
  dbIdleTimeoutMs: Number(process.env.DB_IDLE_TIMEOUT_MS) || 5000,
  dbConnectionTimeoutMs: Number(process.env.DB_CONNECTION_TIMEOUT_MS) || 5000,
  dbMaxLifetimeSeconds: Number(process.env.DB_MAX_LIFETIME_SECONDS) || 60,

  accessTokenSecret: process.env.ACCESS_TOKEN_SECRET!,
  accessTokenExpiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN ?? "1h",
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET!,
  refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN ?? "5d",
  refreshTokenMaxAge: Number(process.env.REFRESH_TOKEN_MAX_AGE) || 432000,

  redisUrl: process.env.REDIS_URL,

  rateLimitWindowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 60000,
  rateLimitMaxRequests: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 60,
  rateLimitCleanupIntervalMs: Number(process.env.RATE_LIMIT_CLEANUP_INTERVAL_MS) || 300000,

  wsDebounceMs: Number(process.env.WS_DEBOUNCE_MS) || 100,

  corsOrigin: process.env.CORS_ORIGIN || "https://ocean-chat-web.vercel.app",
} as const;

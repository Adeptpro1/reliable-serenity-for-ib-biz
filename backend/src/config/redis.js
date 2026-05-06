import Redis from "ioredis";

// In production, set REDIS_URL to your managed Redis instance
// e.g. redis://:<password>@<host>:<port>  (Upstash, Redis Cloud, etc.)
// Falls back to localhost for local development.
const redis = new Redis(process.env.REDIS_URL || "redis://127.0.0.1:6379", {
  maxRetriesPerRequest: 3,
  retryStrategy: (times) => {
    // Retry with exponential back-off, max 10s between attempts
    const delay = Math.min(times * 200, 10000);
    return delay;
  },
  lazyConnect: false,
});

redis.on("connect", () => {
});

redis.on("error", (err) => {
  // Log but never crash the process — cache failures are non-fatal
  console.error("❌ Redis error:", err.message);
});

export default redis;


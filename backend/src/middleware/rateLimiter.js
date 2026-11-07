import ratelimit from "../config/upstash.js";

const retryDelayMs = 30_000;
let redisUnavailableUntil = 0;

const rateLimiter = async (req, res, next) => {
  if (Date.now() < redisUnavailableUntil) {
    return next();
  }

  try {
    const { success } = await ratelimit.limit("My-limit-key");

    if (!success) {
      return res.status(429).json({
        message: "Too many requests, please try again later",
      });
    }

    next();
  } catch (error) {
    redisUnavailableUntil = Date.now() + retryDelayMs;
    console.warn(`Rate limiter unavailable; allowing request: ${error.message}`);
    next();
  }
};

export default rateLimiter;

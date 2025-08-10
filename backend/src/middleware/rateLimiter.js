import ratelimit from "../config/upstash.js";

const rateLimiter = async (req, res, next) => {
  try {
    const forwarded = req.headers["x-forwarded-for"];
    const ip =
      typeof forwarded === "string"
        ? forwarded.split(",")[0].trim()
        : req.ip || req.connection.remoteAddress;
    const { success } = await ratelimit.limit(ip);

    if (!success) {
      return res
        .status(429)
        .json({ message: "Too many requests, please try again later." });
    }

    next();
  } catch (error) {
    console.error("Rate limiter error:", error);
    next(error);
  }
};

export default rateLimiter;

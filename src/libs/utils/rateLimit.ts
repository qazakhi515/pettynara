import { NextFunction, Request, RequestHandler, Response } from "express";
import {
  IRateLimiterOptions,
  RateLimiterAbstract,
  RateLimiterMemory,
  RateLimiterRedis,
  RateLimiterRes,
} from "rate-limiter-flexible";
import { getRedis } from "../redis";
import Errors, { HttpCode, Message } from "../Errors";

/**
 * Brute-force protection for login and signup.
 *
 * Counters live in Redis when it is configured, so they survive restarts and
 * are shared by every instance. If Redis fails, each limiter falls back to an
 * in-memory copy rather than letting every request through. Without Redis
 * (local development, tests) the in-memory limiters are used directly.
 *
 * Keys use req.ip, which is the real client address only because app.ts sets
 * "trust proxy" for the Nginx hop in front of the app.
 */

const LIMITS = {
  // Every login attempt from one IP, whatever the nick.
  loginIp: { keyPrefix: "rl:login-ip", points: 20, duration: 15 * 60 },
  // Wrong passwords for one nick from one IP. Cleared by a successful login.
  loginFail: { keyPrefix: "rl:login-fail", points: 5, duration: 15 * 60 },
  // Accounts created from one IP.
  signupIp: { keyPrefix: "rl:signup-ip", points: 5, duration: 60 * 60 },
} satisfies Record<string, IRateLimiterOptions>;

type LimiterName = keyof typeof LIMITS;

let limiters: Record<LimiterName, RateLimiterAbstract> | undefined;

const build = (options: IRateLimiterOptions): RateLimiterAbstract => {
  const redis = getRedis();
  if (!redis) return new RateLimiterMemory(options);
  return new RateLimiterRedis({
    ...options,
    storeClient: redis,
    insuranceLimiter: new RateLimiterMemory(options),
  });
};

// Built on first use, after dotenv has loaded REDIS_URL.
const getLimiter = (name: LimiterName): RateLimiterAbstract => {
  if (!limiters) {
    limiters = {
      loginIp: build(LIMITS.loginIp),
      loginFail: build(LIMITS.loginFail),
      signupIp: build(LIMITS.signupIp),
    };
  }
  return limiters[name];
};

/** Drops the in-memory counters. Tests call it between cases. */
export const resetRateLimiters = () => {
  limiters = undefined;
};

const tooManyRequests = (res: Response, msBeforeNext: number) => {
  res.set("Retry-After", String(Math.ceil(msBeforeNext / 1000)));
  const error = new Errors(HttpCode.TOO_MANY_REQUESTS, Message.TOO_MANY_REQUESTS);
  res.status(error.code).json(error);
};

const limitByIp =
  (name: LimiterName): RequestHandler =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await getLimiter(name).consume(String(req.ip));
      next();
    } catch (rejection) {
      if (rejection instanceof RateLimiterRes)
        return tooManyRequests(res, rejection.msBeforeNext);
      // Both Redis and the in-memory fallback failed: do not lock users out.
      console.log("Error, rate limiter:", rejection);
      next();
    }
  };

export const limitLoginAttempts = limitByIp("loginIp");
export const limitSignups = limitByIp("signupIp");

const failKey = (req: Request, memberNick: unknown) =>
  `${req.ip}_${String(memberNick).toLowerCase()}`;

/**
 * Answers 429 and returns true when this IP has used up its wrong passwords
 * for the nick. Checked before the password, so a locked-out caller learns
 * nothing about whether the next guess would have been right.
 */
export const rejectIfLoginLocked = async (
  req: Request,
  res: Response,
  memberNick: unknown,
): Promise<boolean> => {
  try {
    const state = await getLimiter("loginFail").get(failKey(req, memberNick));
    if (state && state.remainingPoints <= 0) {
      tooManyRequests(res, state.msBeforeNext);
      return true;
    }
  } catch (err) {
    console.log("Error, rate limiter:", err);
  }
  return false;
};

export const recordLoginFailure = async (req: Request, memberNick: unknown) => {
  await getLimiter("loginFail")
    .consume(failKey(req, memberNick))
    .catch(() => undefined); // over the limit already: nothing more to record
};

export const clearLoginFailures = async (req: Request, memberNick: unknown) => {
  await getLimiter("loginFail")
    .delete(failKey(req, memberNick))
    .catch((err) => console.log("Error, rate limiter:", err));
};

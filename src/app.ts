import express from "express";
import path from "path";
import router from "./router";
import routerAdmin from "./router-admin";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { MORGAN_FORMAT } from "./libs/config";
import cors from "cors";

import session from "express-session";
import RedisStore from "connect-redis";
import { T } from "./libs/types/common";
import { getRedis } from "./libs/redis";

// Admin sessions live in Redis, which expires them with the cookie. Without
// REDIS_URL (local development, tests) express-session keeps them in memory.
const redis = getRedis();
const store = redis ? new RedisStore({ client: redis, prefix: "sess:" }) : undefined;
if (!redis && process.env.NODE_ENV === "production")
  console.log("Warn: REDIS_URL is not set, admin sessions are kept in memory");

/* 1- ENTRANCE */
const app = express();
app.disable("etag");
// Nginx is the one proxy in front of the app. Trusting that single hop makes
// req.ip the client's address from X-Forwarded-For instead of 127.0.0.1, which
// the rate limiter depends on. A client cannot spoof it: Nginx appends the
// real address last, and only that last entry is trusted.
app.set("trust proxy", 1);
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static("./uploads"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors({ credentials: true, origin: true }));
app.use(cookieParser());
app.use(morgan(MORGAN_FORMAT));

/* 2- SESSION */
// authentication
// authorization
// Only the EJS admin uses sessions — the React API authenticates with a JWT and
// never reads req.session. Mounted globally (and with saveUninitialized: true)
// this wrote a sessions document to MongoDB on every anonymous API request.
app.use(
  "/admin",
  session({
    secret: String(process.env.SESSION_SECRET),
    cookie: {
      maxAge: 1000 * 3600 * 3, // 3 hours
    },
    store: store,
    resave: false,
    saveUninitialized: false,
  }),
  function (req, res, next) {
    const sessionInstance = req.session as T;
    res.locals.member = sessionInstance?.member;
    next();
  },
);

/* 3- VIEWS */
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
/* 4- ROUTERS */
app.use("/admin", routerAdmin); //EJS
app.use("/", router); // React

// Middleware Design Pattern.  Pettynara  ni back end qismini  React loyihaga rest api sifatida ishlatamiz
// back end loyihamizni adminka loyihasini traditional qurish sifatida ishlatamiz
export default app; // common js da module.exports kabi qilinar edi esma js da esa export default boladi.

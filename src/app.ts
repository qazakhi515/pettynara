import express from "express";
import path from "path";
import router from "./router";
import routerAdmin from "./router-admin";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { MORGAN_FORMAT } from "./libs/config";
import cors from "cors";

import session from "express-session";
import ConnectMongoDB from "connect-mongodb-session";
import { T } from "./libs/types/common";

const MongoDBStore = ConnectMongoDB(session);
const store = new MongoDBStore({
  uri: String(process.env.MONGO_URL),
  collection: "sessions",
});

// The store is built without a callback, so a connection failure would reach
// connect-mongodb-session's `throw` path and kill the process at boot. A
// listener turns that into a logged error instead.
store.on("error", function (error: Error) {
  console.log("Error, session store:", error);
});

/* 1- ENTRANCE */
const app = express();
app.disable("etag");
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

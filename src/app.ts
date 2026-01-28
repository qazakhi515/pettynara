import express from "express";
import path from "path";
import router from "./router";
import routerAdmin from "./router-admin";
import morgan from "morgan";
import { MORGAN_FORMAT } from "./libs/config";

import session from "express-session";
import ConnectMongoDB from "connect-mongodb-session"

const MongoDBStore = ConnectMongoDB(session);
const store = new MongoDBStore({
    uri: String(process.env.MONGO_URL),
    collection: "sessions"
});

/* 1- ENTRANCE */
const app = express();
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(morgan(MORGAN_FORMAT));

/* 2- SESSION */
// authentication 
// authorization
app.use(
    session({
  secret: String  (process.env.SESSION_SECRET),
  cookie: {
    maxAge: 1000 * 3600 * 3 // 3 hours
  },
  store: store,
  resave: true,
  saveUninitialized: true
})
);

/* 3- VIEWS */
app.set("views", path.join(__dirname, "views"));   
app.set("view engine", "ejs");
/* 4- ROUTERS */
app.use("/admin", routerAdmin);    //EJS
app.use("/", router);              // React

// Middleware Design Pattern.  Burak  ni back end qismini  React loyihaga rest api sifatida ishlatamiz
// back end loyihamizni adminka loyihasini traditional qurish sifatida ishlatamiz
export default app;   // common js da module.exports kabi qilinar edi esma js da esa export default boladi.


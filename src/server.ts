import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import app from "./app";
import { getRedis, waitForRedis } from "./libs/redis";
mongoose
.connect(process.env.MONGO_URL as string, {})
.then(async (data) => {
   console.log("MongoDB connection succeed");
   // Redis commands fail fast while disconnected, so wait for the first
   // connection before taking traffic. If Redis is down the app still starts:
   // the cache is skipped and rate limits fall back to memory.
   if (getRedis()) {
     await waitForRedis()
       .then(() => console.log("Redis connection succeed"))
       .catch((err) => console.log("ERROR on connection Redis", err.message));
   }
   const PORT = process.env.PORT ?? 3003;
   app.listen(PORT, function() {
    console.log(`This server is running successfully on port: ${PORT}`);
    console.log(`Admin project http://localhost:${PORT}/admin \n`);
   })
})
.catch((err) => console.log("ERROR on connection MongoDB", err));
 
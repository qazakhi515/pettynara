import express from "express";
const router = express.Router();
import memberController from "./controllers/memberController";

router.post("/login", memberController.login);
router.post("/signup", memberController.signup);
//router.get("/detail", memberController.detail);

export default router;

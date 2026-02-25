import express from "express";
const router = express.Router();
import memberController from "./controllers/memberController";

//** member **//
router.post("/member/login", memberController.login);
router.post("/member/signup", memberController.signup);
router.get("/member/detail", memberController.verifyAuth);

//** product **//

//** order **//

export default router;

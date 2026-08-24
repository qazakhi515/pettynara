import express from "express";
const router = express.Router();
import memberController from "./controllers/memberController";
import uploader from "./libs/utils/uploader";
import productController from "./controllers/productController";
import orderController from "./controllers/orderController";

//** member **//
router.get("/member/restaurant", memberController.getRestaurant);

router.post("/member/login", memberController.login);
router.post("/member/signup", memberController.signup);
router.post(
  "/member/logout",
  memberController.verifyAuth,
  memberController.logout,
);
router.get(
  "/member/detail",
  memberController.verifyAuth,
  memberController.getMemberDetail,
);

router.post(
  "/member/update",
  memberController.verifyAuth,
  uploader("members").single("memberImage"),
  memberController.updateMember,
);

router.get("/member/top-users", memberController.getTopUsers);

//** likes **//
// verifyAuth, not retrieveAuth: liking is only meaningful for a signed-in
// member, and the guard has to live here rather than in the UI — otherwise the
// endpoint is still open to anyone calling the API directly.
router.get("/member/likes", memberController.verifyAuth, memberController.getMyLikes);
router.post(
  "/member/likes/sync",
  memberController.verifyAuth,
  memberController.syncMyLikes,
);

//** product **//
router.get("/product/all", productController.getProducts);
// Declared before "/product/:id" so ":id" cannot swallow it.
router.post(
  "/product/:id/like",
  memberController.verifyAuth,
  productController.likeProduct,
);
router.get(
  "/product/:id",
  memberController.retrieveAuth,
  productController.getProduct,
);

//** order **//
router.post(
  "/order/create",
  memberController.verifyAuth,
  orderController.createOrder,
);

router.get(
  "/order/all",
  memberController.verifyAuth,
  orderController.getMyOrders,
);

router.post(
  "/order/update",
  memberController.verifyAuth,
  orderController.updateOrder,
);
export default router;

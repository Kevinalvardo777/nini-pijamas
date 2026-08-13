import { Router } from "express";
import {
  addCartItemController,
  clearCartController,
  getCartController,
  removeCartItemController,
  updateCartItemController
} from "../controllers/cart";
import { authenticate } from "../middleware/auth";

const router = Router();
router.use(authenticate);

router.get("/", getCartController);
router.post("/items", addCartItemController);
router.patch("/items/:itemId", updateCartItemController);
router.delete("/items/:itemId", removeCartItemController);
router.post("/clear", clearCartController);

export default router;

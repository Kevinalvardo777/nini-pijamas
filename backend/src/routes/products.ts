import { Router } from "express";
import {
  createProductController,
  deleteProductController,
  getProductController,
  listProductsController,
  updateProductController
} from "../controllers/products";
import { authenticate } from "../middleware/auth";
import { requireRole } from "../middleware/role";

const router = Router();

router.get("/", listProductsController);
router.get("/:slug", getProductController);
router.post("/", authenticate, requireRole("ADMIN"), createProductController);
router.patch("/:slug", authenticate, requireRole("ADMIN"), updateProductController);
router.delete("/:slug", authenticate, requireRole("ADMIN"), deleteProductController);

export default router;

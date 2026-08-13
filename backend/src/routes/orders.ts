import { Router } from "express";
import {
  createOrderController,
  getOrderController,
  getOrdersController,
  updateOrderStatusController
} from "../controllers/orders";
import { authenticate, optionalAuthenticate } from "../middleware/auth";
import { requireRole } from "../middleware/role";

const router = Router();

router.post("/", optionalAuthenticate, createOrderController);
router.use(authenticate);
router.get("/", getOrdersController);
router.get("/:orderId", getOrderController);
router.patch("/:orderId/status", requireRole("ADMIN"), updateOrderStatusController);

export default router;

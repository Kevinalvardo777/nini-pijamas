import { Router } from "express";
import {
  getAdminOrdersController,
  getAdminProductsController,
  getAdminReportController,
  getAdminStatsController,
  getAdminUsersController,
  updateAdminUserController
} from "../controllers/admin";
import { authenticate } from "../middleware/auth";
import { requireRole } from "../middleware/role";

const router = Router();
router.use(authenticate, requireRole("ADMIN"));

router.get("/stats", getAdminStatsController);
router.get("/reportes", getAdminReportController);
router.get("/pedidos", getAdminOrdersController);
router.get("/productos", getAdminProductsController);
router.get("/usuarios", getAdminUsersController);
router.patch("/usuarios/:userId", updateAdminUserController);

export default router;

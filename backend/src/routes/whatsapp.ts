import { Router } from "express";
import { sendOrderMessageController, sendDeliveryMessageController } from "../controllers/whatsapp";
import { authenticate } from "../middleware/auth";
import { requireRole } from "../middleware/role";

const router = Router();

router.post("/order/:orderId", authenticate, requireRole("ADMIN"), sendOrderMessageController);
router.post("/delivery/:orderId", authenticate, requireRole("ADMIN"), sendDeliveryMessageController);

export default router;

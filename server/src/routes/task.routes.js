import { Router } from "express";
import { requireAuth, authorizeRoles } from "../middleware/auth.js";
import * as TaskController from "../controllers/task.controller.js";

const router = Router();

// Todas requieren estar autenticado
router.use(requireAuth);

// Ejemplos
router.get("/", TaskController.list);
router.post("/", TaskController.create);

// Solo admin
router.delete("/:id", authorizeRoles("admin"), TaskController.remove);

export default router;

import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { listTasks, createTask, updateTask, deleteTask } from "../controllers/planner.controller.js";

const router = Router();

router.use(authenticate);

router.get("/", listTasks);
router.post("/", createTask);
router.put("/:id", updateTask);
router.delete("/:id", deleteTask);

export default router;

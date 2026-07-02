import { Router, type IRouter } from "express";
import healthRouter from "./health";
import taskRouter from "./tasks.js";

const router: IRouter = Router();

// Route de santé de l'API
router.use(healthRouter);

// Routes de gestion des tâches
router.use(taskRouter);

export default router;

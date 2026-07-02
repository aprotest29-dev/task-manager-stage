import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import taskRouter from "./tasks.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(taskRouter);

export default router;

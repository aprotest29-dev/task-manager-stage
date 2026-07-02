/**
 * Routes pour la ressource "tâches".
 * Utilise Express Router pour organiser les endpoints
 * et applique les middlewares de validation avant chaque opération d'écriture.
 */

import { Router } from "express";
import {
  getTasks,
  getTask,
  addTask,
  editTask,
  removeTask,
} from "../controllers/taskController.js";
import {
  validateCreateTask,
  validateUpdateTask,
} from "../middleware/validateTask.js";

const taskRouter = Router();

// GET    /api/tasks       — Lister toutes les tâches
taskRouter.get("/tasks", getTasks);

// GET    /api/tasks/:id   — Obtenir une tâche par ID
taskRouter.get("/tasks/:id", getTask);

// POST   /api/tasks       — Créer une nouvelle tâche
taskRouter.post("/tasks", validateCreateTask, addTask);

// PUT    /api/tasks/:id   — Mettre à jour une tâche existante
taskRouter.put("/tasks/:id", validateUpdateTask, editTask);

// DELETE /api/tasks/:id   — Supprimer une tâche
taskRouter.delete("/tasks/:id", removeTask);

export default taskRouter;

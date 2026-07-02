/**
 * Contrôleur des tâches.
 * Chaque fonction gère un endpoint de l'API (pattern MVC).
 * La validation des données est assurée en amont par les middlewares.
 */

import { type Request, type Response } from "express";
import {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  type CreateTaskDTO,
  type UpdateTaskDTO,
} from "../models/task.js";

export function getTasks(_req: Request, res: Response): void {
  const tasks = getAllTasks();
  res.status(200).json({
    success: true,
    count: tasks.length,
    data: tasks,
  });
}

export function getTask(req: Request, res: Response): void {
  const id = String(req.params.id);
  const task = getTaskById(id);

  if (!task) {
    res.status(404).json({
      success: false,
      message: `Tâche "${id}" introuvable.`,
    });
    return;
  }

  res.status(200).json({ success: true, data: task });
}

export function addTask(req: Request, res: Response): void {
  const body = req.body as CreateTaskDTO;
  const newTask = createTask(body);

  res.status(201).json({
    success: true,
    message: "Tâche créée avec succès.",
    data: newTask,
  });
}

export function editTask(req: Request, res: Response): void {
  const id = String(req.params.id);
  const body = req.body as UpdateTaskDTO;
  const updatedTask = updateTask(id, body);

  if (!updatedTask) {
    res.status(404).json({
      success: false,
      message: `Tâche "${id}" introuvable.`,
    });
    return;
  }

  res.status(200).json({
    success: true,
    message: "Tâche mise à jour avec succès.",
    data: updatedTask,
  });
}

export function removeTask(req: Request, res: Response): void {
  const id = String(req.params.id);
  const wasDeleted = deleteTask(id);

  if (!wasDeleted) {
    res.status(404).json({
      success: false,
      message: `Tâche "${id}" introuvable.`,
    });
    return;
  }

  res.status(200).json({
    success: true,
    message: "Tâche supprimée avec succès.",
  });
}

/**
 * Middleware de validation des données pour les tâches.
 * Valide les champs requis et les valeurs autorisées avant
 * de transmettre la requête au contrôleur.
 */

import { type Request, type Response, type NextFunction } from "express";
import { VALID_STATUSES, type TaskStatus } from "../models/task.js";

// ─── Validation : création d'une tâche ────────────────────────────────────────

export function validateCreateTask(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const { titre, description, statut } = req.body as {
    titre?: unknown;
    description?: unknown;
    statut?: unknown;
  };

  const errors: string[] = [];

  // Titre requis
  if (!titre || typeof titre !== "string" || titre.trim() === "") {
    errors.push("Le champ 'titre' est requis et ne peut pas être vide.");
  } else if (titre.trim().length > 200) {
    errors.push("Le champ 'titre' ne peut pas dépasser 200 caractères.");
  }

  // Description requise
  if (!description || typeof description !== "string" || description.trim() === "") {
    errors.push("Le champ 'description' est requis et ne peut pas être vide.");
  } else if (description.trim().length > 2000) {
    errors.push("Le champ 'description' ne peut pas dépasser 2000 caractères.");
  }

  // Statut optionnel mais doit être valide s'il est fourni
  if (statut !== undefined) {
    if (!VALID_STATUSES.includes(statut as TaskStatus)) {
      errors.push(
        `Le champ 'statut' doit être l'une des valeurs : ${VALID_STATUSES.join(", ")}.`,
      );
    }
  }

  if (errors.length > 0) {
    res.status(400).json({
      success: false,
      message: "Données invalides.",
      errors,
    });
    return;
  }

  next();
}

// ─── Validation : mise à jour d'une tâche ─────────────────────────────────────

export function validateUpdateTask(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const { titre, description, statut } = req.body as {
    titre?: unknown;
    description?: unknown;
    statut?: unknown;
  };

  const errors: string[] = [];

  // Au moins un champ doit être fourni
  if (titre === undefined && description === undefined && statut === undefined) {
    res.status(400).json({
      success: false,
      message: "Au moins un champ doit être fourni pour la mise à jour.",
      errors: ["Aucun champ à mettre à jour."],
    });
    return;
  }

  // Titre optionnel mais valide s'il est fourni
  if (titre !== undefined) {
    if (typeof titre !== "string" || titre.trim() === "") {
      errors.push("Le champ 'titre' ne peut pas être vide.");
    } else if (titre.trim().length > 200) {
      errors.push("Le champ 'titre' ne peut pas dépasser 200 caractères.");
    }
  }

  // Description optionnelle mais valide si elle est fournie
  if (description !== undefined) {
    if (typeof description !== "string" || description.trim() === "") {
      errors.push("Le champ 'description' ne peut pas être vide.");
    } else if (description.trim().length > 2000) {
      errors.push("Le champ 'description' ne peut pas dépasser 2000 caractères.");
    }
  }

  // Statut optionnel mais doit être valide s'il est fourni
  if (statut !== undefined) {
    if (!VALID_STATUSES.includes(statut as TaskStatus)) {
      errors.push(
        `Le champ 'statut' doit être l'une des valeurs : ${VALID_STATUSES.join(", ")}.`,
      );
    }
  }

  if (errors.length > 0) {
    res.status(400).json({
      success: false,
      message: "Données invalides.",
      errors,
    });
    return;
  }

  next();
}

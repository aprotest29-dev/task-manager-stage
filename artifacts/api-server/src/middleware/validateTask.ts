/**
 * Middleware de validation pour les données de tâches.
 * Vérifie les champs et leur format avant de transmettre la requête au contrôleur.
 */

import { type Request, type Response, type NextFunction } from "express";
import { VALID_STATUSES, type TaskStatus } from "../models/task.js";

// ─── Fonctions d'aide à la validation ─────────────────────────────────────────

/**
 * Valide un champ texte.
 * - Si `required` est vrai, le champ doit être présent et non vide.
 * - Si `required` est faux, le champ est ignoré s'il est absent, mais validé s'il est fourni.
 * Retourne un message d'erreur ou `null` si valide.
 */
function validateTextField(
  value: unknown,
  label: string,
  maxLength: number,
  required: boolean,
): string | null {
  if (value === undefined) {
    return required ? `Le champ '${label}' est requis.` : null;
  }
  if (typeof value !== "string" || value.trim() === "") {
    return `Le champ '${label}' ne peut pas être vide.`;
  }
  if (value.trim().length > maxLength) {
    return `Le champ '${label}' ne peut pas dépasser ${maxLength} caractères.`;
  }
  return null;
}

/**
 * Valide le champ `statut`.
 * Retourne un message d'erreur ou `null` si valide (ou absent).
 */
function validateStatutField(value: unknown): string | null {
  if (value === undefined) return null;
  if (!VALID_STATUSES.includes(value as TaskStatus)) {
    return `Le champ 'statut' doit être l'une des valeurs : ${VALID_STATUSES.join(", ")}.`;
  }
  return null;
}

/** Envoie une réponse 400 avec la liste des erreurs de validation. */
function rejectWithErrors(res: Response, errors: string[]): void {
  res.status(400).json({ success: false, message: "Données invalides.", errors });
}

// ─── Middleware de création ────────────────────────────────────────────────────

/** Valide les champs requis pour créer une tâche (POST /api/tasks). */
export function validateCreateTask(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const { titre, description, statut } = req.body as Record<string, unknown>;

  const errors: string[] = [
    validateTextField(titre, "titre", 200, true),
    validateTextField(description, "description", 2000, true),
    validateStatutField(statut),
  ].filter((error): error is string => error !== null);

  if (errors.length > 0) {
    rejectWithErrors(res, errors);
    return;
  }

  next();
}

// ─── Middleware de mise à jour ─────────────────────────────────────────────────

/** Valide les champs pour mettre à jour une tâche (PUT /api/tasks/:id). */
export function validateUpdateTask(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const { titre, description, statut } = req.body as Record<string, unknown>;

  if (titre === undefined && description === undefined && statut === undefined) {
    rejectWithErrors(res, ["Au moins un champ doit être fourni pour la mise à jour."]);
    return;
  }

  const errors: string[] = [
    validateTextField(titre, "titre", 200, false),
    validateTextField(description, "description", 2000, false),
    validateStatutField(statut),
  ].filter((error): error is string => error !== null);

  if (errors.length > 0) {
    rejectWithErrors(res, errors);
    return;
  }

  next();
}

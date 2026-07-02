/**
 * Couche d'accès à l'API REST.
 * Toutes les communications réseau passent par ce module.
 * Pour changer l'URL de l'API, modifier uniquement la constante `API_BASE`.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type TaskStatus = "À faire" | "En cours" | "Terminée";

export interface Task {
  id: string;
  titre: string;
  description: string;
  statut: TaskStatus;
  createdAt: string;
  updatedAt: string;
}

// ─── Configuration ────────────────────────────────────────────────────────────

// L'API est accessible via le chemin relatif /api grâce au proxy Replit.
// En production, remplacer par l'URL complète du serveur.
const API_BASE = "/api/tasks";

const JSON_HEADERS = { "Content-Type": "application/json" };

// ─── Types internes ───────────────────────────────────────────────────────────

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  count?: number;
  message?: string;
  errors?: string[];
}

// ─── Helpers privés ───────────────────────────────────────────────────────────

/**
 * Tente de parser le corps d'une réponse en JSON.
 * Retourne `null` si le corps est vide ou non-JSON (ex. erreur proxy HTML).
 * Évite un crash `SyntaxError` si le serveur retourne une page d'erreur.
 */
async function tryParseJson<T>(res: Response): Promise<ApiResponse<T> | null> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as ApiResponse<T>;
  } catch {
    return null;
  }
}

/**
 * Extrait le message d'erreur lisible depuis la réponse de l'API.
 * Concatène les erreurs de validation si elles sont présentes.
 */
function extractErrorMessage(
  json: ApiResponse<unknown> | null,
  fallback: string,
): string {
  if (!json) return fallback;
  if (json.errors && json.errors.length > 0) return json.errors.join(" ");
  return json.message ?? fallback;
}

// ─── Fonctions d'accès à l'API ────────────────────────────────────────────────

/** Récupère la liste complète des tâches. */
export async function fetchAll(): Promise<Task[]> {
  const res = await fetch(API_BASE);
  const json = await tryParseJson<Task[]>(res);

  if (!res.ok || !json?.success) {
    throw new Error(extractErrorMessage(json, `Erreur serveur (${res.status}).`));
  }

  return json.data ?? [];
}

/** Crée une nouvelle tâche et retourne l'objet créé. */
export async function create(
  payload: Omit<Task, "id" | "createdAt" | "updatedAt">,
): Promise<Task> {
  const res = await fetch(API_BASE, {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify(payload),
  });
  const json = await tryParseJson<Task>(res);

  if (!res.ok || !json?.success || !json.data) {
    throw new Error(extractErrorMessage(json, "Erreur lors de la création."));
  }

  return json.data;
}

/** Met à jour une tâche existante et retourne l'objet mis à jour. */
export async function update(
  id: string,
  payload: Partial<Omit<Task, "id" | "createdAt" | "updatedAt">>,
): Promise<Task> {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: "PUT",
    headers: JSON_HEADERS,
    body: JSON.stringify(payload),
  });
  const json = await tryParseJson<Task>(res);

  if (!res.ok || !json?.success || !json.data) {
    throw new Error(extractErrorMessage(json, "Erreur lors de la mise à jour."));
  }

  return json.data;
}

/** Supprime une tâche par son identifiant. */
export async function remove(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
  const json = await tryParseJson<null>(res);

  if (!res.ok || !json?.success) {
    throw new Error(extractErrorMessage(json, "Erreur lors de la suppression."));
  }
}

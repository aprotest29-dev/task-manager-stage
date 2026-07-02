/**
 * Module principal de l'application Task Manager.
 * Architecture : Vanilla TypeScript (DOM pur, sans framework).
 *
 * Toutes les opérations CRUD utilisent fetch() en async/await.
 * Aucun rechargement de page n'est effectué.
 */

// ─── Types ─────────────────────────────────────────────────────

type TaskStatus = "À faire" | "En cours" | "Terminée";

interface Task {
  id: string;
  titre: string;
  description: string;
  statut: TaskStatus;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  count?: number;
  message?: string;
  errors?: string[];
}

// ─── Configuration API ──────────────────────────────────────────
// L'API est accessible via le chemin relatif /api grâce au proxy Replit.
// Pour une migration vers un serveur distant, modifier uniquement cette constante.
const API_BASE = "/api/tasks";

// ─── État de l'application ──────────────────────────────────────

let allTasks: Task[] = [];
let editingId: string | null = null;

// ─── Initialisation ─────────────────────────────────────────────

export function initApp(): void {
  bindEvents();
  loadTasks();
}

// ─── Liaison des événements DOM ─────────────────────────────────

function bindEvents(): void {
  const form = document.getElementById("task-form") as HTMLFormElement;
  const cancelBtn = document.getElementById("cancel-btn") as HTMLButtonElement;
  const filterSelect = document.getElementById("filter-statut") as HTMLSelectElement;

  form.addEventListener("submit", handleFormSubmit);
  cancelBtn.addEventListener("click", resetForm);
  filterSelect.addEventListener("change", renderTasks);
}

// ─── CRUD — Lecture de toutes les tâches ───────────────────────

async function loadTasks(): Promise<void> {
  showLoading(true);

  try {
    const res = await fetch(API_BASE);
    if (!res.ok) throw new Error(`Erreur HTTP ${res.status}`);

    const json = (await res.json()) as ApiResponse<Task[]>;
    allTasks = json.data ?? [];
    updateCounter();
    renderTasks();
  } catch (err) {
    showToast("Impossible de charger les tâches.", "error");
    console.error("loadTasks :", err);
  } finally {
    showLoading(false);
  }
}

// ─── CRUD — Création d'une tâche ───────────────────────────────

async function createTask(payload: Omit<Task, "id" | "createdAt" | "updatedAt">): Promise<void> {
  const res = await fetch(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const json = (await res.json()) as ApiResponse<Task>;

  if (!res.ok || !json.success) {
    const msg = json.errors?.join(" ") ?? json.message ?? "Erreur lors de la création.";
    throw new Error(msg);
  }

  if (json.data) {
    allTasks.push(json.data);
  }
}

// ─── CRUD — Mise à jour d'une tâche ────────────────────────────

async function updateTask(id: string, payload: Partial<Omit<Task, "id" | "createdAt" | "updatedAt">>): Promise<void> {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const json = (await res.json()) as ApiResponse<Task>;

  if (!res.ok || !json.success) {
    const msg = json.errors?.join(" ") ?? json.message ?? "Erreur lors de la mise à jour.";
    throw new Error(msg);
  }

  if (json.data) {
    const index = allTasks.findIndex((t) => t.id === id);
    if (index !== -1) allTasks[index] = json.data;
  }
}

// ─── CRUD — Suppression d'une tâche ────────────────────────────

async function deleteTask(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
  const json = (await res.json()) as ApiResponse<null>;

  if (!res.ok || !json.success) {
    throw new Error(json.message ?? "Erreur lors de la suppression.");
  }

  allTasks = allTasks.filter((t) => t.id !== id);
}

// ─── Gestionnaire de soumission du formulaire ───────────────────

async function handleFormSubmit(e: Event): Promise<void> {
  e.preventDefault();

  if (!validateForm()) return;

  const submitBtn = document.getElementById("submit-btn") as HTMLButtonElement;
  const submitLabel = document.getElementById("submit-label") as HTMLSpanElement;

  submitBtn.disabled = true;
  submitLabel.textContent = editingId ? "Sauvegarde…" : "Ajout…";

  const payload = {
    titre:       (document.getElementById("task-titre") as HTMLInputElement).value.trim(),
    description: (document.getElementById("task-description") as HTMLTextAreaElement).value.trim(),
    statut:      (document.getElementById("task-statut") as HTMLSelectElement).value as TaskStatus,
  };

  try {
    if (editingId) {
      await updateTask(editingId, payload);
      showToast("Tâche modifiée avec succès !", "success");
    } else {
      await createTask(payload);
      showToast("Tâche ajoutée avec succès !", "success");
    }

    resetForm();
    updateCounter();
    renderTasks();
  } catch (err) {
    const message = err instanceof Error ? err.message : "Une erreur est survenue.";
    showToast(message, "error");
  } finally {
    submitBtn.disabled = false;
    submitLabel.textContent = editingId ? "Enregistrer" : "Ajouter";
  }
}

// ─── Remplissage du formulaire pour modification ────────────────

function populateFormForEdit(task: Task): void {
  editingId = task.id;

  (document.getElementById("task-id") as HTMLInputElement).value = task.id;
  (document.getElementById("task-titre") as HTMLInputElement).value = task.titre;
  (document.getElementById("task-description") as HTMLTextAreaElement).value = task.description;
  (document.getElementById("task-statut") as HTMLSelectElement).value = task.statut;

  const heading     = document.getElementById("form-heading") as HTMLHeadingElement;
  const submitLabel = document.getElementById("submit-label") as HTMLSpanElement;
  const btnIcon     = document.querySelector(".btn-icon") as HTMLSpanElement;
  const cancelBtn   = document.getElementById("cancel-btn") as HTMLButtonElement;

  heading.textContent      = "Modifier la tâche";
  submitLabel.textContent  = "Enregistrer";
  btnIcon.textContent      = "✓";
  cancelBtn.style.display  = "inline-flex";

  // Faire défiler vers le formulaire sur mobile
  document.querySelector(".form-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

// ─── Réinitialisation du formulaire ────────────────────────────

function resetForm(): void {
  editingId = null;

  (document.getElementById("task-form") as HTMLFormElement).reset();
  (document.getElementById("task-id") as HTMLInputElement).value = "";

  const heading     = document.getElementById("form-heading") as HTMLHeadingElement;
  const submitLabel = document.getElementById("submit-label") as HTMLSpanElement;
  const btnIcon     = document.querySelector(".btn-icon") as HTMLSpanElement;
  const cancelBtn   = document.getElementById("cancel-btn") as HTMLButtonElement;

  heading.textContent      = "Ajouter une tâche";
  submitLabel.textContent  = "Ajouter";
  btnIcon.textContent      = "+";
  cancelBtn.style.display  = "none";

  clearFieldErrors();
}

// ─── Validation du formulaire côté client ──────────────────────

function validateForm(): boolean {
  clearFieldErrors();
  let valid = true;

  const titreInput = document.getElementById("task-titre") as HTMLInputElement;
  const descInput  = document.getElementById("task-description") as HTMLTextAreaElement;

  if (!titreInput.value.trim()) {
    showFieldError("titre-error", "Le titre est requis.");
    titreInput.classList.add("error");
    valid = false;
  } else {
    titreInput.classList.remove("error");
  }

  if (!descInput.value.trim()) {
    showFieldError("description-error", "La description est requise.");
    descInput.classList.add("error");
    valid = false;
  } else {
    descInput.classList.remove("error");
  }

  return valid;
}

function showFieldError(id: string, message: string): void {
  const el = document.getElementById(id);
  if (el) el.textContent = message;
}

function clearFieldErrors(): void {
  document.querySelectorAll(".field-error").forEach((el) => (el.textContent = ""));
  document.querySelectorAll(".form-input, .form-textarea").forEach((el) => el.classList.remove("error"));
}

// ─── Rendu de la liste des tâches ──────────────────────────────

function renderTasks(): void {
  const container    = document.getElementById("task-list") as HTMLDivElement;
  const emptyState   = document.getElementById("empty-state") as HTMLDivElement;
  const filterValue  = (document.getElementById("filter-statut") as HTMLSelectElement).value;

  const filtered = filterValue
    ? allTasks.filter((t) => t.statut === filterValue)
    : allTasks;

  if (filtered.length === 0) {
    container.style.display  = "none";
    emptyState.style.display = "flex";
    return;
  }

  emptyState.style.display = "none";
  container.style.display  = "flex";
  container.innerHTML      = filtered.map(renderTaskCard).join("");

  // Lier les boutons Modifier / Supprimer
  container.querySelectorAll<HTMLButtonElement>(".btn-edit").forEach((btn) => {
    btn.addEventListener("click", () => {
      const task = allTasks.find((t) => t.id === btn.dataset["id"]);
      if (task) populateFormForEdit(task);
    });
  });

  container.querySelectorAll<HTMLButtonElement>(".btn-delete").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id    = btn.dataset["id"] ?? "";
      const task  = allTasks.find((t) => t.id === id);
      if (!task) return;

      if (!confirm(`Supprimer la tâche "${task.titre}" ? Cette action est irréversible.`)) return;

      btn.disabled   = true;
      btn.textContent = "…";

      try {
        await deleteTask(id);
        updateCounter();
        renderTasks();
        showToast("Tâche supprimée.", "info");
        if (editingId === id) resetForm();
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erreur lors de la suppression.";
        showToast(message, "error");
        btn.disabled    = false;
        btn.textContent = "Supprimer";
      }
    });
  });
}

// ─── Génération HTML d'une carte de tâche ──────────────────────

function renderTaskCard(task: Task): string {
  const badgeClass = statusBadgeClass(task.statut);
  const date       = new Date(task.updatedAt).toLocaleDateString("fr-FR", {
    day: "2-digit", month: "short", year: "numeric",
  });

  return `
    <article class="task-card" data-id="${esc(task.id)}" data-statut="${esc(task.statut)}">
      <div class="task-card-header">
        <h3 class="task-titre">${esc(task.titre)}</h3>
        <span class="task-statut-badge ${badgeClass}">
          <span class="badge-dot"></span>
          ${esc(task.statut)}
        </span>
      </div>
      <p class="task-description">${esc(task.description)}</p>
      <p class="task-meta">Modifiée le ${date}</p>
      <div class="task-card-footer">
        <button class="btn btn-edit" data-id="${esc(task.id)}" title="Modifier cette tâche">
          ✏ Modifier
        </button>
        <button class="btn btn-delete" data-id="${esc(task.id)}" title="Supprimer cette tâche">
          🗑 Supprimer
        </button>
      </div>
    </article>
  `;
}

// ─── Utilitaires ───────────────────────────────────────────────

/** Classe CSS pour le badge de statut */
function statusBadgeClass(statut: TaskStatus): string {
  switch (statut) {
    case "À faire":  return "badge-todo";
    case "En cours": return "badge-inprogress";
    case "Terminée": return "badge-done";
  }
}

/** Échappe les caractères HTML pour éviter les injections XSS */
function esc(str: string): string {
  return String(str)
    .replace(/&/g,  "&amp;")
    .replace(/</g,  "&lt;")
    .replace(/>/g,  "&gt;")
    .replace(/"/g,  "&quot;")
    .replace(/'/g,  "&#039;");
}

/** Affiche / masque l'indicateur de chargement */
function showLoading(visible: boolean): void {
  const loading = document.getElementById("loading-state") as HTMLDivElement;
  const list    = document.getElementById("task-list") as HTMLDivElement;
  const empty   = document.getElementById("empty-state") as HTMLDivElement;

  loading.style.display = visible ? "flex" : "none";
  if (visible) {
    list.style.display  = "none";
    empty.style.display = "none";
  }
}

/** Met à jour le compteur de tâches dans l'en-tête */
function updateCounter(): void {
  const el = document.getElementById("counter-total");
  if (el) el.textContent = String(allTasks.length);
}

/** Affiche une notification temporaire (toast) */
function showToast(message: string, type: "success" | "error" | "info" = "info"): void {
  const container = document.getElementById("toast-container") as HTMLDivElement;
  const icons     = { success: "✓", error: "✕", info: "ℹ" };

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span>${icons[type]}</span><span>${esc(message)}</span>`;
  container.appendChild(toast);

  // Fermeture automatique après 3 s
  setTimeout(() => {
    toast.classList.add("hide");
    toast.addEventListener("animationend", () => toast.remove());
  }, 3000);
}

/**
 * Module principal de l'application Task Manager.
 *
 * Architecture : Vanilla TypeScript, sans framework.
 * - La couche HTTP est isolée dans `api.ts`.
 * - Ce module gère l'état de l'application et les interactions DOM.
 */

import * as TaskApi from "./api.js";
import type { Task, TaskStatus } from "./api.js";

// ─── État de l'application ────────────────────────────────────────────────────

let allTasks: Task[] = [];

// `editingId` est null quand le formulaire est en mode "création",
// et contient l'id de la tâche en cours de modification.
let editingId: string | null = null;

// ─── Point d'entrée ───────────────────────────────────────────────────────────

export function initApp(): void {
  bindFormEvents();
  loadAndRenderTasks();
}

// ─── Liaison des événements DOM ───────────────────────────────────────────────

function bindFormEvents(): void {
  const form        = document.getElementById("task-form")     as HTMLFormElement;
  const cancelBtn   = document.getElementById("cancel-btn")    as HTMLButtonElement;
  const filterSelect = document.getElementById("filter-statut") as HTMLSelectElement;

  form.addEventListener("submit", handleFormSubmit);
  cancelBtn.addEventListener("click", resetForm);
  filterSelect.addEventListener("change", renderTaskList);
}

// ─── Chargement initial ───────────────────────────────────────────────────────

async function loadAndRenderTasks(): Promise<void> {
  setLoadingVisible(true);
  try {
    allTasks = await TaskApi.fetchAll();
    updateTaskCounter();
    renderTaskList();
  } catch {
    showToast("Impossible de charger les tâches.", "error");
  } finally {
    setLoadingVisible(false);
  }
}

// ─── Gestionnaire de soumission du formulaire ─────────────────────────────────

async function handleFormSubmit(event: Event): Promise<void> {
  event.preventDefault();
  if (!validateForm()) return;

  const submitBtn   = document.getElementById("submit-btn")   as HTMLButtonElement;
  const submitLabel = document.getElementById("submit-label") as HTMLSpanElement;
  const isEditing   = editingId !== null;

  submitBtn.disabled    = true;
  submitLabel.textContent = isEditing ? "Sauvegarde…" : "Ajout…";

  const payload = readFormValues();

  try {
    if (isEditing) {
      const updated = await TaskApi.update(editingId!, payload);
      const index = allTasks.findIndex((t) => t.id === editingId);
      if (index !== -1) allTasks[index] = updated;
      showToast("Tâche modifiée avec succès !", "success");
    } else {
      const created = await TaskApi.create(payload);
      allTasks.push(created);
      showToast("Tâche ajoutée avec succès !", "success");
    }
    resetForm();
    updateTaskCounter();
    renderTaskList();
  } catch (err) {
    showToast(err instanceof Error ? err.message : "Une erreur est survenue.", "error");
  } finally {
    submitBtn.disabled    = false;
    submitLabel.textContent = editingId !== null ? "Enregistrer" : "Ajouter";
  }
}

// ─── Lecture des valeurs du formulaire ────────────────────────────────────────

function readFormValues(): Omit<Task, "id" | "createdAt" | "updatedAt"> {
  return {
    titre:       (document.getElementById("task-titre")       as HTMLInputElement).value.trim(),
    description: (document.getElementById("task-description") as HTMLTextAreaElement).value.trim(),
    statut:      (document.getElementById("task-statut")      as HTMLSelectElement).value as TaskStatus,
  };
}

// ─── Gestion du formulaire (mode création / modification) ─────────────────────

/** Bascule le formulaire en mode modification et remplit les champs avec les données de la tâche. */
function openEditForm(task: Task): void {
  editingId = task.id;

  (document.getElementById("task-id")          as HTMLInputElement).value    = task.id;
  (document.getElementById("task-titre")       as HTMLInputElement).value    = task.titre;
  (document.getElementById("task-description") as HTMLTextAreaElement).value = task.description;
  (document.getElementById("task-statut")      as HTMLSelectElement).value   = task.statut;

  setFormMode("edit");
  document.querySelector(".form-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

/** Réinitialise le formulaire et revient en mode création. */
function resetForm(): void {
  editingId = null;
  (document.getElementById("task-form") as HTMLFormElement).reset();
  (document.getElementById("task-id")   as HTMLInputElement).value = "";
  setFormMode("create");
  clearFieldErrors();
}

/**
 * Met à jour les textes et l'affichage du formulaire selon le mode.
 * Centralise les changements qui étaient dupliqués entre openEditForm et resetForm.
 */
function setFormMode(mode: "create" | "edit"): void {
  const isEdit = mode === "edit";

  (document.getElementById("form-heading")  as HTMLHeadingElement).textContent  = isEdit ? "Modifier la tâche"  : "Ajouter une tâche";
  (document.getElementById("submit-label")  as HTMLSpanElement).textContent     = isEdit ? "Enregistrer"        : "Ajouter";
  (document.querySelector(".btn-icon")      as HTMLSpanElement).textContent      = isEdit ? "✓"                 : "+";
  (document.getElementById("cancel-btn")   as HTMLButtonElement).style.display  = isEdit ? "inline-flex"       : "none";
}

// ─── Validation côté client ───────────────────────────────────────────────────

function validateForm(): boolean {
  clearFieldErrors();
  let isValid = true;

  const titreInput = document.getElementById("task-titre")       as HTMLInputElement;
  const descInput  = document.getElementById("task-description") as HTMLTextAreaElement;

  if (!titreInput.value.trim()) {
    showFieldError("titre-error", "Le titre est requis.");
    titreInput.classList.add("error");
    isValid = false;
  } else {
    titreInput.classList.remove("error");
  }

  if (!descInput.value.trim()) {
    showFieldError("description-error", "La description est requise.");
    descInput.classList.add("error");
    isValid = false;
  } else {
    descInput.classList.remove("error");
  }

  return isValid;
}

function showFieldError(elementId: string, message: string): void {
  const el = document.getElementById(elementId);
  if (el) el.textContent = message;
}

function clearFieldErrors(): void {
  document.querySelectorAll(".field-error").forEach((el) => (el.textContent = ""));
  document.querySelectorAll(".form-input, .form-textarea").forEach((el) => el.classList.remove("error"));
}

// ─── Rendu de la liste des tâches ─────────────────────────────────────────────

function renderTaskList(): void {
  const taskListEl  = document.getElementById("task-list")     as HTMLDivElement;
  const emptyEl     = document.getElementById("empty-state")   as HTMLDivElement;
  const filterValue = (document.getElementById("filter-statut") as HTMLSelectElement).value;

  const visibleTasks = filterValue
    ? allTasks.filter((task) => task.statut === filterValue)
    : allTasks;

  if (visibleTasks.length === 0) {
    taskListEl.style.display = "none";
    emptyEl.style.display    = "flex";
    return;
  }

  emptyEl.style.display    = "none";
  taskListEl.style.display = "flex";
  taskListEl.innerHTML     = visibleTasks.map(buildTaskCardHTML).join("");

  bindTaskCardButtons(taskListEl);
}

/** Attache les événements des boutons Modifier / Supprimer après le rendu. */
function bindTaskCardButtons(container: HTMLDivElement): void {
  container.querySelectorAll<HTMLButtonElement>(".btn-edit").forEach((btn) => {
    btn.addEventListener("click", () => {
      const task = allTasks.find((t) => t.id === btn.dataset["id"]);
      if (task) openEditForm(task);
    });
  });

  container.querySelectorAll<HTMLButtonElement>(".btn-delete").forEach((btn) => {
    btn.addEventListener("click", () => handleDeleteClick(btn));
  });
}

async function handleDeleteClick(btn: HTMLButtonElement): Promise<void> {
  const id   = btn.dataset["id"] ?? "";
  const task = allTasks.find((t) => t.id === id);
  if (!task) return;

  if (!confirm(`Supprimer "${task.titre}" ? Cette action est irréversible.`)) return;

  btn.disabled    = true;
  btn.textContent = "…";

  try {
    await TaskApi.remove(id);
    allTasks = allTasks.filter((t) => t.id !== id);
    if (editingId === id) resetForm();
    updateTaskCounter();
    renderTaskList();
    showToast("Tâche supprimée.", "info");
  } catch (err) {
    showToast(err instanceof Error ? err.message : "Erreur lors de la suppression.", "error");
    btn.disabled    = false;
    btn.textContent = "🗑 Supprimer";
  }
}

// ─── Génération HTML d'une carte de tâche ────────────────────────────────────

function buildTaskCardHTML(task: Task): string {
  const badgeClass = getStatusBadgeClass(task.statut);
  const updatedDate = new Date(task.updatedAt).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
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
      <p class="task-meta">Modifiée le ${updatedDate}</p>
      <div class="task-card-footer">
        <button class="btn btn-edit"   data-id="${esc(task.id)}" title="Modifier cette tâche">✏ Modifier</button>
        <button class="btn btn-delete" data-id="${esc(task.id)}" title="Supprimer cette tâche">🗑 Supprimer</button>
      </div>
    </article>
  `;
}

// ─── Fonctions utilitaires ────────────────────────────────────────────────────

function getStatusBadgeClass(statut: TaskStatus): string {
  switch (statut) {
    case "À faire":  return "badge-todo";
    case "En cours": return "badge-inprogress";
    case "Terminée": return "badge-done";
  }
}

/** Échappe les caractères spéciaux HTML pour prévenir les injections XSS. */
function esc(value: string): string {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function setLoadingVisible(visible: boolean): void {
  const loadingEl = document.getElementById("loading-state") as HTMLDivElement;
  const taskListEl = document.getElementById("task-list")    as HTMLDivElement;
  const emptyEl    = document.getElementById("empty-state")  as HTMLDivElement;

  loadingEl.style.display = visible ? "flex" : "none";
  if (visible) {
    taskListEl.style.display = "none";
    emptyEl.style.display    = "none";
  }
}

function updateTaskCounter(): void {
  const counterEl = document.getElementById("counter-total");
  if (counterEl) counterEl.textContent = String(allTasks.length);
}

function showToast(message: string, type: "success" | "error" | "info" = "info"): void {
  const container = document.getElementById("toast-container") as HTMLDivElement;
  const icons = { success: "✓", error: "✕", info: "ℹ" };

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span>${icons[type]}</span><span>${esc(message)}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("hide");
    toast.addEventListener("animationend", () => toast.remove());
  }, 3000);
}

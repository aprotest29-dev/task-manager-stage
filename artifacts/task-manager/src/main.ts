/**
 * Point d'entrée principal de l'application Task Manager.
 * Importe les styles globaux et initialise le module applicatif.
 */

import "./style.css";
import { initApp } from "./app";

// Initialiser l'application une fois le DOM prêt
document.addEventListener("DOMContentLoaded", initApp);

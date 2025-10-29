// Section : Importations nécessaires
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

// Section : Logique métier et structure du module
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// ──────────────────────────────────
// Hop-Syder Développeur
// Full Stack & Data Scientist Nexus Partners
// 📧 daoudaabassichristian@gmail.com
// 📱 +229 0196701733
// 🌐 nexuspartners.xyz
// ──────────────────────────────────

const isLocalhost =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";

export const API_BASE = isLocalhost ? "http://127.0.0.1:8787" : "";

export const categories = [
  { key: "warmup", labelKey: "catWarmup", color: "bg-amber-50 border-l-amber-400 dark:bg-amber-900/20 dark:border-l-amber-500" },
  { key: "blok_a", labelKey: "catBlokA", color: "bg-blue-50 border-l-blue-400 dark:bg-blue-900/20 dark:border-l-blue-500" },
  { key: "blok_b", labelKey: "catBlokB", color: "bg-slate-50 border-l-slate-400 dark:bg-slate-700/30 dark:border-l-slate-500" },
  { key: "blok_c", labelKey: "catBlokC", color: "bg-teal-50 border-l-teal-400 dark:bg-teal-900/20 dark:border-l-teal-500" },
  { key: "cooldown", labelKey: "catCooldown", color: "bg-indigo-50 border-l-indigo-400 dark:bg-indigo-900/20 dark:border-l-indigo-500" }
];

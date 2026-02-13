const isLocalhost =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";

export const API_BASE = isLocalhost ? "http://127.0.0.1:8787" : "";

export const categories = [
  { key: "warmup", label: "Warming-up", color: "bg-amber-50 border-l-amber-400 dark:bg-amber-900/20 dark:border-l-amber-500" },
  { key: "blok_a", label: "Blok A — Knie-revalidatie", color: "bg-blue-50 border-l-blue-400 dark:bg-blue-900/20 dark:border-l-blue-500" },
  { key: "blok_b", label: "Blok B — Upper body", color: "bg-slate-50 border-l-slate-400 dark:bg-slate-700/30 dark:border-l-slate-500" },
  { key: "blok_c", label: "Blok C — Stabiliteit", color: "bg-teal-50 border-l-teal-400 dark:bg-teal-900/20 dark:border-l-teal-500" },
  { key: "cooldown", label: "Cooling down", color: "bg-indigo-50 border-l-indigo-400 dark:bg-indigo-900/20 dark:border-l-indigo-500" }
];

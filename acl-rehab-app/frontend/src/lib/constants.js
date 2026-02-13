const isLocalhost =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";

export const API_BASE = isLocalhost ? "http://127.0.0.1:8787" : "";

export const categories = [
  { key: "warmup", label: "☀️ Warming-up", color: "bg-amber-100 border-amber-300" },
  { key: "blok_a", label: "🦵 Blok A — Knie-revalidatie", color: "bg-blue-100 border-blue-300" },
  { key: "blok_b", label: "💪 Blok B — Upper body", color: "bg-slate-200 border-slate-400" },
  { key: "blok_c", label: "⚖️ Blok C — Stabiliteit", color: "bg-teal-100 border-teal-300" },
  { key: "cooldown", label: "❄️ Cooling down", color: "bg-indigo-100 border-indigo-300" }
];

import { useEffect, useState } from "react";

export default function LoginSetup({ hasUser, initialName, onSubmit, error, busy }) {
  const [name, setName] = useState(initialName || "");
  const [pin, setPin] = useState("");

  useEffect(() => {
    setName(initialName || "");
  }, [initialName]);

  return (
    <div className="min-h-screen bg-primary p-6 text-white">
      <h1 className="text-3xl font-bold">ACL Revalidatie</h1>
      <p className="mt-2 text-slate-200">{hasUser ? "Log in met naam en PIN" : "Stel je naam en PIN in"}</p>
      <div className="mt-8 card text-slate-900">
        <label className="mb-4 block">
          <span className="text-sm font-semibold">Naam</span>
          <input
            className="mt-1 w-full rounded-xl border p-3"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="username"
          />
        </label>
        <label className="mb-4 block">
          <span className="text-sm font-semibold">PIN (4 cijfers)</span>
          <input
            className="mt-1 w-full rounded-xl border p-3"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
            inputMode="numeric"
            type="password"
            autoComplete="current-password"
          />
        </label>
        {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
        <button
          className="touch-btn w-full bg-accent text-white disabled:opacity-60"
          onClick={() => onSubmit({ name, pin })}
          disabled={busy || pin.length !== 4 || !name.trim()}
        >
          {busy ? "Bezig..." : hasUser ? "Inloggen" : "Account maken"}
        </button>
      </div>
    </div>
  );
}

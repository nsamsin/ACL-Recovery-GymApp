import { useState } from "react";

export default function LoginSetup({ hasUser, onSubmit, error }) {
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");

  return (
    <div className="min-h-screen bg-primary p-6 text-white">
      <h1 className="text-3xl font-bold">ACL Revalidatie</h1>
      <p className="mt-2 text-slate-200">{hasUser ? "Voer je PIN in" : "Stel je naam en PIN in"}</p>
      <div className="mt-8 card text-slate-900">
        {!hasUser && (
          <label className="block mb-4">
            <span className="text-sm font-semibold">Naam</span>
            <input className="mt-1 w-full rounded-xl border p-3" value={name} onChange={(e) => setName(e.target.value)} />
          </label>
        )}
        <label className="block mb-4">
          <span className="text-sm font-semibold">PIN (4 cijfers)</span>
          <input
            className="mt-1 w-full rounded-xl border p-3"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
            inputMode="numeric"
          />
        </label>
        {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
        <button
          className="touch-btn w-full bg-accent text-white"
          onClick={() => onSubmit({ name, pin })}
          disabled={pin.length !== 4 || (!hasUser && !name.trim())}
        >
          {hasUser ? "Inloggen" : "Account maken"}
        </button>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";

export default function LoginSetup({ hasUser, initialName, onSubmit, error, busy }) {
  const [name, setName] = useState(initialName || "");
  const [pin, setPin] = useState("");

  useEffect(() => {
    setName(initialName || "");
  }, [initialName]);

  return (
    <div className="min-h-screen p-6 text-white" style={{ background: "linear-gradient(145deg, #1a2744 0%, #2a3f6f 100%)" }}>
      <h1 className="text-3xl font-bold">ACL Revalidatie</h1>
      <p className="mt-2 text-white/70">{hasUser ? "Welkom terug!" : "Stel je naam en PIN in"}</p>
      <div className="mt-8 card animate-slide-up">
        {hasUser ? (
          <p className="mb-4 text-lg font-semibold">{name}</p>
        ) : (
          <label className="mb-4 block">
            <span className="text-[13px] font-semibold text-[#8e8e93]">Naam</span>
            <input
              className="ios-input mt-1"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="username"
            />
          </label>
        )}
        <label className="mb-4 block">
          <span className="text-[13px] font-semibold text-[#8e8e93]">PIN (4 cijfers)</span>
          <input
            className="ios-input mt-1"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
            inputMode="numeric"
            type="password"
            autoComplete="current-password"
          />
        </label>
        {error && <p className="mb-3 text-sm text-ios-red">{error}</p>}
        <button
          className="btn-primary"
          onClick={() => onSubmit({ name, pin })}
          disabled={busy || pin.length !== 4 || !name.trim()}
        >
          {busy ? "Bezig..." : hasUser ? "Inloggen" : "Account maken"}
        </button>
      </div>
    </div>
  );
}

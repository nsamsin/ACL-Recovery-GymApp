import { useEffect, useState } from "react";
import { useT } from "../lib/i18n";

export default function LoginSetup({ hasUser, initialName, onSubmit, error, busy }) {
  const t = useT();
  const [name, setName] = useState(initialName || "");
  const [pin, setPin] = useState("");
  const [mode, setMode] = useState(hasUser ? "login" : "register");

  useEffect(() => {
    setName(initialName || "");
  }, [initialName]);

  const isLogin = hasUser || mode === "login";

  return (
    <div className="min-h-screen p-6 text-white" style={{ background: "linear-gradient(145deg, #1a2744 0%, #2a3f6f 100%)" }}>
      <h1 className="text-3xl font-bold">{t("appTitle")}</h1>
      <p className="mt-2 text-white/70">
        {hasUser ? t("welcomeBack") : isLogin ? t("loginPrompt") : t("setupPrompt")}
      </p>
      <div className="mt-8 card animate-slide-up">
        {hasUser ? (
          <p className="mb-4 text-lg font-semibold">{name}</p>
        ) : (
          <label className="mb-4 block">
            <span className="text-[13px] font-semibold text-[#8e8e93]">{t("name")}</span>
            <input
              className="ios-input mt-1"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="username"
            />
          </label>
        )}
        <label className="mb-4 block">
          <span className="text-[13px] font-semibold text-[#8e8e93]">{t("pin4")}</span>
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
          onClick={() => onSubmit({ name, pin, mode: isLogin ? "login" : "register" })}
          disabled={busy || pin.length !== 4 || !name.trim()}
        >
          {busy ? t("busy") : isLogin ? t("logIn") : t("createAccount")}
        </button>
        {!hasUser && (
          <button
            className="mt-3 w-full text-center text-[14px] text-[#007aff] bg-transparent border-none"
            onClick={() => { setMode(mode === "login" ? "register" : "login"); setPin(""); }}
          >
            {isLogin ? t("noAccount") : t("haveAccount")}
          </button>
        )}
      </div>
    </div>
  );
}

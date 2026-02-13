import { useEffect, useMemo, useState } from "react";
import { api } from "./lib/api";
import LoginSetup from "./components/LoginSetup";
import Dashboard from "./components/Dashboard";
import SessionView from "./components/SessionView";
import HealthLog from "./components/HealthLog";
import Progress from "./components/Progress";
import ShareView from "./components/ShareView";
import Settings from "./components/Settings";

const tabs = ["dashboard", "sessie", "dagboek", "progressie", "delen", "settings"];

function ShareRoute({ token }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.share(token).then(setData).catch((e) => setError(e.message));
  }, [token]);

  return (
    <main className="min-h-screen bg-slate-100 p-4">
      <header className="mb-4 rounded-2xl bg-primary p-4 text-white">
        <h1 className="text-lg font-bold">ACL Revalidatie - Read-only</h1>
      </header>
      {error && <div className="card text-red-700">{error}</div>}
      {data ? (
        <div className="space-y-3">
          <div className="card"><p className="font-semibold">Patiënt: {data.user?.name || "Onbekend"}</p></div>
          <div className="card"><p>Sessies: {data.sessions?.length || 0}</p><p>Health logs: {data.healthLog?.length || 0}</p></div>
        </div>
      ) : !error ? (
        <div className="card">Laden...</div>
      ) : null}
    </main>
  );
}

export default function App() {
  const shareTokenFromPath = window.location.pathname.startsWith("/share/")
    ? window.location.pathname.split("/")[2]
    : "";

  if (shareTokenFromPath) {
    return <ShareRoute token={shareTokenFromPath} />;
  }

  const [authChecked, setAuthChecked] = useState(false);
  const [user, setUser] = useState(null);
  const [hasUser, setHasUser] = useState(!!localStorage.getItem("acl_has_user"));
  const [error, setError] = useState("");
  const [tab, setTab] = useState("dashboard");
  const [exercises, setExercises] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [healthLog, setHealthLog] = useState([]);
  const [shareData, setShareData] = useState(null);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [sessionState, setSessionState] = useState({});

  useEffect(() => {
    const id = localStorage.getItem("acl_user_id");
    const name = localStorage.getItem("acl_user_name");
    const shareToken = localStorage.getItem("acl_share_token");
    if (id && name) {
      setUser({ id, name, share_token: shareToken });
      hydrate();
    }
    setAuthChecked(true);
  }, []);

  async function hydrate() {
    try {
      const [ex, ss, hl] = await Promise.all([api.exercises(), api.sessions(), api.healthLog()]);
      setExercises(ex.items || []);
      setSessions(ss.items || []);
      setHealthLog(hl.items || []);
    } catch {
      setError("Kon data niet laden");
    }
  }

  const orderedExercises = useMemo(() => [...exercises].sort((a, b) => a.sort_order - b.sort_order), [exercises]);

  useEffect(() => {
    const init = {};
    orderedExercises.forEach((e) => {
      init[e.id] = {
        completed: false,
        sets_completed: e.default_sets,
        reps_completed: e.default_reps,
        weight_used: localStorage.getItem(`last_weight_${e.id}`) || e.default_weight,
        notes: ""
      };
    });
    setSessionState(init);
  }, [orderedExercises]);

  async function onAuthSubmit({ name, pin }) {
    setError("");
    try {
      const data = hasUser ? await api.login(pin) : await api.register(name, pin);
      localStorage.setItem("acl_user_id", data.user.id);
      localStorage.setItem("acl_user_name", data.user.name);
      localStorage.setItem("acl_share_token", data.user.share_token);
      localStorage.setItem("acl_has_user", "1");
      setHasUser(true);
      setUser(data.user);
      await hydrate();
    } catch (e) {
      setError(e.message);
    }
  }

  async function startSession() {
    const created = await api.createSession();
    setActiveSessionId(created.session.id);
    setTab("sessie");
  }

  function onChangeExercise(id, field, value) {
    setSessionState((prev) => ({ ...prev, [id]: { ...(prev[id] || {}), [field]: value } }));
    if (field === "weight_used") {
      localStorage.setItem(`last_weight_${id}`, value);
    }
  }

  async function finishSession() {
    if (!activeSessionId) return;
    await Promise.all(
      Object.entries(sessionState).map(([exercise_id, payload]) => api.logSessionExercise(activeSessionId, { exercise_id, ...payload }))
    );
    await api.finishSession(activeSessionId, { completed: true });
    setActiveSessionId(null);
    await hydrate();
    setTab("dashboard");
  }

  async function saveHealth(payload) {
    await api.addHealthLog(payload);
    await hydrate();
    setTab("dashboard");
  }

  async function loadShare() {
    if (!user?.share_token) return;
    const data = await api.share(user.share_token);
    setShareData(data);
  }

  function exportJson() {
    const blob = new Blob([JSON.stringify({ user, sessions, healthLog, exercises }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "acl-revalidatie-export.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  if (!authChecked) return null;
  if (!user) return <LoginSetup hasUser={hasUser} onSubmit={onAuthSubmit} error={error} />;

  return (
    <main className="min-h-screen bg-slate-100 p-3 pb-24">
      <header className="mb-4 rounded-2xl bg-primary p-4 text-white">
        <h1 className="text-lg font-bold">ACL Revalidatie Gym App</h1>
      </header>

      {tab === "dashboard" && <Dashboard user={user} sessions={sessions} healthLog={healthLog} onStartSession={startSession} onOpenHealth={() => setTab("dagboek")} />}
      {tab === "sessie" && <SessionView exercises={orderedExercises} sessionState={sessionState} onChangeExercise={onChangeExercise} onFinish={finishSession} />}
      {tab === "dagboek" && <HealthLog onSave={saveHealth} />}
      {tab === "progressie" && <Progress sessions={sessions} healthLog={healthLog} />}
      {tab === "delen" && <ShareView shareToken={user.share_token} shareData={shareData} onLoadShare={loadShare} />}
      {tab === "settings" && <Settings user={user} shareToken={user.share_token} onExport={exportJson} />}

      <nav className="fixed bottom-0 left-0 right-0 mx-auto grid max-w-xl grid-cols-6 gap-1 border-t bg-white p-2">
        {tabs.map((t) => (
          <button
            key={t}
            className={`touch-btn text-xs ${tab === t ? "bg-accent text-white" : "bg-slate-200"}`}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </nav>
    </main>
  );
}

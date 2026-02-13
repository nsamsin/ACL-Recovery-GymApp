import { useEffect, useMemo, useState } from "react";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { api, syncQueuedWrites } from "./lib/api";
import LoginSetup from "./components/LoginSetup";
import Dashboard from "./components/Dashboard";
import SessionView from "./components/SessionView";
import HealthLog from "./components/HealthLog";
import Progress from "./components/Progress";
import ShareView from "./components/ShareView";
import Settings from "./components/Settings";

const tabConfig = [
  { key: "dashboard", label: "Home", icon: "house" },
  { key: "sessie", label: "Sessie", icon: "dumbbell" },
  { key: "dagboek", label: "Dagboek", icon: "book" },
  { key: "progressie", label: "Progressie", icon: "chart" },
  { key: "meer", label: "Meer", icon: "gear" }
];

function TabIcon({ name, active }) {
  const color = active ? "#007aff" : "#8e8e93";
  const props = { width: 22, height: 22, fill: "none", stroke: color, strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" };

  switch (name) {
    case "house":
      return (
        <svg {...props} viewBox="0 0 24 24">
          <path d="M3 10.5L12 3l9 7.5V20a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1z" />
        </svg>
      );
    case "dumbbell":
      return (
        <svg {...props} viewBox="0 0 24 24">
          <path d="M6.5 6.5a2 2 0 00-2 2v7a2 2 0 004 0v-7a2 2 0 00-2-2zM17.5 6.5a2 2 0 00-2 2v7a2 2 0 004 0v-7a2 2 0 00-2-2zM8.5 12h7M2 10v4M22 10v4" />
        </svg>
      );
    case "book":
      return (
        <svg {...props} viewBox="0 0 24 24">
          <path d="M4 4h5a3 3 0 013 3v13a2 2 0 00-2-2H4zM20 4h-5a3 3 0 00-3 3v13a2 2 0 012-2h6z" />
        </svg>
      );
    case "chart":
      return (
        <svg {...props} viewBox="0 0 24 24">
          <path d="M3 3v18h18" />
          <path d="M7 16l4-5 4 3 5-7" />
        </svg>
      );
    case "gear":
      return (
        <svg {...props} viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
        </svg>
      );
    default:
      return null;
  }
}

function ShareRoute({ token }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.share(token).then(setData).catch((e) => setError(e.message));
  }, [token]);

  const trend = (data?.healthLog || []).slice().reverse().map((h) => ({ date: h.date, pijn: h.pain, zwelling: h.swelling }));
  const perExercise = Object.values(
    (data?.sessionExercises || []).reduce((acc, row) => {
      if (!acc[row.exercise_id]) acc[row.exercise_id] = { name: row.exercise_name, logs: 0, completed: 0, weights: [] };
      acc[row.exercise_id].logs += 1;
      if (row.completed) acc[row.exercise_id].completed += 1;
      if (row.weight_used != null) acc[row.exercise_id].weights.push({ date: row.session_date || row.date, weight: Number(row.weight_used) });
      return acc;
    }, {})
  );

  return (
    <main className="min-h-screen bg-surface-secondary p-4">
      <header className="glass-header mb-4 rounded-ios-lg p-4 text-white">
        <h1 className="text-lg font-bold">ACL Revalidatie - Read-only</h1>
      </header>
      {error && <div className="card text-ios-red">{error}</div>}
      {data ? (
        <div className="space-y-3">
          <div className="card"><p className="font-semibold">Patiënt: {data.user?.name || "Onbekend"}</p></div>
          <div className="card"><p className="text-sm">Sessies: {data.sessions?.length || 0}</p><p className="text-sm">Oefening-logs: {data.sessionExercises?.length || 0}</p></div>
          <div className="card h-64">
            <p className="font-semibold">Pijn/zwelling trend</p>
            <ResponsiveContainer width="100%" height="85%">
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 10]} />
                <Tooltip />
                <Line type="monotone" dataKey="pijn" stroke="#ff3b30" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="zwelling" stroke="#ff9500" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="card">
            <p className="mb-2 font-semibold">Progressie per oefening</p>
            <ul className="space-y-1 text-sm">
              {perExercise.slice(0, 12).map((e) => (
                <li key={e.name}>{e.name}: {e.completed}/{e.logs} afgerond</li>
              ))}
            </ul>
          </div>
          {perExercise.some((e) => e.weights.length > 0) && (
            <div className="card">
              <p className="mb-2 font-semibold">Gewichtsprogressie</p>
              {perExercise.filter((e) => e.weights.length > 0).slice(0, 12).map((e) => {
                const sorted = [...e.weights].sort((a, b) => a.date < b.date ? -1 : 1);
                const first = sorted[0];
                const latest = sorted[sorted.length - 1];
                const diff = latest.weight - first.weight;
                return (
                  <div key={e.name} className="mb-3">
                    <p className="text-sm font-medium">{e.name}</p>
                    <ResponsiveContainer width="100%" height={80}>
                      <LineChart data={sorted}>
                        <XAxis dataKey="date" hide />
                        <YAxis domain={["dataMin - 1", "dataMax + 1"]} hide />
                        <Tooltip />
                        <Line type="monotone" dataKey="weight" stroke="#007aff" dot={false} strokeWidth={2.5} />
                      </LineChart>
                    </ResponsiveContainer>
                    <p className="text-xs text-[#8e8e93]">
                      {first.weight} kg → {latest.weight} kg
                      {diff !== 0 && <span className={diff > 0 ? " text-ios-green" : " text-ios-red"}> ({diff > 0 ? "+" : ""}{diff} kg)</span>}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : !error ? (
        <div className="card">Laden...</div>
      ) : null}
    </main>
  );
}

function MainApp() {
  const [authChecked, setAuthChecked] = useState(false);
  const [user, setUser] = useState(null);
  const [hasUser, setHasUser] = useState(!!localStorage.getItem("acl_has_user"));
  const [error, setError] = useState("");
  const [authBusy, setAuthBusy] = useState(false);
  const [actionBusy, setActionBusy] = useState("");
  const [tab, setTab] = useState("dashboard");
  const [exercises, setExercises] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [healthLog, setHealthLog] = useState([]);
  const [shareData, setShareData] = useState(null);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [sessionState, setSessionState] = useState({});
  const [syncStatus, setSyncStatus] = useState("");
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("acl_theme") || "dark";
    document.documentElement.classList.toggle("dark", saved === "dark");
    return saved;
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("acl_theme", theme);
  }, [theme]);

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

  useEffect(() => {
    const onOnline = async () => {
      const res = await syncQueuedWrites();
      if (res.synced > 0) {
        setSyncStatus(`${res.synced} offline acties gesynchroniseerd`);
        await hydrate();
        setTimeout(() => setSyncStatus(""), 4000);
      }
    };
    window.addEventListener("online", onOnline);
    onOnline();
    return () => window.removeEventListener("online", onOnline);
  }, []);

  async function hydrate() {
    try {
      const [ex, ss, hl] = await Promise.all([api.exercises(), api.sessions(), api.healthLog()]);
      setExercises(ex.items || []);
      setSessions(ss.items || []);
      setHealthLog(hl.items || []);
      setError("");
    } catch (e) {
      setError(e.message || "Kon data niet laden");
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
    setAuthBusy(true);
    try {
      const data = hasUser
        ? await api.login({ pin, name, user_id: localStorage.getItem("acl_user_id") || undefined })
        : await api.register(name, pin);

      localStorage.setItem("acl_user_id", data.user.id);
      localStorage.setItem("acl_user_name", data.user.name);
      localStorage.setItem("acl_share_token", data.user.share_token);
      localStorage.setItem("acl_has_user", "1");
      setHasUser(true);
      setUser(data.user);
      await hydrate();
    } catch (e) {
      setError(e.message);
    } finally {
      setAuthBusy(false);
    }
  }

  async function startSession() {
    setActionBusy("Sessie starten...");
    try {
      const created = await api.createSession();
      if (created.queued) {
        setSyncStatus("Offline: sessie start is in wachtrij gezet");
        return;
      }
      setActiveSessionId(created.session.id);
      setTab("sessie");
      setError("");
    } catch (e) {
      setError(e.message);
    } finally {
      setActionBusy("");
    }
  }

  function onChangeExercise(id, field, value) {
    setSessionState((prev) => ({ ...prev, [id]: { ...(prev[id] || {}), [field]: value } }));
    if (field === "weight_used") {
      localStorage.setItem(`last_weight_${id}`, value);
    }
  }

  async function finishSession() {
    if (!activeSessionId) return;
    setActionBusy("Sessie afronden...");
    try {
      const logResults = await Promise.all(
        Object.entries(sessionState).map(([exercise_id, payload]) =>
          api.logSessionExercise(activeSessionId, { exercise_id, ...payload })
        )
      );
      const finishRes = await api.finishSession(activeSessionId, { completed: true });
      if (finishRes.queued || logResults.some((r) => r?.queued)) {
        setSyncStatus("Offline: sessie-updates staan in wachtrij");
      }
      setActiveSessionId(null);
      await hydrate();
      setTab("dashboard");
      setError("");
    } catch (e) {
      setError(e.message);
    } finally {
      setActionBusy("");
    }
  }

  async function saveHealth(payload) {
    setActionBusy("Dagboek opslaan...");
    try {
      const res = await api.addHealthLog(payload);
      if (res.queued) setSyncStatus("Offline: dagboekentry in wachtrij");
      await hydrate();
      setTab("dashboard");
      setError("");
    } catch (e) {
      setError(e.message);
    } finally {
      setActionBusy("");
    }
  }

  async function loadShare() {
    if (!user?.share_token) return;
    setActionBusy("Share data laden...");
    try {
      const data = await api.share(user.share_token);
      setShareData(data);
      setError("");
    } catch (e) {
      setError(e.message);
    } finally {
      setActionBusy("");
    }
  }

  async function updateName(name) {
    const res = await api.updateName(name);
    if (res.queued) {
      setSyncStatus("Offline: naamwijziging in wachtrij");
      return;
    }
    localStorage.setItem("acl_user_name", res.user.name);
    setUser((prev) => ({ ...prev, ...res.user }));
  }

  async function updatePin(currentPin, newPin) {
    await api.updatePin(currentPin, newPin);
  }

  async function createExercise(payload) {
    const res = await api.createExercise(payload);
    if (res.queued) setSyncStatus("Offline: oefening toevoegen in wachtrij");
    await hydrate();
  }

  async function deleteExercise(id) {
    const res = await api.deleteExercise(id);
    if (res.queued) setSyncStatus("Offline: oefening verwijderen in wachtrij");
    await hydrate();
  }

  async function reorderExercises(order) {
    const res = await api.reorderExercises(order);
    if (res.queued) setSyncStatus("Offline: volgorde in wachtrij");
    await hydrate();
  }

  function exportJson() {
    const blob = new Blob([JSON.stringify({ user, sessions, healthLog, exercises }, null, 2)], {
      type: "application/json"
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "acl-revalidatie-export.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  const tabTitle = {
    dashboard: "Home",
    sessie: "Sessie",
    dagboek: "Dagboek",
    progressie: "Progressie",
    meer: "Meer"
  };

  if (!authChecked) return null;
  if (!user) {
    return (
      <LoginSetup
        hasUser={hasUser}
        initialName={localStorage.getItem("acl_user_name") || ""}
        onSubmit={onAuthSubmit}
        error={error}
        busy={authBusy}
      />
    );
  }

  return (
    <main className="min-h-screen bg-surface-secondary pb-24">
      <header className="glass-header sticky top-0 z-30 px-4 py-3 text-white text-center">
        <h1 className="text-[17px] font-semibold">{tabTitle[tab] || "ACL Revalidatie"}</h1>
      </header>

      <div className="p-4 space-y-3">
        {error && (
          <div className="flex items-center gap-2 rounded-ios bg-ios-red/10 px-4 py-3 text-sm text-ios-red">
            <span>{error}</span>
          </div>
        )}
        {actionBusy && (
          <div className="flex items-center gap-2 rounded-ios bg-ios-blue/10 px-4 py-3 text-sm text-ios-blue">
            <span>{actionBusy}</span>
          </div>
        )}
        {syncStatus && (
          <div className="flex items-center gap-2 rounded-ios bg-ios-green/10 px-4 py-3 text-sm text-ios-green">
            <span>{syncStatus}</span>
          </div>
        )}

        <div className="tab-content" key={tab}>
          {tab === "dashboard" && (
            <Dashboard
              user={user}
              sessions={sessions}
              healthLog={healthLog}
              onStartSession={startSession}
              onOpenHealth={() => setTab("dagboek")}
            />
          )}
          {tab === "sessie" && (
            <SessionView
              exercises={orderedExercises}
              sessionState={sessionState}
              onChangeExercise={onChangeExercise}
              onFinish={finishSession}
            />
          )}
          {tab === "dagboek" && <HealthLog onSave={saveHealth} />}
          {tab === "progressie" && <Progress sessions={sessions} healthLog={healthLog} exercises={orderedExercises} />}
          {tab === "meer" && (
            <div className="space-y-4">
              <ShareView shareToken={user.share_token} shareData={shareData} onLoadShare={loadShare} />
              <Settings
                user={user}
                shareToken={user.share_token}
                exercises={orderedExercises}
                onExport={exportJson}
                onUpdateName={updateName}
                onUpdatePin={updatePin}
                onCreateExercise={createExercise}
                onDeleteExercise={deleteExercise}
                onReorderExercises={reorderExercises}
                theme={theme}
                onToggleTheme={() => setTheme((t) => t === "dark" ? "light" : "dark")}
              />
            </div>
          )}
        </div>
      </div>

      <nav className="glass-nav fixed bottom-0 left-0 right-0 z-30 shadow-ios-nav">
        <div className="mx-auto grid max-w-xl grid-cols-5 px-2 pt-1">
          {tabConfig.map((t) => {
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                className="flex flex-col items-center gap-0.5 py-1 bg-transparent border-none"
                onClick={() => setTab(t.key)}
              >
                <TabIcon name={t.icon} active={active} />
                <span className={`text-[10px] font-medium ${active ? "text-[#007aff]" : "text-[#8e8e93]"}`}>
                  {t.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
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

  return <MainApp />;
}

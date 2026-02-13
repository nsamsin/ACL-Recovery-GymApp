import { useEffect, useMemo, useState } from "react";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { api } from "../lib/api";

function parseWeightNumber(weight) {
  if (!weight) return null;
  const m = String(weight).replace(",", ".").match(/\d+(\.\d+)?/);
  return m ? Number(m[0]) : null;
}

export default function Progress({ sessions, healthLog, exercises }) {
  const painData = healthLog.map((h) => ({ date: h.date, pijn: h.pain, zwelling: h.swelling })).reverse();
  const sessionData = sessions
    .slice()
    .reverse()
    .map((s, i) => ({ date: s.date, cumulatief: i + 1 }));

  const [exerciseId, setExerciseId] = useState("");
  const [exerciseProgress, setExerciseProgress] = useState([]);
  const [loadingProgress, setLoadingProgress] = useState(false);

  useEffect(() => {
    if (!exerciseId && exercises.length) setExerciseId(exercises[0].id);
  }, [exerciseId, exercises]);

  useEffect(() => {
    if (!exerciseId) return;
    setLoadingProgress(true);
    api.progress(exerciseId)
      .then((res) => {
        const rows = (res.items || []).map((row) => ({
          ...row,
          gewicht_num: parseWeightNumber(row.weight_used)
        }));
        setExerciseProgress(rows);
      })
      .finally(() => setLoadingProgress(false));
  }, [exerciseId]);

  const completedSessions = useMemo(
    () => sessions.filter((s) => s.completed_at).slice().sort((a, b) => b.date.localeCompare(a.date)),
    [sessions]
  );

  return (
    <div className="animate-stagger space-y-4">
      <div className="card h-72">
        <h3 className="font-semibold">Pijn / Zwelling trend</h3>
        <ResponsiveContainer width="100%" height="85%">
          <LineChart data={painData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={[0, 10]} />
            <Tooltip />
            <Line type="monotone" dataKey="pijn" stroke="#ff3b30" strokeWidth={2.5} dot={false} />
            <Line type="monotone" dataKey="zwelling" stroke="#ff9500" strokeWidth={2.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="card h-64">
        <h3 className="font-semibold">Sessiehistorie (cumulatief)</h3>
        <ResponsiveContainer width="100%" height="85%">
          <LineChart data={sessionData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Line type="monotone" dataKey="cumulatief" stroke="#007aff" strokeWidth={2.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="card h-72">
        <div className="mb-2 flex items-center justify-between gap-2">
          <h3 className="font-semibold">Gewichtprogressie per oefening</h3>
          <select className="ios-select max-w-[160px]" value={exerciseId} onChange={(e) => setExerciseId(e.target.value)}>
            {exercises.map((e) => (
              <option key={e.id} value={e.id}>{e.name}</option>
            ))}
          </select>
        </div>
        {loadingProgress ? <p className="text-[13px] text-[#8e8e93]">Laden...</p> : null}
        <ResponsiveContainer width="100%" height="80%">
          <LineChart data={exerciseProgress}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip formatter={(value, name, ctx) => (name === "gewicht_num" ? [ctx.payload.weight_used, "Gewicht"] : [value, name])} />
            <Line type="monotone" dataKey="gewicht_num" stroke="#34c759" strokeWidth={2.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="card">
        <h3 className="font-semibold">Afgeronde sessies</h3>
        <ul className="mt-2 space-y-1 text-sm text-[#8e8e93]">
          {completedSessions.length === 0 ? <li>Geen afgeronde sessies.</li> : null}
          {completedSessions.map((s) => (
            <li key={s.id}>{new Date(`${s.date}T00:00:00`).toLocaleDateString("nl-NL")} {s.notes ? `- ${s.notes}` : ""}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

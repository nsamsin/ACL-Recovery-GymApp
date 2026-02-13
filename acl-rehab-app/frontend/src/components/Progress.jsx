import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function Progress({ sessions, healthLog }) {
  const painData = healthLog.map((h) => ({ date: h.date, pijn: h.pain, zwelling: h.swelling })).reverse();
  const sessionData = sessions.map((s, i) => ({ index: i + 1, sessies: 1 }));

  return (
    <div className="space-y-4">
      <div className="card h-72">
        <h3 className="font-semibold">Pijn / Zwelling trend</h3>
        <ResponsiveContainer width="100%" height="85%">
          <LineChart data={painData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={[0, 10]} />
            <Tooltip />
            <Line type="monotone" dataKey="pijn" stroke="#ef4444" />
            <Line type="monotone" dataKey="zwelling" stroke="#f59e0b" />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="card h-64">
        <h3 className="font-semibold">Sessiehistorie</h3>
        <ResponsiveContainer width="100%" height="85%">
          <LineChart data={sessionData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="index" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Line type="monotone" dataKey="sessies" stroke="#3b82f6" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

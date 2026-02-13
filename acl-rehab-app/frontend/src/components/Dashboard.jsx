export default function Dashboard({ user, sessions, healthLog, onStartSession, onOpenHealth }) {
  const thisWeek = sessions.filter((s) => {
    const d = new Date(s.date);
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - 7);
    return d >= start;
  }).length;

  const last = healthLog[0];
  const riskColor = !last ? "bg-slate-200" : last.pain <= 3 ? "bg-green-200" : last.pain <= 6 ? "bg-orange-200" : "bg-red-200";

  return (
    <div className="space-y-4">
      <div className="card">
        <h2 className="text-xl font-bold">Welkom, {user.name}</h2>
        <p className="text-sm text-slate-600">Volgende sessie: maandag / woensdag / vrijdag</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="card"><p className="text-sm text-slate-500">Sessies deze week</p><p className="text-2xl font-bold">{thisWeek}</p></div>
        <div className="card"><p className="text-sm text-slate-500">Streak</p><p className="text-2xl font-bold">{Math.min(thisWeek, 3)} dagen</p></div>
      </div>

      <div className={`card ${riskColor}`}>
        <p className="text-sm">Laatste pijn/zwelling</p>
        {last ? <p className="font-semibold">Pijn {last.pain}/10 · Zwelling {last.swelling}/10</p> : <p>Nog geen dagboekdata</p>}
      </div>

      <button className="touch-btn w-full bg-accent text-white" onClick={onStartSession}>Start Sessie</button>
      <button className="touch-btn w-full bg-primary text-white" onClick={onOpenHealth}>Dagboek invullen</button>
    </div>
  );
}

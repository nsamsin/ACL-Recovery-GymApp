function nextPlannedSessionLabel() {
  const now = new Date();
  const plannedDays = [1, 3, 5];
  for (let i = 0; i < 7; i += 1) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    if (plannedDays.includes(d.getDay())) {
      return d.toLocaleDateString("nl-NL", { weekday: "long", day: "2-digit", month: "2-digit" });
    }
  }
  return "onbekend";
}

function workoutStreak(sessions) {
  const plannedDays = [1, 3, 5]; // Mon, Wed, Fri
  const sessionDates = new Set(sessions.map((s) => s.date));
  if (!sessionDates.size) return 0;

  // Walk backwards through planned workout days starting from today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let streak = 0;
  let d = new Date(today);

  // Rewind to the most recent planned day (today or earlier)
  while (!plannedDays.includes(d.getDay())) {
    d.setDate(d.getDate() - 1);
  }

  // If the most recent planned day is today and no session yet, start from previous planned day
  const todayStr = today.toISOString().slice(0, 10);
  const latestStr = d.toISOString().slice(0, 10);
  if (latestStr === todayStr && !sessionDates.has(todayStr)) {
    d.setDate(d.getDate() - 1);
    while (!plannedDays.includes(d.getDay())) {
      d.setDate(d.getDate() - 1);
    }
  }

  // Count consecutive planned days with sessions
  for (let i = 0; i < 100; i += 1) {
    const dateStr = d.toISOString().slice(0, 10);
    if (!sessionDates.has(dateStr)) break;
    streak += 1;
    // Move to previous planned day
    d.setDate(d.getDate() - 1);
    while (!plannedDays.includes(d.getDay())) {
      d.setDate(d.getDate() - 1);
    }
  }

  return streak;
}

export default function Dashboard({ user, sessions, healthLog, onStartSession, onOpenHealth }) {
  const thisWeek = sessions.filter((s) => {
    const d = new Date(s.date);
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - 7);
    return d >= start;
  }).length;

  const streak = workoutStreak(sessions);
  const last = healthLog[0];
  const riskColor = !last ? "bg-slate-200" : last.pain <= 3 ? "bg-green-200" : last.pain <= 6 ? "bg-orange-200" : "bg-red-200";

  return (
    <div className="space-y-4">
      <div className="card">
        <h2 className="text-xl font-bold">Welkom, {user.name}</h2>
        <p className="text-sm text-slate-600">Volgende sessie: {nextPlannedSessionLabel()}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="card"><p className="text-sm text-slate-500">Sessies deze week</p><p className="text-2xl font-bold">{thisWeek}</p></div>
        <div className="card"><p className="text-sm text-slate-500">Streak</p><p className="text-2xl font-bold">{streak} dagen</p></div>
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

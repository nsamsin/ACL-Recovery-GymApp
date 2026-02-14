import { useT } from "../lib/i18n";
import { getLocale, useLang } from "../lib/i18n";

function nextPlannedSessionLabel(locale) {
  const now = new Date();
  const plannedDays = [1, 3, 5];
  for (let i = 0; i < 7; i += 1) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    if (plannedDays.includes(d.getDay())) {
      return d.toLocaleDateString(locale, { weekday: "long", day: "2-digit", month: "2-digit" });
    }
  }
  return null;
}

function workoutStreak(sessions) {
  const plannedDays = [1, 3, 5];
  const sessionDates = new Set(sessions.map((s) => s.date));
  if (!sessionDates.size) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let streak = 0;
  let d = new Date(today);

  while (!plannedDays.includes(d.getDay())) {
    d.setDate(d.getDate() - 1);
  }

  const todayStr = today.toISOString().slice(0, 10);
  const latestStr = d.toISOString().slice(0, 10);
  if (latestStr === todayStr && !sessionDates.has(todayStr)) {
    d.setDate(d.getDate() - 1);
    while (!plannedDays.includes(d.getDay())) {
      d.setDate(d.getDate() - 1);
    }
  }

  for (let i = 0; i < 100; i += 1) {
    const dateStr = d.toISOString().slice(0, 10);
    if (!sessionDates.has(dateStr)) break;
    streak += 1;
    d.setDate(d.getDate() - 1);
    while (!plannedDays.includes(d.getDay())) {
      d.setDate(d.getDate() - 1);
    }
  }

  return streak;
}

export default function Dashboard({ user, sessions, healthLog, onStartSession, onOpenHealth }) {
  const t = useT();
  const { lang } = useLang();
  const locale = getLocale(lang);

  const thisWeek = sessions.filter((s) => {
    const d = new Date(s.date);
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - 7);
    return d >= start;
  }).length;

  const streak = workoutStreak(sessions);
  const last = healthLog[0];
  const riskBg = !last ? "bg-surface-tertiary" : last.pain <= 3 ? "bg-ios-green/10" : last.pain <= 6 ? "bg-ios-orange/10" : "bg-ios-red/10";
  const riskText = !last ? "text-[#8e8e93]" : last.pain <= 3 ? "text-ios-green" : last.pain <= 6 ? "text-ios-orange" : "text-ios-red";

  return (
    <div className="animate-stagger space-y-4">
      <div className="card">
        <h2 className="text-xl font-bold">{t("welcome")} {user.name}</h2>
        <p className="text-[13px] text-[#8e8e93]">{t("nextSession")} {nextPlannedSessionLabel(locale) || t("unknown")}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="card">
          <p className="text-[13px] text-[#8e8e93]">{t("sessionsWeek")}</p>
          <p className="text-[28px] font-bold">{thisWeek}</p>
        </div>
        <div className="card">
          <p className="text-[13px] text-[#8e8e93]">{t("streak")}</p>
          <p className="text-[28px] font-bold">{streak} <span className="text-[17px] font-normal">{t("days")}</span></p>
        </div>
      </div>

      <div className={`card ${riskBg}`}>
        <p className={`text-[13px] ${riskText}`}>{t("lastPainSwelling")}</p>
        {last ? <p className="font-semibold">{t("pain")} {last.pain}/10 · {t("swelling")} {last.swelling}/10</p> : <p>{t("noJournalData")}</p>}
      </div>

      <button className="btn-primary" onClick={onStartSession}>{t("startSession")}</button>
      <button className="btn-secondary" onClick={onOpenHealth}>{t("fillJournal")}</button>
    </div>
  );
}

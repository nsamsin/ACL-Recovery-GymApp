import { useT } from "../lib/i18n";

export default function ShareView({ shareToken, shareData, onLoadShare }) {
  const t = useT();
  const link = `${window.location.origin}/share/${shareToken || "..."}`;

  return (
    <div className="space-y-4">
      <div className="card">
        <p className="font-semibold">{t("shareDesc")}</p>
        <p className="mt-1 break-all text-[13px] text-[#8e8e93]">{link}</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button className="btn-primary" onClick={onLoadShare}>{t("loadOverview")}</button>
          <button className="btn-secondary" onClick={() => navigator.clipboard.writeText(link)}>{t("copyLink")}</button>
        </div>
      </div>
      {shareData ? (
        <div className="space-y-3">
          <div className="card">
            <p className="font-semibold">{t("readOnlySummary")}</p>
            <p className="text-[13px] text-[#8e8e93]">{t("sessions")}: {shareData.sessions?.length || 0}</p>
            <p className="text-[13px] text-[#8e8e93]">{t("healthLogs")}: {shareData.healthLog?.length || 0}</p>
            <p className="text-[13px] text-[#8e8e93]">{t("exerciseLogs")}: {shareData.sessionExercises?.length || 0}</p>
          </div>
          <div className="card">
            <p className="mb-2 font-semibold">{t("recentExercises")}</p>
            <ul className="space-y-1 text-sm">
              {(shareData.sessionExercises || []).slice(0, 8).map((row, idx) => (
                <li key={`${row.session_id}-${row.exercise_id}-${idx}`}>
                  {row.exercise_name}: {row.weight_used || "-"} · {row.reps_completed || "-"}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </div>
  );
}

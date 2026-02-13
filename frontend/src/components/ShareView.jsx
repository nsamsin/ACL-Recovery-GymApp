export default function ShareView({ shareToken, shareData, onLoadShare }) {
  const link = `${window.location.origin}/share/${shareToken || "..."}`;

  return (
    <div className="space-y-4">
      <div className="card">
        <p className="font-semibold">Deellink voor fysiotherapeut</p>
        <p className="break-all text-sm">{link}</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button className="touch-btn bg-slate-900 text-white" onClick={onLoadShare}>Laad read-only overzicht</button>
          <button className="touch-btn bg-slate-200" onClick={() => navigator.clipboard.writeText(link)}>Kopieer link</button>
        </div>
      </div>
      {shareData ? (
        <div className="space-y-3">
          <div className="card">
            <p className="font-semibold">Read-only samenvatting</p>
            <p className="text-sm">Sessies: {shareData.sessions?.length || 0}</p>
            <p className="text-sm">Health logs: {shareData.healthLog?.length || 0}</p>
            <p className="text-sm">Exercise logs: {shareData.sessionExercises?.length || 0}</p>
          </div>
          <div className="card">
            <p className="mb-2 font-semibold">Recente oefeningen</p>
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

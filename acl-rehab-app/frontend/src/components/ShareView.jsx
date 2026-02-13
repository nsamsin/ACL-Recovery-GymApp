export default function ShareView({ shareToken, shareData, onLoadShare }) {
  return (
    <div className="space-y-4">
      <div className="card">
        <p className="font-semibold">Deellink voor fysiotherapeut</p>
        <p className="text-sm break-all">{`${window.location.origin}/share/${shareToken || "..."}`}</p>
        <button className="touch-btn mt-3 w-full bg-slate-900 text-white" onClick={onLoadShare}>Laad read-only overzicht</button>
      </div>
      {shareData ? (
        <div className="card">
          <p className="font-semibold">Read-only samenvatting</p>
          <p className="text-sm">Sessies: {shareData.sessions?.length || 0}</p>
          <p className="text-sm">Health logs: {shareData.healthLog?.length || 0}</p>
        </div>
      ) : null}
    </div>
  );
}

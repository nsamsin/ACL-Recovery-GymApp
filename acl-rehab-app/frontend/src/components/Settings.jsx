export default function Settings({ user, shareToken, onExport }) {
  return (
    <div className="space-y-4">
      <div className="card">
        <h3 className="font-semibold">Instellingen</h3>
        <p className="text-sm mt-2">Naam: {user.name}</p>
        <p className="text-sm">PIN wijzigen en schema-editing kunnen via toekomstige uitbreiding.</p>
      </div>
      <div className="card">
        <p className="font-semibold">Deellink</p>
        <p className="text-sm break-all">{`${window.location.origin}/share/${shareToken}`}</p>
      </div>
      <button className="touch-btn w-full bg-slate-900 text-white" onClick={onExport}>Data exporteren (JSON)</button>
    </div>
  );
}

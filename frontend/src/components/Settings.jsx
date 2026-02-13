import { useState } from "react";

export default function Settings({ user, shareToken, onExport, onUpdateName, onUpdatePin }) {
  const [name, setName] = useState(user.name);
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [msg, setMsg] = useState("");

  const link = `${window.location.origin}/share/${shareToken}`;

  return (
    <div className="space-y-4">
      <div className="card">
        <h3 className="font-semibold">Instellingen</h3>
        <label className="mt-3 block">
          <span className="text-sm font-semibold">Naam wijzigen</span>
          <input className="mt-1 w-full rounded border p-2" value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <button className="touch-btn mt-2 w-full bg-slate-900 text-white" onClick={async () => {
          try {
            await onUpdateName(name);
            setMsg("Naam bijgewerkt");
          } catch (e) {
            setMsg(e.message);
          }
        }}>Naam opslaan</button>
      </div>

      <div className="card">
        <h3 className="font-semibold">PIN wijzigen</h3>
        <input className="mt-2 w-full rounded border p-2" type="password" inputMode="numeric" placeholder="Huidige PIN" value={currentPin} onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, "").slice(0, 4))} />
        <input className="mt-2 w-full rounded border p-2" type="password" inputMode="numeric" placeholder="Nieuwe PIN" value={newPin} onChange={(e) => setNewPin(e.target.value.replace(/\D/g, "").slice(0, 4))} />
        <button className="touch-btn mt-2 w-full bg-slate-900 text-white" onClick={async () => {
          try {
            await onUpdatePin(currentPin, newPin);
            setCurrentPin("");
            setNewPin("");
            setMsg("PIN bijgewerkt");
          } catch (e) {
            setMsg(e.message);
          }
        }} disabled={currentPin.length !== 4 || newPin.length !== 4}>PIN opslaan</button>
      </div>

      <div className="card">
        <p className="font-semibold">Deellink</p>
        <p className="break-all text-sm">{link}</p>
        <button className="touch-btn mt-2 w-full bg-slate-200" onClick={() => navigator.clipboard.writeText(link)}>Kopieer deellink</button>
      </div>

      {msg ? <div className="card text-sm">{msg}</div> : null}

      <button className="touch-btn w-full bg-slate-900 text-white" onClick={onExport}>Data exporteren (JSON)</button>
    </div>
  );
}

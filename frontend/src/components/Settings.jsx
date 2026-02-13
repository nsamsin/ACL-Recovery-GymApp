import { useMemo, useState } from "react";

const categories = ["warmup", "blok_a", "blok_b", "blok_c", "cooldown"];

export default function Settings({
  user,
  shareToken,
  exercises,
  onExport,
  onUpdateName,
  onUpdatePin,
  onCreateExercise,
  onDeleteExercise,
  onReorderExercises
}) {
  const [name, setName] = useState(user.name);
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [msg, setMsg] = useState("");

  const [newEx, setNewEx] = useState({
    id: "",
    name: "",
    category: "blok_c",
    default_sets: 2,
    default_reps: "10",
    default_weight: "Lichaamsgewicht",
    note: "",
    is_timed: false
  });

  const link = `${window.location.origin}/share/${shareToken}`;

  const ordered = useMemo(() => [...exercises].sort((a, b) => a.sort_order - b.sort_order), [exercises]);

  async function onMove(id, dir) {
    const idx = ordered.findIndex((e) => e.id === id);
    const target = idx + dir;
    if (idx < 0 || target < 0 || target >= ordered.length) return;
    const copy = [...ordered];
    [copy[idx], copy[target]] = [copy[target], copy[idx]];
    await onReorderExercises(copy.map((e) => e.id));
    setMsg("Volgorde bijgewerkt");
  }

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

      <div className="card">
        <h3 className="font-semibold">Schema aanpassen</h3>
        <div className="mt-2 space-y-2">
          {ordered.map((e) => (
            <div key={e.id} className="rounded border p-2 text-sm">
              <div className="font-semibold">{e.name}</div>
              <div className="text-slate-500">{e.category} · {e.default_sets}x{e.default_reps}</div>
              <div className="mt-2 grid grid-cols-3 gap-1">
                <button className="touch-btn bg-slate-200 text-xs" onClick={() => onMove(e.id, -1)}>Omhoog</button>
                <button className="touch-btn bg-slate-200 text-xs" onClick={() => onMove(e.id, 1)}>Omlaag</button>
                <button className="touch-btn bg-red-100 text-xs" onClick={async () => {
                  await onDeleteExercise(e.id);
                  setMsg("Oefening verwijderd");
                }}>Verwijder</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h3 className="font-semibold">Oefening toevoegen</h3>
        <input className="mt-2 w-full rounded border p-2" placeholder="ID (bijv. c_side_plank)" value={newEx.id} onChange={(e) => setNewEx({ ...newEx, id: e.target.value.replace(/\s+/g, "_").toLowerCase() })} />
        <input className="mt-2 w-full rounded border p-2" placeholder="Naam" value={newEx.name} onChange={(e) => setNewEx({ ...newEx, name: e.target.value })} />
        <select className="mt-2 w-full rounded border p-2" value={newEx.category} onChange={(e) => setNewEx({ ...newEx, category: e.target.value })}>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <button className="touch-btn mt-2 w-full bg-accent text-white" onClick={async () => {
          try {
            await onCreateExercise(newEx);
            setNewEx({ ...newEx, id: "", name: "" });
            setMsg("Oefening toegevoegd");
          } catch (e) {
            setMsg(e.message);
          }
        }} disabled={!newEx.id || !newEx.name}>Toevoegen</button>
      </div>

      {msg ? <div className="card text-sm">{msg}</div> : null}

      <button className="touch-btn w-full bg-slate-900 text-white" onClick={onExport}>Data exporteren (JSON)</button>
    </div>
  );
}

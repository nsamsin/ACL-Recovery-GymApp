import { useState } from "react";

export default function HealthLog({ onSave }) {
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    swelling: 3,
    pain: 3,
    stiffness: 3,
    rom_extension: true,
    rom_flexion_degrees: 90,
    notes: ""
  });

  return (
    <div className="card space-y-4">
      <label className="block"><span className="text-sm font-semibold">Datum</span><input className="mt-1 w-full rounded border p-2" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></label>
      {[
        ["swelling", "Zwelling"],
        ["pain", "Pijn"],
        ["stiffness", "Stijfheid"]
      ].map(([key, label]) => (
        <label key={key} className="block">
          <span className="text-sm font-semibold">{label}: {form[key]}/10</span>
          <input type="range" min="0" max="10" value={form[key]} onChange={(e) => setForm({ ...form, [key]: Number(e.target.value) })} className="w-full" />
        </label>
      ))}
      <label className="flex items-center gap-2"><input type="checkbox" checked={form.rom_extension} onChange={(e) => setForm({ ...form, rom_extension: e.target.checked })} /> Volle extensie bereikt</label>
      <label className="block"><span className="text-sm font-semibold">Flexie: {form.rom_flexion_degrees}°</span><input type="range" min="0" max="150" value={form.rom_flexion_degrees} onChange={(e) => setForm({ ...form, rom_flexion_degrees: Number(e.target.value) })} className="w-full" /></label>
      <textarea className="w-full rounded border p-2" placeholder="Notities" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
      <button className="touch-btn w-full bg-accent text-white" onClick={() => onSave(form)}>Opslaan</button>
    </div>
  );
}

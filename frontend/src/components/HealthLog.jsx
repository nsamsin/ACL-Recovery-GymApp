import { useState } from "react";
import { useT } from "../lib/i18n";

export default function HealthLog({ onSave }) {
  const t = useT();
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
      <label className="block">
        <span className="text-[13px] font-semibold text-[#8e8e93]">{t("date")}</span>
        <input className="ios-input mt-1" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
      </label>
      {[
        ["swelling", "swelling"],
        ["pain", "pain"],
        ["stiffness", "stiffness"]
      ].map(([key, labelKey]) => (
        <label key={key} className="block">
          <span className="text-[13px] font-semibold text-[#8e8e93]">{t(labelKey)}: {form[key]}/10</span>
          <input type="range" min="0" max="10" value={form[key]} onChange={(e) => setForm({ ...form, [key]: Number(e.target.value) })} className="ios-range mt-2" />
        </label>
      ))}
      <div className="flex items-center justify-between">
        <span className="text-[15px]">{t("fullExtension")}</span>
        <label className="ios-toggle">
          <input type="checkbox" checked={form.rom_extension} onChange={(e) => setForm({ ...form, rom_extension: e.target.checked })} />
          <span className="toggle-track" />
        </label>
      </div>
      <label className="block">
        <span className="text-[13px] font-semibold text-[#8e8e93]">{t("flexion")} {form.rom_flexion_degrees}°</span>
        <input type="range" min="0" max="150" value={form.rom_flexion_degrees} onChange={(e) => setForm({ ...form, rom_flexion_degrees: Number(e.target.value) })} className="ios-range mt-2" />
      </label>
      <textarea className="ios-input" placeholder={t("notes")} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} />
      <button className="btn-primary" onClick={() => onSave(form)}>{t("save")}</button>
    </div>
  );
}

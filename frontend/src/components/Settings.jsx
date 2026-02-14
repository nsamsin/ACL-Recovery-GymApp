import { useMemo, useState } from "react";
import { useT, useLang } from "../lib/i18n";

const categoryKeys = ["warmup", "blok_a", "blok_b", "blok_c", "cooldown"];

export default function Settings({
  user,
  shareToken,
  shareData,
  onLoadShare,
  exercises,
  onExport,
  onUpdateName,
  onUpdatePin,
  onCreateExercise,
  onDeleteExercise,
  onReorderExercises,
  theme,
  onToggleTheme
}) {
  const t = useT();
  const { lang, setLang } = useLang();
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
    default_weight: "Bodyweight",
    note: "",
    is_timed: false
  });

  const ordered = useMemo(() => [...exercises].sort((a, b) => a.sort_order - b.sort_order), [exercises]);
  const shareLink = `${window.location.origin}/share/${shareToken || "..."}`;

  async function onMove(id, dir) {
    const idx = ordered.findIndex((e) => e.id === id);
    const target = idx + dir;
    if (idx < 0 || target < 0 || target >= ordered.length) return;
    const copy = [...ordered];
    [copy[idx], copy[target]] = [copy[target], copy[idx]];
    await onReorderExercises(copy.map((e) => e.id));
    setMsg(t("orderUpdated"));
  }

  return (
    <div className="space-y-6">
      {/* Preferences */}
      <div>
        <h2 className="mb-2 px-1 text-[13px] font-semibold uppercase tracking-wide text-[#8e8e93]">{t("preferences")}</h2>
        <div className="card space-y-0 divide-y divide-[#8e8e93]/10">
          <div className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
            <span className="text-[15px]">{t("darkMode")}</span>
            <label className="ios-toggle">
              <input type="checkbox" checked={theme === "dark"} onChange={onToggleTheme} />
              <span className="toggle-track" />
            </label>
          </div>
          <div className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
            <span className="text-[15px]">{t("language")}</span>
            <select
              className="ios-select max-w-[140px]"
              value={lang}
              onChange={(e) => setLang(e.target.value)}
            >
              <option value="en">English</option>
              <option value="nl">Nederlands</option>
            </select>
          </div>
        </div>
      </div>

      {/* Account */}
      <div>
        <h2 className="mb-2 px-1 text-[13px] font-semibold uppercase tracking-wide text-[#8e8e93]">{t("account")}</h2>
        <div className="space-y-3">
          <div className="card">
            <label className="block">
              <span className="text-[13px] font-semibold text-[#8e8e93]">{t("changeName")}</span>
              <input className="ios-input mt-1" value={name} onChange={(e) => setName(e.target.value)} />
            </label>
            <button className="btn-primary mt-3" onClick={async () => {
              try {
                await onUpdateName(name);
                setMsg(t("nameUpdated"));
              } catch (e) {
                setMsg(e.message);
              }
            }}>{t("saveName")}</button>
          </div>

          <div className="card">
            <span className="text-[13px] font-semibold text-[#8e8e93]">{t("changePin")}</span>
            <input className="ios-input mt-2" type="password" inputMode="numeric" placeholder={t("currentPin")} value={currentPin} onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, "").slice(0, 4))} />
            <input className="ios-input mt-2" type="password" inputMode="numeric" placeholder={t("newPin")} value={newPin} onChange={(e) => setNewPin(e.target.value.replace(/\D/g, "").slice(0, 4))} />
            <button className="btn-primary mt-3" onClick={async () => {
              try {
                await onUpdatePin(currentPin, newPin);
                setCurrentPin("");
                setNewPin("");
                setMsg(t("pinUpdated"));
              } catch (e) {
                setMsg(e.message);
              }
            }} disabled={currentPin.length !== 4 || newPin.length !== 4}>{t("savePin")}</button>
          </div>
        </div>
      </div>

      {/* Sharing */}
      <div>
        <h2 className="mb-2 px-1 text-[13px] font-semibold uppercase tracking-wide text-[#8e8e93]">{t("sharing")}</h2>
        <div className="card">
          <p className="font-semibold">{t("shareDesc")}</p>
          <p className="mt-1 break-all text-[13px] text-[#8e8e93]">{shareLink}</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button className="btn-primary" onClick={onLoadShare}>{t("loadOverview")}</button>
            <button className="btn-secondary" onClick={() => navigator.clipboard.writeText(shareLink)}>{t("copyLink")}</button>
          </div>
        </div>
        {shareData ? (
          <div className="mt-3 space-y-3">
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

      {/* Workout Schedule */}
      <div>
        <h2 className="mb-2 px-1 text-[13px] font-semibold uppercase tracking-wide text-[#8e8e93]">{t("schedule")}</h2>
        <div className="card">
          <div className="space-y-2">
            {ordered.map((e) => (
              <div key={e.id} className="rounded-ios bg-surface-secondary p-3">
                <div className="font-semibold text-[15px]">{e.name}</div>
                <div className="text-[13px] text-[#8e8e93]">{e.category} · {e.default_sets}x{e.default_reps}</div>
                <div className="mt-2 grid grid-cols-3 gap-1">
                  <button className="btn-secondary text-[13px]" onClick={() => onMove(e.id, -1)}>{t("up")}</button>
                  <button className="btn-secondary text-[13px]" onClick={() => onMove(e.id, 1)}>{t("down")}</button>
                  <button className="touch-btn bg-ios-red/10 text-ios-red text-[13px]" onClick={async () => {
                    await onDeleteExercise(e.id);
                    setMsg(t("exDeleted"));
                  }}>{t("deleteLabel")}</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card mt-3">
          <h3 className="font-semibold">{t("addExercise")}</h3>
          <input className="ios-input mt-2" placeholder={t("idPlaceholder")} value={newEx.id} onChange={(e) => setNewEx({ ...newEx, id: e.target.value.replace(/\s+/g, "_").toLowerCase() })} />
          <input className="ios-input mt-2" placeholder={t("name")} value={newEx.name} onChange={(e) => setNewEx({ ...newEx, name: e.target.value })} />
          <select className="ios-select mt-2" value={newEx.category} onChange={(e) => setNewEx({ ...newEx, category: e.target.value })}>
            {categoryKeys.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <button className="btn-primary mt-3" onClick={async () => {
            try {
              await onCreateExercise(newEx);
              setNewEx({ ...newEx, id: "", name: "" });
              setMsg(t("exAdded"));
            } catch (e) {
              setMsg(e.message);
            }
          }} disabled={!newEx.id || !newEx.name}>{t("add")}</button>
        </div>
      </div>

      {/* Data */}
      <div>
        <h2 className="mb-2 px-1 text-[13px] font-semibold uppercase tracking-wide text-[#8e8e93]">{t("dataSection")}</h2>
        <button className="btn-primary w-full" onClick={onExport}>{t("exportJson")}</button>
      </div>

      {msg ? <div className="rounded-ios bg-ios-green/10 px-4 py-3 text-sm text-ios-green">{msg}</div> : null}
    </div>
  );
}

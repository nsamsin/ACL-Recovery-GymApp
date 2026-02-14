import { useT } from "../lib/i18n";
import Timer from "./Timer";

export default function ExerciseCard({ exercise, state, onChange, onToggle }) {
  const t = useT();
  const showWarning = exercise.id.includes("leg_press") || /meniscus/i.test(exercise.note || "");

  return (
    <div className="card border-l-[3px] border-l-[#007aff]">
      <div className="flex items-start gap-3">
        <img src={exercise.image_url} alt={exercise.name} className="h-16 w-16 rounded-ios shadow-ios-sm object-cover bg-surface-secondary" />
        <div className="flex-1">
          <h4 className="font-semibold">{exercise.name}</h4>
          <p className="text-[13px] text-[#8e8e93]">{exercise.default_sets} {t("sets")} · {exercise.default_reps}</p>
          {showWarning && <p className="mt-1 text-xs font-semibold text-ios-red">{t("meniscusWarn")}</p>}
          <p className="text-xs text-[#8e8e93]">{exercise.note}</p>
        </div>
        <label className="ios-toggle">
          <input type="checkbox" checked={state.completed} onChange={onToggle} />
          <span className="toggle-track" />
        </label>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <input className="ios-input" value={state.reps_completed} onChange={(e) => onChange("reps_completed", e.target.value)} placeholder={t("reps")} />
        <input className="ios-input" value={state.weight_used} onChange={(e) => onChange("weight_used", e.target.value)} placeholder={t("weight")} />
      </div>
      {exercise.is_timed ? <div className="mt-3"><Timer defaultText={exercise.default_reps} /></div> : null}
    </div>
  );
}

import Timer from "./Timer";

export default function ExerciseCard({ exercise, state, onChange, onToggle }) {
  const showWarning = exercise.id.includes("leg_press") || /meniscus/i.test(exercise.note || "");

  return (
    <div className="card border-l-4 border-l-accent">
      <div className="flex items-start gap-3">
        <img src={exercise.image_url} alt={exercise.name} className="h-16 w-16 rounded-lg object-cover bg-slate-100" />
        <div className="flex-1">
          <h4 className="font-semibold">{exercise.name}</h4>
          <p className="text-sm text-slate-600">{exercise.default_sets} sets · {exercise.default_reps}</p>
          {showWarning && <p className="mt-1 text-xs font-semibold text-red-700">⚠️ Max 70-80° knieflexie i.v.m. meniscus.</p>}
          <p className="text-xs text-slate-500">{exercise.note}</p>
        </div>
        <input type="checkbox" checked={state.completed} onChange={onToggle} className="h-6 w-6" />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <input className="rounded-lg border p-2" value={state.reps_completed} onChange={(e) => onChange("reps_completed", e.target.value)} placeholder="Reps" />
        <input className="rounded-lg border p-2" value={state.weight_used} onChange={(e) => onChange("weight_used", e.target.value)} placeholder="Gewicht" />
      </div>
      {exercise.is_timed ? <div className="mt-3"><Timer defaultText={exercise.default_reps} /></div> : null}
    </div>
  );
}

import { categories } from "../lib/constants";
import ExerciseCard from "./ExerciseCard";

const EMPTY_STATE = {
  completed: false,
  sets_completed: 0,
  reps_completed: "",
  weight_used: "",
  notes: ""
};

export default function SessionView({ exercises, sessionState, onChangeExercise, onFinish }) {
  const completed = Object.values(sessionState).filter((v) => v.completed).length;

  return (
    <div className="space-y-4">
      <div className="card">
        <p className="font-semibold">Voortgang: {completed}/{exercises.length} oefeningen voltooid</p>
        <div className="progress-bar mt-2">
          <div className="progress-bar-fill" style={{ width: `${(completed / Math.max(exercises.length, 1)) * 100}%` }} />
        </div>
      </div>
      {categories.map((c) => (
        <section key={c.key} className={`rounded-ios-lg border-l-4 p-3 shadow-ios-sm ${c.color}`}>
          <h3 className="mb-3 font-bold">{c.label}</h3>
          <div className="space-y-3">
            {exercises.filter((e) => e.category === c.key).map((exercise) => {
              const state = sessionState[exercise.id] || EMPTY_STATE;
              return (
                <ExerciseCard
                  key={exercise.id}
                  exercise={exercise}
                  state={state}
                  onChange={(field, value) => onChangeExercise(exercise.id, field, value)}
                  onToggle={() => onChangeExercise(exercise.id, "completed", !state.completed)}
                />
              );
            })}
          </div>
        </section>
      ))}
      <button className="btn-primary" onClick={onFinish}>Sessie afronden</button>
    </div>
  );
}

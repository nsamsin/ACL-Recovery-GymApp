import { useEffect, useMemo, useRef, useState } from "react";

function parseSeconds(value) {
  const m = String(value || "").match(/(\d+)/);
  if (!m) return 30;
  const num = Number(m[1]);
  return /min/.test(value) ? num * 60 : num;
}

export default function Timer({ defaultText }) {
  const initial = useMemo(() => parseSeconds(defaultText), [defaultText]);
  const [secondsLeft, setSecondsLeft] = useState(initial);
  const [running, setRunning] = useState(false);
  const targetRef = useRef(null);

  useEffect(() => {
    setSecondsLeft(initial);
    setRunning(false);
  }, [initial]);

  useEffect(() => {
    if (!running) return;

    targetRef.current = Date.now() + secondsLeft * 1000;
    const tick = () => {
      const next = Math.max(0, Math.round((targetRef.current - Date.now()) / 1000));
      setSecondsLeft(next);
      if (next <= 0) {
        setRunning(false);
        if (navigator.vibrate) navigator.vibrate([300, 200, 300]);
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const o = audioCtx.createOscillator();
        o.connect(audioCtx.destination);
        o.frequency.value = 880;
        o.start();
        setTimeout(() => o.stop(), 250);
      }
    };

    const id = setInterval(tick, 250);
    const onVis = () => tick();
    document.addEventListener("visibilitychange", onVis);

    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [running]);

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");

  return (
    <div className="card bg-surface-secondary">
      <p className="text-center text-5xl font-bold tabular-nums">{mm}:{ss}</p>
      <div className="mt-3 grid grid-cols-3 gap-2">
        <button
          className="btn-primary"
          onClick={() => {
            if (!running) targetRef.current = Date.now() + secondsLeft * 1000;
            setRunning((v) => !v);
          }}
        >
          {running ? "Pauze" : "Start"}
        </button>
        <button
          className="btn-secondary"
          onClick={() => {
            setSecondsLeft(initial);
            setRunning(false);
          }}
        >
          Reset
        </button>
        <button className="btn-secondary" onClick={() => {
          if (targetRef.current) targetRef.current -= 15000;
          setSecondsLeft((s) => Math.max(0, s - 15));
        }}>-15s</button>
      </div>
      <button className="btn-secondary mt-2" onClick={() => {
        if (targetRef.current) targetRef.current += 15000;
        setSecondsLeft((s) => s + 15);
      }}>+15s</button>
    </div>
  );
}

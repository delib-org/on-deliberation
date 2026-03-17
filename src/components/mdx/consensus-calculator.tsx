"use client";

import { useState } from "react";

export function ConsensusCalculator() {
  const [evaluation, setEvaluation] = useState(0.82);
  const [participants, setParticipants] = useState(24);
  const score = evaluation * Math.sqrt(participants);

  return (
    <div className="my-8 rounded-[1.75rem] border border-line bg-white/60 p-6 shadow-panel">
      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-ink/50">Consensus Calculator</p>
          <h3 className="mt-3 text-2xl tracking-tight text-ink">Explore the scoring heuristic</h3>
          <p className="mt-3 text-sm leading-7 text-ink/68">
            This component is intentionally simple. It demonstrates how the book can embed
            executable arguments directly inside the manuscript.
          </p>
        </div>
        <div className="grid gap-5">
          <label className="grid gap-2 text-sm text-ink/72">
            Average evaluation strength: <span className="font-semibold">{evaluation.toFixed(2)}</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={evaluation}
              onChange={(event) => setEvaluation(Number(event.target.value))}
            />
          </label>
          <label className="grid gap-2 text-sm text-ink/72">
            Number of participants: <span className="font-semibold">{participants}</span>
            <input
              type="range"
              min="1"
              max="300"
              step="1"
              value={participants}
              onChange={(event) => setParticipants(Number(event.target.value))}
            />
          </label>
          <div className="rounded-2xl bg-ink px-5 py-4 text-white">
            <p className="text-xs uppercase tracking-[0.25em] text-white/65">Consensus score</p>
            <p className="mt-2 text-4xl tracking-tight">{score.toFixed(2)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}


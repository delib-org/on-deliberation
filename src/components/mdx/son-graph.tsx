export function SonGraph() {
  return (
    <div className="my-8 rounded-[1.75rem] border border-line bg-white/60 p-6 shadow-panel">
      <p className="text-xs uppercase tracking-[0.28em] text-ink/50">SON Visualizer</p>
      <h3 className="mt-3 text-2xl tracking-tight text-ink">Shared Ontology Network</h3>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-ink/68">
        Replace this starter diagram with a richer graph explorer later. The important architectural
        point is that MDX lets explanatory prose and deliberative tooling live in the same artifact.
      </p>
      <svg viewBox="0 0 640 240" className="mt-6 w-full overflow-visible">
        <defs>
          <linearGradient id="nodeGradient" x1="0%" x2="100%" y1="0%" y2="100%">
            <stop offset="0%" stopColor="#f1d0bf" />
            <stop offset="100%" stopColor="#e8b79f" />
          </linearGradient>
        </defs>
        <path d="M120 120C200 40 280 40 360 120" fill="none" stroke="#9c4a36" strokeWidth="3" />
        <path d="M120 120C210 200 320 210 500 100" fill="none" stroke="#52654a" strokeWidth="3" />
        <path d="M360 120C430 120 470 120 520 120" fill="none" stroke="#1e2428" strokeWidth="3" />

        <g>
          <circle cx="120" cy="120" r="36" fill="url(#nodeGradient)" />
          <text x="120" y="126" textAnchor="middle" fontSize="14" fill="#1e2428">
            Need
          </text>
        </g>
        <g>
          <circle cx="360" cy="120" r="40" fill="#f7efe6" stroke="#9c4a36" strokeWidth="2" />
          <text x="360" y="126" textAnchor="middle" fontSize="14" fill="#1e2428">
            SON
          </text>
        </g>
        <g>
          <circle cx="520" cy="120" r="36" fill="#f7efe6" stroke="#1e2428" strokeWidth="2" />
          <text x="520" y="126" textAnchor="middle" fontSize="14" fill="#1e2428">
            Action
          </text>
        </g>
        <g>
          <circle cx="500" cy="100" r="30" fill="#ebf1e8" stroke="#52654a" strokeWidth="2" />
          <text x="500" y="106" textAnchor="middle" fontSize="13" fill="#1e2428">
            ROI
          </text>
        </g>
      </svg>
    </div>
  );
}


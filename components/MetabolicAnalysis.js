'use client'

const MULTIPLIERS = {
  0: 1.2,    // Sedentário
  1: 1.375,  // Leve
  2: 1.55,   // Moderado
  3: 1.725,  // Intenso
  4: 1.9,    // Atleta
}

export default function MetabolicAnalysis({ peso, altura, idade, sexo, imc, atividadeIndex, t }) {
  if (!idade || !sexo || atividadeIndex === null || atividadeIndex === undefined) {
    return (
      <div className="glass-card rounded-2xl p-4 text-center animate-fade-in">
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{t.needsData}</p>
      </div>
    )
  }

  const alturaCm = altura * 100
  const isMale = sexo === 'Masculino' || sexo === 'Male'
  const tmb = isMale
    ? (10 * peso) + (6.25 * alturaCm) - (5 * idade) + 5
    : (10 * peso) + (6.25 * alturaCm) - (5 * idade) - 161

  const mult = MULTIPLIERS[atividadeIndex] || 1.2
  const tdee = tmb * mult

  // Macros based on BMI
  let carbPct, protPct, fatPct, objetivo
  if (imc < 18.5) {
    carbPct = 50; protPct = 25; fatPct = 25
    objetivo = t.objetivo.ganho
  } else if (imc <= 24.9) {
    carbPct = 45; protPct = 30; fatPct = 25
    objetivo = t.objetivo.manutencao
  } else {
    carbPct = 35; protPct = 35; fatPct = 30
    objetivo = t.objetivo.perda
  }

  const carbG = Math.round((tdee * carbPct / 100) / 4)
  const protG = Math.round((tdee * protPct / 100) / 4)
  const fatG = Math.round((tdee * fatPct / 100) / 9)

  const macros = [
    { name: t.carbs, pct: carbPct, grams: carbG, color: '#F59E0B' },
    { name: t.protein, pct: protPct, grams: protG, color: '#3B82F6' },
    { name: t.fat, pct: fatPct, grams: fatG, color: '#EF4444' },
  ]

  // SVG circular progress
  function CircularMacro({ name, pct, grams, color }) {
    const r = 28
    const circ = 2 * Math.PI * r
    const offset = circ - (pct / 100) * circ
    return (
      <div className="flex flex-col items-center gap-1">
        <svg width="68" height="68" viewBox="0 0 72 72">
          <circle cx="36" cy="36" r={r} fill="none" stroke="var(--border-color)" strokeWidth="5" />
          <circle cx="36" cy="36" r={r} fill="none" stroke={color} strokeWidth="5" strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" transform="rotate(-90 36 36)" style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
          <text x="36" y="33" textAnchor="middle" fill={color} fontSize="14" fontWeight="700" fontFamily="Space Grotesk, sans-serif">{pct}%</text>
          <text x="36" y="45" textAnchor="middle" fill="var(--text-muted)" fontSize="8" fontFamily="JetBrains Mono, monospace">{grams}g</text>
        </svg>
        <span className="text-[10px] font-mono font-medium" style={{ color: 'var(--text-secondary)' }}>{name}</span>
      </div>
    )
  }

  return (
    <div className="space-y-3 animate-fade-in-up">
      <h3 className="text-sm font-display font-bold" style={{ color: 'var(--text-primary)' }}>{t.title}</h3>

      {/* TMB + TDEE cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass-card rounded-2xl p-4">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-base">🔥</span>
            <span className="text-[10px] font-mono uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{t.tmb}</span>
          </div>
          <p className="text-xl font-display font-bold" style={{ color: 'var(--accent)' }}>{Math.round(tmb)}</p>
          <p className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>{t.kcalDay}</p>
          <p className="text-[9px] font-mono mt-1" style={{ color: 'var(--text-muted)' }}>{t.tmbDesc}</p>
        </div>
        <div className="glass-card rounded-2xl p-4">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-base">⚡</span>
            <span className="text-[10px] font-mono uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{t.tdee}</span>
          </div>
          <p className="text-xl font-display font-bold" style={{ color: 'var(--accent)' }}>{Math.round(tdee)}</p>
          <p className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>{t.kcalDay}</p>
          <p className="text-[9px] font-mono mt-1" style={{ color: 'var(--text-muted)' }}>{t.tdeeDesc}</p>
        </div>
      </div>

      {/* Macros */}
      <div className="glass-card rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-mono uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{t.macros}</span>
          <span className="text-[9px] font-mono px-2 py-0.5 rounded" style={{ color: 'var(--accent)', background: 'var(--accent-glow)' }}>{objetivo}</span>
        </div>
        <div className="flex justify-around">
          {macros.map((m, i) => (
            <CircularMacro key={i} {...m} />
          ))}
        </div>
        <p className="text-[9px] font-mono text-center mt-3" style={{ color: 'var(--text-muted)' }}>{t.formula}</p>
      </div>
    </div>
  )
}

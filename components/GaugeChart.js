'use client'

const TICKS = [10, 18.5, 25, 30, 35, 40, 45]

const ARC_SEGMENTS = [
  { from: 10, to: 16, color: '#E63946' },
  { from: 16, to: 18.5, color: '#F4845F' },
  { from: 18.5, to: 25, color: '#2EC4B6' },
  { from: 25, to: 30, color: '#F9A825' },
  { from: 30, to: 35, color: '#F4845F' },
  { from: 35, to: 40, color: '#E63946' },
  { from: 40, to: 45, color: '#9B1D20' },
]

export function getCategoria(imc, faixasData) {
  const FAIXAS_BASE = [
    { min: 0, max: 16, color: '#E63946' },
    { min: 16, max: 17, color: '#F4845F' },
    { min: 17, max: 18.5, color: '#F9A825' },
    { min: 18.5, max: 25, color: '#2EC4B6' },
    { min: 25, max: 30, color: '#F9A825' },
    { min: 30, max: 35, color: '#F4845F' },
    { min: 35, max: 40, color: '#E63946' },
    { min: 40, max: 100, color: '#9B1D20' },
  ]
  const idx = FAIXAS_BASE.findIndex(f => imc >= f.min && imc < f.max)
  const i = idx >= 0 ? idx : FAIXAS_BASE.length - 1
  const base = FAIXAS_BASE[i]
  const t = faixasData?.[i] || {}
  return { ...base, label: t.label || '', emoji: t.emoji || '', index: i }
}

export const FAIXAS_BASE = [
  { min: 0, max: 16, color: '#E63946' },
  { min: 16, max: 17, color: '#F4845F' },
  { min: 17, max: 18.5, color: '#F9A825' },
  { min: 18.5, max: 25, color: '#2EC4B6' },
  { min: 25, max: 30, color: '#F9A825' },
  { min: 30, max: 35, color: '#F4845F' },
  { min: 35, max: 40, color: '#E63946' },
  { min: 40, max: 100, color: '#9B1D20' },
]

export default function GaugeChart({ imc, catLabel }) {
  const width = 320
  const height = 200
  const cx = width / 2
  const cy = 170
  const radius = 130
  const startAngle = Math.PI
  const minIMC = 10
  const maxIMC = 45

  function imcToAngle(val) {
    const clamped = Math.max(minIMC, Math.min(maxIMC, val))
    const ratio = (clamped - minIMC) / (maxIMC - minIMC)
    return startAngle - ratio * Math.PI
  }

  function polarToXY(angle, r) {
    return { x: cx + r * Math.cos(angle), y: cy - r * Math.sin(angle) }
  }

  function describeArc(fromIMC, toIMC) {
    const a1 = imcToAngle(fromIMC)
    const a2 = imcToAngle(toIMC)
    const p1 = polarToXY(a1, radius)
    const p2 = polarToXY(a2, radius)
    const large = Math.abs(a1 - a2) > Math.PI ? 1 : 0
    return `M ${p1.x} ${p1.y} A ${radius} ${radius} 0 ${large} 1 ${p2.x} ${p2.y}`
  }

  const needleAngle = imc !== null ? imcToAngle(imc) : imcToAngle(22)
  const needleTip = polarToXY(needleAngle, radius - 20)
  const catColor = imc !== null
    ? (FAIXAS_BASE.find(f => imc >= f.min && imc < f.max) || FAIXAS_BASE[FAIXAS_BASE.length - 1]).color
    : null

  return (
    <div className="flex flex-col items-center">
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" style={{ maxWidth: 320 }}>
        {ARC_SEGMENTS.map((seg, i) => (
          <path key={i} d={describeArc(seg.from, seg.to)} stroke={seg.color} strokeWidth="18" fill="none" strokeLinecap="butt" opacity={0.85} />
        ))}
        {TICKS.map((tick) => {
          const angle = imcToAngle(tick)
          const outer = polarToXY(angle, radius + 8)
          const inner = polarToXY(angle, radius - 12)
          const labelPos = polarToXY(angle, radius + 22)
          return (
            <g key={tick}>
              <line x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y} stroke="var(--gauge-subtext)" strokeWidth="1.5" opacity="0.6" />
              <text x={labelPos.x} y={labelPos.y} textAnchor="middle" dominantBaseline="middle" fill="var(--gauge-subtext)" fontSize="10" fontFamily="JetBrains Mono, monospace">{tick}</text>
            </g>
          )
        })}
        {imc !== null && (
          <g>
            <line x1={cx} y1={cy} x2={needleTip.x} y2={needleTip.y} stroke={catColor || 'var(--accent)'} strokeWidth="3" strokeLinecap="round" style={{ transition: 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)' }} />
            <circle cx={cx} cy={cy} r="6" fill={catColor || 'var(--accent)'} />
            <circle cx={cx} cy={cy} r="3" fill="var(--gauge-bg)" />
          </g>
        )}
        <text x={cx} y={cy - 30} textAnchor="middle" fill="var(--gauge-text)" fontSize="36" fontWeight="700" fontFamily="Space Grotesk, sans-serif">{imc !== null ? imc.toFixed(1) : '—'}</text>
        <text x={cx} y={cy - 12} textAnchor="middle" fill="var(--gauge-subtext)" fontSize="12" fontFamily="JetBrains Mono, monospace">kg/m²</text>
      </svg>
      {catLabel && catColor && (
        <div className="mt-1 px-4 py-1.5 rounded-full text-sm font-semibold font-display animate-fade-in" style={{ background: catColor + '20', color: catColor }}>
          {catLabel}
        </div>
      )}
    </div>
  )
}

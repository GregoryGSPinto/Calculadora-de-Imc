'use client'

import { useState } from 'react'
import { FAIXAS_BASE, getCategoria } from './GaugeChart'

export default function HistoryTab({ historico, onDelete, onClear, t, faixasT }) {
  const [selected, setSelected] = useState(null)

  if (!historico.length) {
    return (
      <div className="glass-card rounded-2xl p-8 text-center animate-fade-in">
        <p className="text-4xl mb-3">📈</p>
        <p className="text-sm font-display" style={{ color: 'var(--text-secondary)' }}>{t.empty}</p>
      </div>
    )
  }

  const imcs = historico.map(r => r.imc)
  const avg = imcs.reduce((a, b) => a + b, 0) / imcs.length
  const min = Math.min(...imcs)
  const max = Math.max(...imcs)
  let trend = t.estavel
  if (historico.length >= 2) {
    const last = historico[historico.length - 1].imc
    const prev = historico[historico.length - 2].imc
    if (last > prev + 0.3) trend = t.subindo
    else if (last < prev - 0.3) trend = t.descendo
  }

  // Chart dimensions
  const cw = 360
  const ch = 180
  const padL = 40
  const padR = 16
  const padT = 16
  const padB = 30
  const plotW = cw - padL - padR
  const plotH = ch - padT - padB
  const yMin = 10
  const yMax = 45

  function toX(i) {
    if (historico.length === 1) return padL + plotW / 2
    return padL + (i / (historico.length - 1)) * plotW
  }
  function toY(v) {
    return padT + plotH - ((v - yMin) / (yMax - yMin)) * plotH
  }

  // Band colors for WHO ranges
  const bands = [
    { from: 10, to: 16, color: '#E63946' },
    { from: 16, to: 18.5, color: '#F4845F' },
    { from: 18.5, to: 25, color: '#2EC4B6' },
    { from: 25, to: 30, color: '#F9A825' },
    { from: 30, to: 35, color: '#F4845F' },
    { from: 35, to: 40, color: '#E63946' },
    { from: 40, to: 45, color: '#9B1D20' },
  ]

  // Build smooth path
  const points = historico.map((r, i) => ({ x: toX(i), y: toY(r.imc) }))
  let linePath = ''
  if (points.length === 1) {
    linePath = `M ${points[0].x} ${points[0].y}`
  } else {
    linePath = `M ${points[0].x} ${points[0].y}`
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1]
      const curr = points[i]
      const cpx = (prev.x + curr.x) / 2
      linePath += ` C ${cpx} ${prev.y}, ${cpx} ${curr.y}, ${curr.x} ${curr.y}`
    }
  }

  // Y-axis ticks
  const yTicks = [15, 18.5, 25, 30, 35, 40]

  function formatDate(ts) {
    const d = new Date(ts)
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`
  }

  return (
    <div className="space-y-3 animate-fade-in">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: t.imcMedio, value: avg.toFixed(1) },
          { label: t.imcMin, value: min.toFixed(1) },
          { label: t.imcMax, value: max.toFixed(1) },
          { label: t.tendencia, value: trend },
        ].map((s, i) => (
          <div key={i} className="glass-card rounded-2xl p-3 animate-fade-in-up" style={{ animationDelay: `${i * 0.05}s` }}>
            <p className="text-[10px] font-mono uppercase tracking-wider mb-0.5" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
            <p className="text-base font-display font-bold" style={{ color: 'var(--accent)' }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="glass-card rounded-2xl p-3 overflow-hidden">
        <svg viewBox={`0 0 ${cw} ${ch}`} width="100%" preserveAspectRatio="xMidYMid meet">
          {/* Background bands */}
          {bands.map((b, i) => {
            const y1 = toY(Math.min(b.to, yMax))
            const y2 = toY(Math.max(b.from, yMin))
            return <rect key={i} x={padL} y={y1} width={plotW} height={y2 - y1} fill={b.color} opacity="0.07" />
          })}
          {/* Y grid */}
          {yTicks.map(v => (
            <g key={v}>
              <line x1={padL} y1={toY(v)} x2={cw - padR} y2={toY(v)} stroke="var(--border-color)" strokeWidth="0.5" />
              <text x={padL - 6} y={toY(v) + 3} textAnchor="end" fill="var(--text-muted)" fontSize="9" fontFamily="JetBrains Mono, monospace">{v}</text>
            </g>
          ))}
          {/* X labels */}
          {historico.map((r, i) => {
            if (historico.length > 10 && i % Math.ceil(historico.length / 8) !== 0 && i !== historico.length - 1) return null
            return <text key={i} x={toX(i)} y={ch - 4} textAnchor="middle" fill="var(--text-muted)" fontSize="8" fontFamily="JetBrains Mono, monospace">{formatDate(r.createdAt)}</text>
          })}
          {/* Line */}
          {points.length > 1 && <path d={linePath} fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" />}
          {/* Points */}
          {points.map((p, i) => {
            const cat = getCategoria(historico[i].imc, faixasT)
            return (
              <circle
                key={i}
                cx={p.x}
                cy={p.y}
                r={selected === i ? 6 : 4}
                fill={cat.color}
                stroke="var(--bg)"
                strokeWidth="2"
                style={{ cursor: 'pointer', transition: 'r 0.2s' }}
                onClick={() => setSelected(selected === i ? null : i)}
              />
            )
          })}
          {/* Tooltip */}
          {selected !== null && historico[selected] && (() => {
            const r = historico[selected]
            const px = points[selected].x
            const py = points[selected].y
            const tw = 90
            const th = 38
            const tx = Math.min(Math.max(px - tw / 2, padL), cw - padR - tw)
            const ty = py - th - 10
            return (
              <g>
                <rect x={tx} y={ty} width={tw} height={th} rx="6" fill="var(--bg)" stroke="var(--border-color)" strokeWidth="1" opacity="0.95" />
                <text x={tx + tw / 2} y={ty + 14} textAnchor="middle" fill="var(--text-primary)" fontSize="10" fontWeight="600" fontFamily="Space Grotesk, sans-serif">IMC: {r.imc.toFixed(1)}</text>
                <text x={tx + tw / 2} y={ty + 28} textAnchor="middle" fill="var(--text-muted)" fontSize="8" fontFamily="JetBrains Mono, monospace">{r.peso}kg · {r.altura}m</text>
              </g>
            )
          })()}
        </svg>
      </div>

      {/* Records list */}
      <div className="glass-card rounded-2xl p-3 space-y-2">
        <p className="text-xs font-mono uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>{t.total}: {historico.length}</p>
        {historico.slice().reverse().map((r) => {
          const cat = getCategoria(r.imc, faixasT)
          return (
            <div key={r.id} className="flex items-center justify-between px-3 py-2 rounded-xl" style={{ background: 'var(--surface)', border: '1px solid var(--border-color)' }}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>{formatDate(r.createdAt)}</span>
                  <span className="text-sm font-display font-bold" style={{ color: cat.color }}>{r.imc.toFixed(1)}</span>
                  <span className="text-xs" style={{ color: cat.color }}>{cat.emoji} {cat.label}</span>
                </div>
                <p className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>{t.peso}: {r.peso}kg · {t.altura}: {r.altura}m</p>
              </div>
              <button onClick={() => onDelete(r.id)} className="ml-2 w-6 h-6 flex items-center justify-center rounded-md text-xs hover:scale-110 transition-transform" style={{ color: 'var(--text-muted)', background: 'var(--surface-hover)' }}>✕</button>
            </div>
          )
        })}
        <button onClick={onClear} className="w-full py-2 rounded-xl text-xs font-mono font-semibold transition-all hover:scale-[1.02]" style={{ color: '#E63946', border: '1px solid #E6394630', background: '#E6394610' }}>
          {t.limpar}
        </button>
      </div>
    </div>
  )
}

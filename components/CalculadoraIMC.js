'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

/* ───────────── CONSTANTS ───────────── */

const FAIXAS = [
  { min: 0, max: 16, label: 'Magreza Grave', emoji: '🔴', color: '#E63946' },
  { min: 16, max: 17, label: 'Magreza Moderada', emoji: '🟠', color: '#F4845F' },
  { min: 17, max: 18.5, label: 'Magreza Leve', emoji: '🟡', color: '#F9A825' },
  { min: 18.5, max: 25, label: 'Saudável', emoji: '🟢', color: '#2EC4B6' },
  { min: 25, max: 30, label: 'Sobrepeso', emoji: '🟡', color: '#F9A825' },
  { min: 30, max: 35, label: 'Obesidade I', emoji: '🟠', color: '#F4845F' },
  { min: 35, max: 40, label: 'Obesidade II', emoji: '🔴', color: '#E63946' },
  { min: 40, max: 100, label: 'Obesidade III', emoji: '⚫', color: '#9B1D20' },
]

const ATIVIDADES = ['Sedentário', 'Leve', 'Moderado', 'Intenso', 'Atleta']

const TICKS = [10, 18.5, 25, 30, 35, 40, 45]

function getCategoria(imc) {
  return FAIXAS.find(f => imc >= f.min && imc < f.max) || FAIXAS[FAIXAS.length - 1]
}

/* ───────────── THEME TOGGLE ───────────── */

function ThemeToggle({ light, isAuto, onToggle }) {
  return (
    <div className="flex items-center gap-1.5">
      {isAuto && (
        <span
          className="text-[9px] font-mono font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded"
          style={{ color: 'var(--text-muted)', background: 'var(--surface)' }}
        >
          auto
        </span>
      )}
      <button
        onClick={onToggle}
        className="relative w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-300 hover:scale-110"
        style={{ background: 'var(--surface)', border: '1px solid var(--border-color)' }}
        aria-label="Alternar tema"
      >
        <span className="transition-transform duration-300" style={{ display: 'inline-block', transform: light ? 'rotate(0deg)' : 'rotate(180deg)' }}>
          {light ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5"/>
              <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
              <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          )}
        </span>
      </button>
    </div>
  )
}

/* ───────────── ANIMATED NUMBER ───────────── */

function AnimatedNumber({ value, decimals = 1, duration = 800 }) {
  const [display, setDisplay] = useState(0)
  const frameRef = useRef()

  useEffect(() => {
    if (value === null || value === undefined) return
    const start = display
    const end = Number(value)
    const startTime = performance.now()

    function tick(now) {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(start + (end - start) * eased)
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick)
      }
    }

    frameRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frameRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  return <span>{display.toFixed(decimals)}</span>
}

/* ───────────── GAUGE CHART ───────────── */

function GaugeChart({ imc, light }) {
  const width = 320
  const height = 200
  const cx = width / 2
  const cy = 170
  const radius = 130
  const startAngle = Math.PI
  const endAngle = 0
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

  const arcSegments = [
    { from: 10, to: 16, color: '#E63946' },
    { from: 16, to: 18.5, color: '#F4845F' },
    { from: 18.5, to: 25, color: '#2EC4B6' },
    { from: 25, to: 30, color: '#F9A825' },
    { from: 30, to: 35, color: '#F4845F' },
    { from: 35, to: 40, color: '#E63946' },
    { from: 40, to: 45, color: '#9B1D20' },
  ]

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
  const cat = imc !== null ? getCategoria(imc) : null

  return (
    <div className="flex flex-col items-center">
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" style={{ maxWidth: 320 }}>
        {arcSegments.map((seg, i) => (
          <path
            key={i}
            d={describeArc(seg.from, seg.to)}
            stroke={seg.color}
            strokeWidth="18"
            fill="none"
            strokeLinecap="butt"
            opacity={0.85}
          />
        ))}

        {TICKS.map((tick) => {
          const angle = imcToAngle(tick)
          const outer = polarToXY(angle, radius + 8)
          const inner = polarToXY(angle, radius - 12)
          const labelPos = polarToXY(angle, radius + 22)
          return (
            <g key={tick}>
              <line
                x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y}
                stroke="var(--gauge-subtext)" strokeWidth="1.5" opacity="0.6"
              />
              <text
                x={labelPos.x} y={labelPos.y}
                textAnchor="middle" dominantBaseline="middle"
                fill="var(--gauge-subtext)" fontSize="10"
                fontFamily="JetBrains Mono, monospace"
              >
                {tick}
              </text>
            </g>
          )
        })}

        {imc !== null && (
          <g>
            <line
              x1={cx} y1={cy} x2={needleTip.x} y2={needleTip.y}
              stroke={cat?.color || 'var(--accent)'}
              strokeWidth="3"
              strokeLinecap="round"
              style={{ transition: 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
            />
            <circle cx={cx} cy={cy} r="6" fill={cat?.color || 'var(--accent)'} />
            <circle cx={cx} cy={cy} r="3" fill="var(--gauge-bg)" />
          </g>
        )}

        <text
          x={cx} y={cy - 30}
          textAnchor="middle"
          fill="var(--gauge-text)"
          fontSize="36"
          fontWeight="700"
          fontFamily="Space Grotesk, sans-serif"
        >
          {imc !== null ? imc.toFixed(1) : '—'}
        </text>
        <text
          x={cx} y={cy - 12}
          textAnchor="middle"
          fill="var(--gauge-subtext)"
          fontSize="12"
          fontFamily="JetBrains Mono, monospace"
        >
          kg/m²
        </text>
      </svg>
      {cat && (
        <div
          className="mt-1 px-4 py-1.5 rounded-full text-sm font-semibold font-display animate-fade-in"
          style={{ background: cat.color + '20', color: cat.color }}
        >
          {cat.emoji} {cat.label}
        </div>
      )}
    </div>
  )
}

/* ───────────── AI INSIGHT ───────────── */

function AIInsight({ dados }) {
  const [analysis, setAnalysis] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchAnalysis = useCallback(async () => {
    setLoading(true)
    setError('')
    setAnalysis('')

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Erro ao obter análise da IA.')
        return
      }

      setAnalysis(data.analysis)
    } catch {
      setError('Erro de conexão. Verifique sua internet e tente novamente.')
    } finally {
      setLoading(false)
    }
  }, [dados])

  function renderMarkdown(text) {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br/>')
  }

  return (
    <div className="space-y-3">
      {!analysis && !loading && !error && (
        <button
          onClick={fetchAnalysis}
          className="w-full py-3 px-4 rounded-xl font-display font-semibold text-sm transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
          style={{
            background: 'linear-gradient(135deg, var(--accent), #6366F1)',
            color: '#fff',
          }}
        >
          ✨ Análise com Inteligência Artificial
        </button>
      )}

      {loading && (
        <div className="glass-card rounded-2xl p-6 text-center animate-fade-in">
          <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin-slow mx-auto mb-3" style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            A IA está analisando seus dados...
          </p>
        </div>
      )}

      {error && (
        <div className="glass-card rounded-2xl p-4 text-center animate-fade-in" style={{ borderColor: '#E63946' }}>
          <p className="text-sm mb-3" style={{ color: '#E63946' }}>{error}</p>
          <button
            onClick={fetchAnalysis}
            className="px-4 py-2 rounded-lg text-sm font-semibold"
            style={{ background: '#E63946', color: '#fff' }}
          >
            Tentar novamente
          </button>
        </div>
      )}

      {analysis && (
        <div className="glass-card rounded-2xl p-5 animate-fade-in-up space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 rounded text-xs font-mono font-semibold" style={{ background: 'var(--accent)', color: '#fff' }}>
              Claude AI
            </span>
          </div>
          <div
            className="text-sm leading-relaxed"
            style={{ color: 'var(--text-secondary)' }}
            dangerouslySetInnerHTML={{ __html: renderMarkdown(analysis) }}
          />
          <button
            onClick={fetchAnalysis}
            className="mt-3 px-4 py-2 rounded-lg text-xs font-semibold transition-all hover:scale-105"
            style={{ background: 'var(--surface-hover)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}
          >
            🔄 Refazer análise
          </button>
        </div>
      )}
    </div>
  )
}

/* ───────────── MAIN COMPONENT ───────────── */

export default function CalculadoraIMC() {
  const [light, setLight] = useState(false)
  const [isManual, setIsManual] = useState(false)
  const [tab, setTab] = useState('calcular')
  const [peso, setPeso] = useState('')
  const [altura, setAltura] = useState('')
  const [idade, setIdade] = useState('')
  const [sexo, setSexo] = useState('')
  const [atividade, setAtividade] = useState('')
  const [resultado, setResultado] = useState(null)
  const resultRef = useRef(null)

  // Detect system theme on mount + listen for changes
  useEffect(() => {
    if (typeof window === 'undefined') return

    const mq = window.matchMedia('(prefers-color-scheme: dark)')

    // Set initial theme from system
    setLight(!mq.matches)

    function handleChange(e) {
      if (!isManual) {
        setLight(!e.matches)
      }
    }

    mq.addEventListener('change', handleChange)
    return () => mq.removeEventListener('change', handleChange)
  }, [isManual])

  // Apply .light class to body
  useEffect(() => {
    if (light) {
      document.body.classList.add('light')
    } else {
      document.body.classList.remove('light')
    }
  }, [light])

  function handleThemeToggle() {
    setIsManual(true)
    setLight(prev => !prev)
  }

  function calcular() {
    const p = parseFloat(peso)
    const a = parseFloat(altura)
    if (!p || !a || p <= 0 || a <= 0) return

    const imc = p / (a * a)
    const cat = getCategoria(imc)
    const pesoIdealMin = 18.5 * a * a
    const pesoIdealMax = 24.9 * a * a
    let diferenca = 0
    let diferencaLabel = 'Dentro do ideal'

    if (p < pesoIdealMin) {
      diferenca = pesoIdealMin - p
      diferencaLabel = 'Abaixo do ideal'
    } else if (p > pesoIdealMax) {
      diferenca = p - pesoIdealMax
      diferencaLabel = 'Acima do ideal'
    }

    setResultado({ imc, cat, pesoIdealMin, pesoIdealMax, diferenca, diferencaLabel })

    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }

  function limpar() {
    setPeso('')
    setAltura('')
    setIdade('')
    setSexo('')
    setAtividade('')
    setResultado(null)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') calcular()
  }

  const inputStyle = {
    background: 'var(--input-bg)',
    color: 'var(--input-text)',
    borderColor: 'var(--input-border)',
  }

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: 'var(--bg)' }}>
      {/* Background Orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />

      <div className="relative z-10 w-full max-w-[480px] mx-auto px-4 py-6">
        {/* ─── Header ─── */}
        <header className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <svg width="32" height="32" viewBox="0 0 64 64" fill="none">
              <rect width="64" height="64" rx="14" fill="var(--accent)" opacity="0.15"/>
              <g transform="translate(12, 12)">
                <rect x="4" y="22" width="32" height="6" rx="2" fill="var(--accent)" opacity="0.4"/>
                <rect x="8" y="14" width="24" height="6" rx="2" fill="var(--accent)" opacity="0.65"/>
                <rect x="12" y="6" width="16" height="6" rx="2" fill="var(--accent)"/>
              </g>
            </svg>
            <h1 className="text-xl font-display font-bold">
              IMC<span style={{ color: 'var(--accent)' }}>Pro</span>
            </h1>
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold tracking-wider" style={{ background: 'var(--accent-glow)', color: 'var(--accent)' }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse-glow" style={{ background: '#22C55E' }} />
              AI POWERED
            </span>
          </div>
          <ThemeToggle light={light} isAuto={!isManual} onToggle={handleThemeToggle} />
        </header>

        {/* ─── Tabs ─── */}
        <div className="flex gap-2 mb-5">
          {[
            { id: 'calcular', label: '⚡ Calcular' },
            { id: 'tabela', label: '📊 Tabela' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="flex-1 py-2.5 rounded-xl text-sm font-display font-semibold transition-all duration-300"
              style={{
                background: tab === t.id ? 'var(--accent)' : 'var(--surface)',
                color: tab === t.id ? '#fff' : 'var(--text-secondary)',
                border: `1px solid ${tab === t.id ? 'var(--accent)' : 'var(--border-color)'}`,
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ─── Tab: Calcular ─── */}
        {tab === 'calcular' && (
          <div className="space-y-4 animate-fade-in">
            {/* Gauge */}
            <div className="glass-card rounded-2xl p-4">
              <GaugeChart imc={resultado?.imc ?? null} light={light} />
            </div>

            {/* Inputs Grid */}
            <div className="glass-card rounded-2xl p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono mb-1.5" style={{ color: 'var(--text-muted)' }}>Peso (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    placeholder="72.5"
                    value={peso}
                    onChange={e => setPeso(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full px-3 py-2.5 rounded-xl text-sm font-mono border"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono mb-1.5" style={{ color: 'var(--text-muted)' }}>Altura (m)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.5"
                    placeholder="1.75"
                    value={altura}
                    onChange={e => setAltura(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full px-3 py-2.5 rounded-xl text-sm font-mono border"
                    style={inputStyle}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono mb-1.5" style={{ color: 'var(--text-muted)' }}>Idade (anos)</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="28"
                    value={idade}
                    onChange={e => setIdade(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full px-3 py-2.5 rounded-xl text-sm font-mono border"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono mb-1.5" style={{ color: 'var(--text-muted)' }}>Sexo</label>
                  <select
                    value={sexo}
                    onChange={e => setSexo(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl text-sm font-mono border appearance-none cursor-pointer"
                    style={inputStyle}
                  >
                    <option value="">Selecione</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Feminino">Feminino</option>
                  </select>
                </div>
              </div>

              {/* Activity Chips */}
              <div>
                <label className="block text-xs font-mono mb-1.5" style={{ color: 'var(--text-muted)' }}>Nível de atividade</label>
                <div className="flex flex-wrap gap-2">
                  {ATIVIDADES.map(a => (
                    <button
                      key={a}
                      onClick={() => setAtividade(atividade === a ? '' : a)}
                      className="px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all duration-200"
                      style={{
                        background: atividade === a ? 'var(--accent)' : 'var(--surface)',
                        color: atividade === a ? '#fff' : 'var(--text-secondary)',
                        border: `1px solid ${atividade === a ? 'var(--accent)' : 'var(--border-color)'}`,
                      }}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={calcular}
                className="py-3 rounded-xl font-display font-semibold text-sm transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: 'linear-gradient(135deg, var(--accent), #0fa89a)',
                  color: '#fff',
                }}
              >
                Calcular IMC
              </button>
              <button
                onClick={limpar}
                className="py-3 rounded-xl font-display font-semibold text-sm transition-all duration-200"
                style={{
                  background: 'transparent',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-color)',
                }}
              >
                Limpar
              </button>
            </div>

            {/* Results */}
            {resultado && (
              <div ref={resultRef} className="space-y-3">
                {/* Stat Cards */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="glass-card rounded-2xl p-4 animate-fade-in-up stagger-1">
                    <p className="text-[10px] font-mono uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Peso Ideal</p>
                    <p className="text-lg font-display font-bold" style={{ color: 'var(--accent)' }}>
                      <AnimatedNumber value={resultado.pesoIdealMin} /> – <AnimatedNumber value={resultado.pesoIdealMax} />
                    </p>
                    <p className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>kg</p>
                  </div>

                  <div className="glass-card rounded-2xl p-4 animate-fade-in-up stagger-2">
                    <p className="text-[10px] font-mono uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Diferença</p>
                    <p className="text-lg font-display font-bold" style={{ color: resultado.diferenca > 0 ? resultado.cat.color : 'var(--accent)' }}>
                      {resultado.diferenca > 0 ? (
                        <><AnimatedNumber value={resultado.diferenca} /> kg</>
                      ) : (
                        '0 kg'
                      )}
                    </p>
                    <p className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>{resultado.diferencaLabel}</p>
                  </div>

                  <div className="glass-card rounded-2xl p-4 animate-fade-in-up stagger-3">
                    <p className="text-[10px] font-mono uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Classificação OMS</p>
                    <p className="text-base font-display font-bold" style={{ color: resultado.cat.color }}>
                      {resultado.cat.emoji} {resultado.cat.label}
                    </p>
                  </div>

                  <div className="glass-card rounded-2xl p-4 animate-fade-in-up stagger-4">
                    <p className="text-[10px] font-mono uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Faixa Saudável</p>
                    <p className="text-base font-display font-bold" style={{ color: 'var(--accent)' }}>
                      18.5 – 24.9
                    </p>
                    <p className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>IMC</p>
                  </div>
                </div>

                {/* AI Insight */}
                <AIInsight
                  dados={{
                    peso: parseFloat(peso),
                    altura: parseFloat(altura),
                    imc: resultado.imc.toFixed(1),
                    categoria: resultado.cat.label,
                    idade: idade || null,
                    sexo: sexo || null,
                    atividade: atividade || null,
                  }}
                />
              </div>
            )}
          </div>
        )}

        {/* ─── Tab: Tabela ─── */}
        {tab === 'tabela' && (
          <div className="glass-card rounded-2xl p-4 animate-fade-in">
            <h2 className="text-base font-display font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
              Classificação OMS do IMC
            </h2>
            <div className="space-y-2">
              {FAIXAS.map((f, i) => {
                const isActive = resultado && resultado.cat.label === f.label
                return (
                  <div
                    key={i}
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-300"
                    style={{
                      background: isActive ? f.color + '18' : 'var(--surface)',
                      border: `1px solid ${isActive ? f.color + '40' : 'var(--border-color)'}`,
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">{f.emoji}</span>
                      <span className="text-sm font-display font-medium" style={{ color: isActive ? f.color : 'var(--text-primary)' }}>
                        {f.label}
                      </span>
                    </div>
                    <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                      {f.max === 100 ? `≥ ${f.min}` : `${f.min} – ${f.max}`}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ─── Footer ─── */}
        <footer className="mt-8 text-center space-y-2 pb-4">
          <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
            Desenvolvido por <span className="font-semibold" style={{ color: 'var(--text-secondary)' }}>Gregory Pinto</span> · React + Next.js + Claude AI
          </p>
          <p className="text-[10px] font-mono leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            ⚕️ Esta ferramenta é informativa e não substitui orientação médica profissional. Consulte um profissional de saúde.
          </p>
        </footer>
      </div>
    </div>
  )
}

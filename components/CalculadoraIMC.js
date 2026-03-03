'use client'

import { useState, useRef, useEffect } from 'react'
import { getT, detectLanguage } from '@/lib/translations'
import GaugeChart, { getCategoria, FAIXAS_BASE } from './GaugeChart'
import HistoryTab from './HistoryTab'
import MetabolicAnalysis from './MetabolicAnalysis'
import AIChat from './AIChat'

/* ───────────── THEME TOGGLE ───────────── */

function ThemeToggle({ light, isAuto, onToggle }) {
  return (
    <div className="flex items-center gap-1.5">
      {isAuto && (
        <span className="text-[9px] font-mono font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded" style={{ color: 'var(--text-muted)', background: 'var(--surface)' }}>auto</span>
      )}
      <button onClick={onToggle} className="relative w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-300 hover:scale-110" style={{ background: 'var(--surface)', border: '1px solid var(--border-color)' }} aria-label="Toggle theme">
        <span className="transition-transform duration-300" style={{ display: 'inline-block', transform: light ? 'rotate(0deg)' : 'rotate(180deg)' }}>
          {light ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
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
      if (progress < 1) frameRef.current = requestAnimationFrame(tick)
    }
    frameRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frameRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  return <span>{display.toFixed(decimals)}</span>
}

/* ───────────── MAIN COMPONENT ───────────── */

export default function CalculadoraIMC() {
  // Theme
  const [light, setLight] = useState(false)
  const [isManual, setIsManual] = useState(false)

  // i18n
  const [lang, setLang] = useState('pt')

  // Tabs & form
  const [tab, setTab] = useState('calcular')
  const [peso, setPeso] = useState('')
  const [altura, setAltura] = useState('')
  const [idade, setIdade] = useState('')
  const [sexo, setSexo] = useState('')
  const [atividade, setAtividade] = useState('')
  const [resultado, setResultado] = useState(null)
  const resultRef = useRef(null)

  // History
  const [historico, setHistorico] = useState([])
  const nextId = useRef(1)

  const t = getT(lang)
  const ATIVIDADES_LIST = t.atividades

  // Detect system theme
  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    setLight(!mq.matches)
    function handleChange(e) {
      if (!isManual) setLight(!e.matches)
    }
    mq.addEventListener('change', handleChange)
    return () => mq.removeEventListener('change', handleChange)
  }, [isManual])

  // Detect browser language
  useEffect(() => {
    setLang(detectLanguage())
  }, [])

  // Apply theme class
  useEffect(() => {
    if (light) document.body.classList.add('light')
    else document.body.classList.remove('light')
  }, [light])

  // Register service worker
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }
  }, [])

  function handleThemeToggle() {
    setIsManual(true)
    setLight(prev => !prev)
  }

  function toggleLang() {
    setLang(prev => prev === 'pt' ? 'en' : 'pt')
  }

  const atividadeIndex = ATIVIDADES_LIST.indexOf(atividade)

  function calcular() {
    const p = parseFloat(peso)
    const a = parseFloat(altura)
    if (!p || !a || p <= 0 || a <= 0) return

    const imc = p / (a * a)
    const cat = getCategoria(imc, t.faixas)
    const pesoIdealMin = 18.5 * a * a
    const pesoIdealMax = 24.9 * a * a
    let diferenca = 0
    let diferencaLabel = t.stats.dentroIdeal

    if (p < pesoIdealMin) {
      diferenca = pesoIdealMin - p
      diferencaLabel = t.stats.abaixoIdeal
    } else if (p > pesoIdealMax) {
      diferenca = p - pesoIdealMax
      diferencaLabel = t.stats.acimaIdeal
    }

    setResultado({ imc, cat, pesoIdealMin, pesoIdealMax, diferenca, diferencaLabel })

    // Save to history
    const record = {
      id: nextId.current++,
      peso: p,
      altura: a,
      imc,
      categoria: cat.label,
      createdAt: Date.now(),
    }
    setHistorico(prev => [...prev.slice(-49), record])

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

  function deleteHistorico(id) {
    setHistorico(prev => prev.filter(r => r.id !== id))
  }

  function clearHistorico() {
    setHistorico([])
  }

  const inputStyle = {
    background: 'var(--input-bg)',
    color: 'var(--input-text)',
    borderColor: 'var(--input-border)',
  }

  const tabItems = [
    { id: 'calcular', label: t.tabs.calcular },
    { id: 'tabela', label: t.tabs.tabela },
    { id: 'historico', label: t.tabs.historico },
  ]

  // Sexo values depend on language
  const sexoMale = t.inputs.masculino
  const sexoFemale = t.inputs.feminino

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: 'var(--bg)' }}>
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
              {t.header.title}<span style={{ color: 'var(--accent)' }}>{t.header.titleAccent}</span>
            </h1>
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold tracking-wider" style={{ background: 'var(--accent-glow)', color: 'var(--accent)' }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse-glow" style={{ background: '#22C55E' }} />
              {t.header.badge}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggleLang} className="px-2 py-1 rounded-lg text-[10px] font-mono font-bold transition-all hover:scale-105" style={{ background: 'var(--surface)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>
              {t.lang.flag} {t.lang.label}
            </button>
            <ThemeToggle light={light} isAuto={!isManual} onToggle={handleThemeToggle} />
          </div>
        </header>

        {/* ─── Tabs ─── */}
        <div className="flex gap-2 mb-5">
          {tabItems.map(ti => (
            <button key={ti.id} onClick={() => setTab(ti.id)} className="flex-1 py-2.5 rounded-xl text-xs font-display font-semibold transition-all duration-300" style={{ background: tab === ti.id ? 'var(--accent)' : 'var(--surface)', color: tab === ti.id ? '#fff' : 'var(--text-secondary)', border: `1px solid ${tab === ti.id ? 'var(--accent)' : 'var(--border-color)'}` }}>
              {ti.label}
            </button>
          ))}
        </div>

        {/* ─── Tab: Calcular ─── */}
        {tab === 'calcular' && (
          <div className="space-y-4 animate-fade-in">
            <div className="glass-card rounded-2xl p-4">
              <GaugeChart imc={resultado?.imc ?? null} catLabel={resultado ? `${resultado.cat.emoji} ${resultado.cat.label}` : null} />
            </div>

            <div className="glass-card rounded-2xl p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono mb-1.5" style={{ color: 'var(--text-muted)' }}>{t.inputs.peso}</label>
                  <input type="number" step="0.1" min="1" placeholder={t.inputs.pesoPlaceholder} value={peso} onChange={e => setPeso(e.target.value)} onKeyDown={handleKeyDown} className="w-full px-3 py-2.5 rounded-xl text-sm font-mono border" style={inputStyle} />
                </div>
                <div>
                  <label className="block text-xs font-mono mb-1.5" style={{ color: 'var(--text-muted)' }}>{t.inputs.altura}</label>
                  <input type="number" step="0.01" min="0.5" placeholder={t.inputs.alturaPlaceholder} value={altura} onChange={e => setAltura(e.target.value)} onKeyDown={handleKeyDown} className="w-full px-3 py-2.5 rounded-xl text-sm font-mono border" style={inputStyle} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono mb-1.5" style={{ color: 'var(--text-muted)' }}>{t.inputs.idade}</label>
                  <input type="number" min="1" placeholder={t.inputs.idadePlaceholder} value={idade} onChange={e => setIdade(e.target.value)} onKeyDown={handleKeyDown} className="w-full px-3 py-2.5 rounded-xl text-sm font-mono border" style={inputStyle} />
                </div>
                <div>
                  <label className="block text-xs font-mono mb-1.5" style={{ color: 'var(--text-muted)' }}>{t.inputs.sexo}</label>
                  <select value={sexo} onChange={e => setSexo(e.target.value)} className="w-full px-3 py-2.5 rounded-xl text-sm font-mono border appearance-none cursor-pointer" style={inputStyle}>
                    <option value="">{t.inputs.sexoPlaceholder}</option>
                    <option value={sexoMale}>{sexoMale}</option>
                    <option value={sexoFemale}>{sexoFemale}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono mb-1.5" style={{ color: 'var(--text-muted)' }}>{t.inputs.atividade}</label>
                <div className="flex flex-wrap gap-2">
                  {ATIVIDADES_LIST.map(a => (
                    <button key={a} onClick={() => setAtividade(atividade === a ? '' : a)} className="px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all duration-200" style={{ background: atividade === a ? 'var(--accent)' : 'var(--surface)', color: atividade === a ? '#fff' : 'var(--text-secondary)', border: `1px solid ${atividade === a ? 'var(--accent)' : 'var(--border-color)'}` }}>
                      {a}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button onClick={calcular} className="py-3 rounded-xl font-display font-semibold text-sm transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]" style={{ background: 'linear-gradient(135deg, var(--accent), #0fa89a)', color: '#fff' }}>
                {t.buttons.calcular}
              </button>
              <button onClick={limpar} className="py-3 rounded-xl font-display font-semibold text-sm transition-all duration-200" style={{ background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>
                {t.buttons.limpar}
              </button>
            </div>

            {resultado && (
              <div ref={resultRef} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="glass-card rounded-2xl p-4 animate-fade-in-up stagger-1">
                    <p className="text-[10px] font-mono uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>{t.stats.pesoIdeal}</p>
                    <p className="text-lg font-display font-bold" style={{ color: 'var(--accent)' }}>
                      <AnimatedNumber value={resultado.pesoIdealMin} /> – <AnimatedNumber value={resultado.pesoIdealMax} />
                    </p>
                    <p className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>kg</p>
                  </div>
                  <div className="glass-card rounded-2xl p-4 animate-fade-in-up stagger-2">
                    <p className="text-[10px] font-mono uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>{t.stats.diferenca}</p>
                    <p className="text-lg font-display font-bold" style={{ color: resultado.diferenca > 0 ? resultado.cat.color : 'var(--accent)' }}>
                      {resultado.diferenca > 0 ? (<><AnimatedNumber value={resultado.diferenca} /> kg</>) : '0 kg'}
                    </p>
                    <p className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>{resultado.diferencaLabel}</p>
                  </div>
                  <div className="glass-card rounded-2xl p-4 animate-fade-in-up stagger-3">
                    <p className="text-[10px] font-mono uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>{t.stats.classificacao}</p>
                    <p className="text-base font-display font-bold" style={{ color: resultado.cat.color }}>
                      {resultado.cat.emoji} {resultado.cat.label}
                    </p>
                  </div>
                  <div className="glass-card rounded-2xl p-4 animate-fade-in-up stagger-4">
                    <p className="text-[10px] font-mono uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>{t.stats.faixaSaudavel}</p>
                    <p className="text-base font-display font-bold" style={{ color: 'var(--accent)' }}>18.5 – 24.9</p>
                    <p className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>IMC</p>
                  </div>
                </div>

                {/* Metabolic Analysis */}
                <MetabolicAnalysis
                  peso={parseFloat(peso)}
                  altura={parseFloat(altura)}
                  idade={parseInt(idade) || null}
                  sexo={sexo || null}
                  imc={resultado.imc}
                  atividadeIndex={atividadeIndex >= 0 ? atividadeIndex : null}
                  t={t.metabolic}
                />

                {/* AI Chat */}
                <AIChat
                  dados={{
                    peso: parseFloat(peso),
                    altura: parseFloat(altura),
                    imc: resultado.imc.toFixed(1),
                    categoria: resultado.cat.label,
                    idade: idade || null,
                    sexo: sexo || null,
                    atividade: atividade || null,
                  }}
                  lang={lang}
                  t={t.chat}
                />
              </div>
            )}
          </div>
        )}

        {/* ─── Tab: Tabela ─── */}
        {tab === 'tabela' && (
          <div className="glass-card rounded-2xl p-4 animate-fade-in">
            <h2 className="text-base font-display font-bold mb-3" style={{ color: 'var(--text-primary)' }}>{t.tabela.title}</h2>
            <div className="space-y-2">
              {FAIXAS_BASE.map((f, i) => {
                const ft = t.faixas[i]
                const isActive = resultado && resultado.cat.index === i
                return (
                  <div key={i} className="flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-300" style={{ background: isActive ? f.color + '18' : 'var(--surface)', border: `1px solid ${isActive ? f.color + '40' : 'var(--border-color)'}` }}>
                    <div className="flex items-center gap-2">
                      <span className="text-base">{ft.emoji}</span>
                      <span className="text-sm font-display font-medium" style={{ color: isActive ? f.color : 'var(--text-primary)' }}>{ft.label}</span>
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

        {/* ─── Tab: Histórico ─── */}
        {tab === 'historico' && (
          <HistoryTab
            historico={historico}
            onDelete={deleteHistorico}
            onClear={clearHistorico}
            t={t.historico}
            faixasT={t.faixas}
          />
        )}

        {/* ─── Footer ─── */}
        <footer className="mt-8 text-center space-y-2 pb-4">
          <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
            {t.footer.dev} <span className="font-semibold" style={{ color: 'var(--text-secondary)' }}>{t.footer.author}</span> · {t.footer.stack}
          </p>
          <p className="text-[10px] font-mono leading-relaxed" style={{ color: 'var(--text-muted)' }}>{t.footer.disclaimer}</p>
        </footer>
      </div>
    </div>
  )
}

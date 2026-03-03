'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

const MAX_MESSAGES = 10

function renderMarkdown(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br/>')
}

export default function AIChat({ dados, lang, t }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [started, setStarted] = useState(false)
  const scrollRef = useRef(null)
  const userMsgCount = messages.filter(m => m.role === 'user').length

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
    }, 50)
  }, [])

  const sendMessage = useCallback(async (userContent, isInitial) => {
    const newMessages = isInitial
      ? []
      : [...messages, { role: 'user', content: userContent }]

    if (!isInitial) {
      setMessages(newMessages)
    }

    setLoading(true)
    setError('')
    scrollToBottom()

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...dados,
          lang,
          messages: isInitial ? undefined : newMessages.map(m => ({ role: m.role, content: m.content })),
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || t.error)
        return
      }

      const assistantMsg = { role: 'assistant', content: data.analysis }
      setMessages(prev => [...(isInitial ? [] : prev), ...(isInitial ? [] : []), assistantMsg])

      if (isInitial) {
        setMessages([assistantMsg])
      } else {
        setMessages([...newMessages, assistantMsg])
      }
    } catch {
      setError(t.error)
    } finally {
      setLoading(false)
      scrollToBottom()
    }
  }, [messages, dados, lang, t.error, scrollToBottom])

  function handleStart() {
    setStarted(true)
    sendMessage(null, true)
  }

  function handleSend() {
    const text = input.trim()
    if (!text || loading || userMsgCount >= MAX_MESSAGES) return
    setInput('')
    sendMessage(text, false)
  }

  function handleSuggestion(text) {
    if (loading || userMsgCount >= MAX_MESSAGES) return
    sendMessage(text, false)
  }

  if (!started) {
    return (
      <button
        onClick={handleStart}
        className="w-full py-3 px-4 rounded-xl font-display font-semibold text-sm transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
        style={{ background: 'linear-gradient(135deg, var(--accent), #6366F1)', color: '#fff' }}
      >
        🤖 {t.title}
      </button>
    )
  }

  return (
    <div className="glass-card rounded-2xl overflow-hidden animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--border-color)' }}>
        <div className="flex items-center gap-2">
          <span className="text-base">🤖</span>
          <span className="text-sm font-display font-bold" style={{ color: 'var(--text-primary)' }}>{t.title}</span>
          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold" style={{ background: 'var(--accent)', color: '#fff' }}>Claude AI</span>
        </div>
        <span className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>{userMsgCount}/{MAX_MESSAGES} {t.counter}</span>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="p-4 space-y-3 overflow-y-auto" style={{ maxHeight: 400 }}>
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className="max-w-[85%] px-3 py-2 rounded-2xl text-sm leading-relaxed"
              style={msg.role === 'user'
                ? { background: 'var(--accent)', color: '#fff', borderBottomRightRadius: 4 }
                : { background: 'var(--surface-hover)', color: 'var(--text-secondary)', borderBottomLeftRadius: 4 }
              }
            >
              {msg.role === 'assistant' ? (
                <div dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }} />
              ) : (
                msg.content
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="px-4 py-2 rounded-2xl text-sm" style={{ background: 'var(--surface-hover)', color: 'var(--text-muted)', borderBottomLeftRadius: 4 }}>
              <span className="inline-flex gap-1">
                <span className="animate-bounce" style={{ animationDelay: '0s' }}>.</span>
                <span className="animate-bounce" style={{ animationDelay: '0.15s' }}>.</span>
                <span className="animate-bounce" style={{ animationDelay: '0.3s' }}>.</span>
              </span>
              {' '}{t.loading}
            </div>
          </div>
        )}

        {error && (
          <div className="text-center">
            <p className="text-xs mb-2" style={{ color: '#E63946' }}>{error}</p>
          </div>
        )}
      </div>

      {/* Suggestions */}
      {messages.length <= 1 && userMsgCount < MAX_MESSAGES && (
        <div className="px-4 pb-2 flex flex-wrap gap-1.5">
          {t.suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => handleSuggestion(s)}
              disabled={loading}
              className="px-2.5 py-1 rounded-lg text-[10px] font-mono transition-all hover:scale-105 disabled:opacity-50"
              style={{ background: 'var(--surface)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="flex gap-2 p-3" style={{ borderTop: '1px solid var(--border-color)' }}>
        {userMsgCount >= MAX_MESSAGES ? (
          <p className="text-xs font-mono w-full text-center py-2" style={{ color: 'var(--text-muted)' }}>{t.limit}</p>
        ) : (
          <>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder={t.placeholder}
              disabled={loading}
              className="flex-1 px-3 py-2 rounded-xl text-sm font-mono border"
              style={{ background: 'var(--input-bg)', color: 'var(--input-text)', borderColor: 'var(--input-border)' }}
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="px-4 py-2 rounded-xl text-sm font-display font-semibold transition-all hover:scale-105 disabled:opacity-50"
              style={{ background: 'var(--accent)', color: '#fff' }}
            >
              {t.send}
            </button>
          </>
        )}
      </div>
    </div>
  )
}

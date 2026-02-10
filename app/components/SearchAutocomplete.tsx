'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { categories, boroughs } from '@/lib/data'

interface SearchAutocompleteProps {
  initialQuery?: string
  onSearch: (query: string) => void
  placeholder?: string
  autoFocus?: boolean
}

interface Suggestion {
  text: string
  matchStart: number
  matchEnd: number
}

// Flatten all subcategories with their parent category for context
const allSubs = categories.flatMap(c => c.subs)
const categoryNames = categories.map(c => c.name)
const boroughNames = boroughs.map(b => b.name)
const allNeighborhoods = boroughs.flatMap(b => b.neighborhoods)

export default function SearchAutocomplete({ initialQuery = '', onSearch, placeholder = 'Search all of NYC...', autoFocus = false }: SearchAutocompleteProps) {
  const [query, setQuery] = useState(initialQuery)
  const [open, setOpen] = useState(false)
  const [selectedIdx, setSelectedIdx] = useState(-1)
  const [listening, setListening] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null)

  // Check for speech recognition support
  const hasSpeech = typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)

  // Eagerly computed: subs + "{sub} in {borough}" combos + category names + borough names
  const baseSuggestions = useMemo(() => {
    const items: string[] = []
    // Category names
    for (const name of categoryNames) items.push(name)
    // Subcategory names
    for (const sub of allSubs) items.push(sub)
    // "{sub} in {borough}" combos
    for (const sub of allSubs) {
      for (const b of boroughNames) {
        items.push(`${sub} in ${b}`)
      }
    }
    // Borough names
    for (const name of boroughNames) items.push(name)
    return items
  }, [])

  // Generate neighborhood combos lazily based on input
  const getNeighborhoodSuggestions = useCallback((term: string, location: string): string[] => {
    const locLower = location.toLowerCase()
    const results: string[] = []
    for (const n of allNeighborhoods) {
      if (n.toLowerCase().startsWith(locLower) || n.toLowerCase().includes(locLower)) {
        // Match term against subs
        const termLower = term.toLowerCase()
        for (const sub of allSubs) {
          if (sub.toLowerCase().startsWith(termLower) || sub.toLowerCase().includes(termLower)) {
            results.push(`${sub} in ${n}`)
            if (results.length >= 20) return results
          }
        }
      }
    }
    return results
  }, [])

  const suggestions = useMemo((): Suggestion[] => {
    const q = query.trim()
    if (!q) return []

    const inIdx = q.toLowerCase().indexOf(' in ')
    let candidates: string[]
    let matchTerm = q

    if (inIdx !== -1) {
      const term = q.slice(0, inIdx).trim()
      const location = q.slice(inIdx + 4).trim()
      if (location) {
        // Filter base suggestions + generate neighborhood combos
        const locLower = location.toLowerCase()
        const termLower = term.toLowerCase()

        candidates = []
        // From base suggestions (borough combos)
        for (const s of baseSuggestions) {
          const sLower = s.toLowerCase()
          const sInIdx = sLower.indexOf(' in ')
          if (sInIdx === -1) continue
          const sTerm = sLower.slice(0, sInIdx)
          const sLoc = sLower.slice(sInIdx + 4)
          if ((sTerm.startsWith(termLower) || sTerm.includes(termLower)) &&
              (sLoc.startsWith(locLower) || sLoc.includes(locLower))) {
            candidates.push(s)
          }
        }
        // Neighborhood combos
        const nhSuggestions = getNeighborhoodSuggestions(term, location)
        candidates.push(...nhSuggestions)

        matchTerm = q
      } else {
        // User typed "something in " but no location yet — show borough combos for the term
        const termLower = term.toLowerCase()
        candidates = baseSuggestions.filter(s => {
          const sLower = s.toLowerCase()
          return sLower.includes(' in ') && sLower.startsWith(termLower)
        })
        matchTerm = term
      }
    } else {
      // No "in" — match against full list
      const qLower = q.toLowerCase()
      candidates = baseSuggestions.filter(s => {
        const sLower = s.toLowerCase()
        return sLower.startsWith(qLower) || sLower.includes(qLower)
      })
    }

    // Dedupe
    const seen = new Set<string>()
    const unique: string[] = []
    for (const c of candidates) {
      const key = c.toLowerCase()
      if (!seen.has(key)) {
        seen.add(key)
        unique.push(c)
      }
    }

    // Sort: exact prefix first, then includes
    const qLower = matchTerm.toLowerCase()
    unique.sort((a, b) => {
      const aPrefix = a.toLowerCase().startsWith(qLower) ? 0 : 1
      const bPrefix = b.toLowerCase().startsWith(qLower) ? 0 : 1
      if (aPrefix !== bPrefix) return aPrefix - bPrefix
      return a.length - b.length
    })

    // Take top 7 and compute match highlights
    return unique.slice(0, 7).map(text => {
      const textLower = text.toLowerCase()
      const idx = textLower.indexOf(qLower)
      return {
        text,
        matchStart: idx >= 0 ? idx : 0,
        matchEnd: idx >= 0 ? idx + qLower.length : 0,
      }
    })
  }, [query, baseSuggestions, getNeighborhoodSuggestions])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Reset selection when suggestions change
  useEffect(() => {
    setSelectedIdx(-1)
  }, [suggestions])

  const submit = (value: string) => {
    const trimmed = value.trim()
    if (!trimmed) return
    setOpen(false)
    setQuery(trimmed)
    onSearch(trimmed)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open || suggestions.length === 0) {
      if (e.key === 'Enter') {
        e.preventDefault()
        submit(query)
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIdx(i => (i + 1) % suggestions.length)
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIdx(i => (i <= 0 ? suggestions.length - 1 : i - 1))
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIdx >= 0 && selectedIdx < suggestions.length) {
          submit(suggestions[selectedIdx].text)
        } else {
          submit(query)
        }
        break
      case 'Escape':
        setOpen(false)
        setSelectedIdx(-1)
        break
    }
  }

  const startVoice = () => {
    if (recognitionRef.current) {
      recognitionRef.current.abort()
      recognitionRef.current = null
      setListening(false)
      return
    }

    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) return

    const recognition = new SR()
    recognition.lang = 'en-US'
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      setQuery(transcript)
      setOpen(true)
    }

    recognition.onend = () => {
      setListening(false)
      recognitionRef.current = null
    }

    recognition.onerror = () => {
      setListening(false)
      recognitionRef.current = null
    }

    recognitionRef.current = recognition
    setListening(true)
    recognition.start()
  }

  const renderHighlighted = (s: Suggestion) => {
    const { text, matchStart, matchEnd } = s
    if (matchStart === matchEnd) return text
    return (
      <>
        {text.slice(0, matchStart)}
        <strong>{text.slice(matchStart, matchEnd)}</strong>
        {text.slice(matchEnd)}
      </>
    )
  }

  return (
    <div ref={wrapperRef} style={{ position: 'relative', maxWidth: '480px', width: '100%' }}>
      <div style={{ display: 'flex', gap: '8px' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => { setQuery(e.target.value); setOpen(true) }}
            onFocus={() => { if (query.trim()) setOpen(true) }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            autoFocus={autoFocus}
            aria-label="Search classifieds in New York City"
            autoComplete="off"
            role="combobox"
            aria-expanded={open && suggestions.length > 0}
            aria-haspopup="listbox"
            style={{
              width: '100%',
              padding: '10px 16px',
              paddingRight: hasSpeech ? '40px' : '16px',
              borderRadius: '8px',
              border: '1px solid #1a56db',
              fontSize: '0.9375rem',
              fontFamily: "'DM Sans', sans-serif",
              outline: 'none',
              color: '#111827',
              backgroundColor: '#ffffff',
              boxSizing: 'border-box',
            }}
          />
          {hasSpeech && (
            <button
              type="button"
              onClick={startVoice}
              aria-label={listening ? 'Stop voice search' : 'Start voice search'}
              style={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                animation: listening ? 'mic-pulse 1s infinite' : 'none',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={listening ? '#dc2626' : '#6b7280'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={() => submit(query)}
          style={{
            backgroundColor: 'transparent',
            color: '#1a56db',
            padding: '10px 16px',
            borderRadius: '6px',
            border: '1px solid #1a56db',
            fontSize: '0.875rem',
            fontWeight: 500,
            fontFamily: "'DM Sans', sans-serif",
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          Search
        </button>
      </div>

      {open && suggestions.length > 0 && (
        <ul
          role="listbox"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: '4px',
            backgroundColor: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            listStyle: 'none',
            padding: '4px 0',
            zIndex: 50,
            maxHeight: '320px',
            overflowY: 'auto',
          }}
        >
          {suggestions.map((s, i) => (
            <li
              key={s.text}
              role="option"
              aria-selected={i === selectedIdx}
              onMouseDown={(e) => { e.preventDefault(); submit(s.text) }}
              onMouseEnter={() => setSelectedIdx(i)}
              style={{
                padding: '8px 14px',
                fontSize: '0.875rem',
                fontFamily: "'DM Sans', sans-serif",
                color: '#111827',
                cursor: 'pointer',
                backgroundColor: i === selectedIdx ? '#f3f4f6' : 'transparent',
              }}
            >
              {renderHighlighted(s)}
            </li>
          ))}
        </ul>
      )}

      {/* Mic pulse animation */}
      {listening && (
        <style>{`
          @keyframes mic-pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.4; }
          }
        `}</style>
      )}
    </div>
  )
}

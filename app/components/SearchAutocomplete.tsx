'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { categories, boroughs, slugify, neighborhoodSlug } from '@/lib/data'

interface SearchAutocompleteProps {
  initialQuery?: string
  onSearch: (query: string) => void
  placeholder?: string
  autoFocus?: boolean
}

interface Suggestion {
  text: string
  url: string
  matchStart: number
  matchEnd: number
}

// Flatten data
const allSubs = categories.flatMap(c => c.subs)
const categoryNames = categories.map(c => c.name)
const boroughNames = boroughs.map(b => b.name)
const allNeighborhoods = boroughs.flatMap(b => b.neighborhoods)
const allTerms = [...new Set([...categoryNames, ...allSubs])]

// Lookup helpers
function findCategory(name: string) {
  return categories.find(c => c.name === name)
}
function findCategoryForSub(subName: string) {
  return categories.find(c => c.subs.includes(subName))
}
function findBorough(name: string) {
  return boroughs.find(b => b.name === name)
}
function findBoroughForNeighborhood(nhName: string) {
  return boroughs.find(b => b.neighborhoods.includes(nhName))
}

// Build the real URL for a suggestion
function buildUrl(text: string): string {
  const inIdx = text.toLowerCase().indexOf(' in ')
  if (inIdx !== -1) {
    const term = text.slice(0, inIdx).trim()
    const location = text.slice(inIdx + 4).trim()

    const cat = findCategory(term)
    const parentCat = !cat ? findCategoryForSub(term) : undefined
    const borough = findBorough(location)
    const nhBorough = !borough ? findBoroughForNeighborhood(location) : undefined

    if (cat && borough) {
      // "Jobs in Brooklyn" → /brooklyn/jobs
      return `/${borough.slug}/${cat.slug}`
    }
    if (cat && nhBorough) {
      // "Jobs in East Village" → /manhattan/east-village/jobs
      return `/${nhBorough.slug}/${neighborhoodSlug(location)}/${cat.slug}`
    }
    if (parentCat && borough) {
      // "Apartments in Brooklyn" → /brooklyn/housing/apartments
      // Route: /{borough}/{slug} where slug=category works, but there's no /{borough}/{cat}/{sub}
      // Best: /{borough}/{category} since /{borough}/{slug} handles categories
      return `/${borough.slug}/${parentCat.slug}`
    }
    if (parentCat && nhBorough) {
      // "Apartments in East Village" → /manhattan/east-village/housing/apartments
      return `/${nhBorough.slug}/${neighborhoodSlug(location)}/${parentCat.slug}/${slugify(term)}`
    }
  }

  // Plain term (no "in")
  const cat = findCategory(text)
  if (cat) return `/listings/${cat.slug}`

  const parentCat = findCategoryForSub(text)
  if (parentCat) return `/listings/${parentCat.slug}/${slugify(text)}`

  const borough = findBorough(text)
  if (borough) return `/${borough.slug}`

  return `/search?q=${encodeURIComponent(text)}`
}

// NYC abbreviation map
const nycAbbreviations: Record<string, string[]> = {
  'lic': ['Long Island City'],
  'ues': ['Upper East Side'],
  'uws': ['Upper West Side'],
  'les': ['Lower East Side'],
  'fidi': ['Financial District'],
  'bk': ['Brooklyn'],
  'si': ['Staten Island'],
  'ev': ['East Village'],
  'wv': ['West Village'],
  'bpc': ['Battery Park City'],
  'hk': ["Hell's Kitchen"],
  'soho': ['SoHo'],
  'noho': ['NoHo'],
  'dumbo': ['DUMBO'],
  'eny': ['East New York'],
  'dtown bk': ['Downtown Brooklyn'],
  'bed stuy': ['Bed-Stuy'],
  'bedstuy': ['Bed-Stuy'],
  'fh': ['Forest Hills'],
  'jh': ['Jackson Heights'],
  'ri': ['Roosevelt Island'],
}

// Rotating placeholder tips
const searchTips = [
  'apartments in east village',
  'landscaper in astoria',
  'cars in queens',
  'jobs in brooklyn',
  'plumber in park slope',
  'furniture in manhattan',
  'dog walker in harlem',
  'rooms in williamsburg',
  'electrician in the bronx',
  'bikes in greenpoint',
  'babysitter in cobble hill',
  'moving help in bushwick',
]

function matchesLocation(name: string, query: string): boolean {
  const nameLower = name.toLowerCase()
  const qLower = query.toLowerCase()
  if (nameLower.startsWith(qLower) || nameLower.includes(qLower)) return true
  const abbrevMatches = nycAbbreviations[qLower]
  if (abbrevMatches) return abbrevMatches.some(a => a.toLowerCase() === nameLower)
  return false
}

export default function SearchAutocomplete({ initialQuery = '', onSearch, placeholder, autoFocus = false }: SearchAutocompleteProps) {
  const router = useRouter()
  const [query, setQuery] = useState(initialQuery)
  const [open, setOpen] = useState(false)
  const [selectedIdx, setSelectedIdx] = useState(-1)
  const [listening, setListening] = useState(false)
  const [tipIdx, setTipIdx] = useState(0)
  const [hasSpeech, setHasSpeech] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null)

  // Detect speech support after mount (SSR-safe)
  useEffect(() => {
    setHasSpeech('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)
  }, [])

  // Rotate placeholder tips
  useEffect(() => {
    if (placeholder) return
    const interval = setInterval(() => {
      setTipIdx(i => (i + 1) % searchTips.length)
    }, 3500)
    return () => clearInterval(interval)
  }, [placeholder])

  const currentPlaceholder = placeholder || searchTips[tipIdx]

  // Eagerly computed base suggestions
  const baseSuggestions = useMemo(() => {
    const items: string[] = []
    for (const name of categoryNames) items.push(name)
    for (const sub of allSubs) items.push(sub)
    for (const term of allTerms) {
      for (const b of boroughNames) {
        items.push(`${term} in ${b}`)
      }
    }
    for (const name of boroughNames) items.push(name)
    return items
  }, [])

  // Lazy neighborhood combos
  const getNeighborhoodSuggestions = useCallback((term: string, location: string): string[] => {
    const results: string[] = []
    const termLower = term.toLowerCase()
    const matchingNeighborhoods = allNeighborhoods.filter(n => matchesLocation(n, location))
    const matchingBoroughs = boroughNames.filter(b => matchesLocation(b, location))

    for (const n of matchingNeighborhoods) {
      for (const t of allTerms) {
        if (t.toLowerCase().startsWith(termLower) || t.toLowerCase().includes(termLower)) {
          results.push(`${t} in ${n}`)
          if (results.length >= 20) return results
        }
      }
    }
    for (const b of matchingBoroughs) {
      for (const t of allTerms) {
        if (t.toLowerCase().startsWith(termLower) || t.toLowerCase().includes(termLower)) {
          const combo = `${t} in ${b}`
          if (!results.includes(combo)) results.push(combo)
          if (results.length >= 20) return results
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
        const termLower = term.toLowerCase()
        candidates = []
        for (const s of baseSuggestions) {
          const sLower = s.toLowerCase()
          const sInIdx = sLower.indexOf(' in ')
          if (sInIdx === -1) continue
          const sTerm = sLower.slice(0, sInIdx)
          if ((sTerm.startsWith(termLower) || sTerm.includes(termLower)) &&
              matchesLocation(s.slice(sInIdx + 4), location)) {
            candidates.push(s)
          }
        }
        const nhSuggestions = getNeighborhoodSuggestions(term, location)
        candidates.push(...nhSuggestions)
        matchTerm = q
      } else {
        const termLower = term.toLowerCase()
        candidates = baseSuggestions.filter(s => {
          const sLower = s.toLowerCase()
          const sInIdx = sLower.indexOf(' in ')
          if (sInIdx === -1) return false
          const sTerm = sLower.slice(0, sInIdx)
          return sTerm.startsWith(termLower) || sTerm.includes(termLower)
        })
        matchTerm = term
      }
    } else {
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

    // Sort: exact prefix first, then includes, then by length
    const qLower = matchTerm.toLowerCase()
    unique.sort((a, b) => {
      const aPrefix = a.toLowerCase().startsWith(qLower) ? 0 : 1
      const bPrefix = b.toLowerCase().startsWith(qLower) ? 0 : 1
      if (aPrefix !== bPrefix) return aPrefix - bPrefix
      return a.length - b.length
    })

    return unique.slice(0, 7).map(text => {
      const textLower = text.toLowerCase()
      const idx = textLower.indexOf(qLower)
      return {
        text,
        url: buildUrl(text),
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

  useEffect(() => {
    setSelectedIdx(-1)
  }, [suggestions])

  // Navigate directly to suggestion URL
  const navigate = (suggestion: Suggestion) => {
    setOpen(false)
    setQuery(suggestion.text)
    router.push(suggestion.url)
  }

  // Free-text search fallback (no suggestion selected)
  const submitFreeText = () => {
    const trimmed = query.trim()
    if (!trimmed) return
    setOpen(false)
    onSearch(trimmed)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open || suggestions.length === 0) {
      if (e.key === 'Enter') {
        e.preventDefault()
        submitFreeText()
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
          navigate(suggestions[selectedIdx])
        } else {
          submitFreeText()
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
      const transcript = event.results[0][0].transcript as string
      setQuery(transcript)
      // Auto-navigate: try to resolve to a real page
      const url = buildUrl(transcript)
      if (url && !url.startsWith('/search')) {
        router.push(url)
      } else {
        // Fall back to search
        onSearch(transcript)
      }
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
            placeholder={currentPlaceholder}
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
          onClick={submitFreeText}
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
              onMouseDown={(e) => { e.preventDefault(); navigate(s) }}
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

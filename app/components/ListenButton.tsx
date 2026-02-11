'use client'

import { useState, useEffect, useCallback } from 'react'

export default function ListenButton({ text }: { text: string }) {
  const [playing, setPlaying] = useState(false)
  const [supported, setSupported] = useState(false)

  useEffect(() => {
    setSupported('speechSynthesis' in window)
  }, [])

  const toggle = useCallback(() => {
    if (!supported) return

    if (playing) {
      speechSynthesis.cancel()
      setPlaying(false)
      return
    }

    // Strip markdown-ish formatting
    const clean = text
      .replace(/##\s/g, '')
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/\n+/g, '. ')
      .replace(/\s+/g, ' ')
      .trim()

    // Split into chunks (speechSynthesis has length limits)
    const chunks: string[] = []
    const sentences = clean.split(/(?<=[.!?])\s+/)
    let current = ''
    for (const s of sentences) {
      if ((current + ' ' + s).length > 200) {
        if (current) chunks.push(current.trim())
        current = s
      } else {
        current += ' ' + s
      }
    }
    if (current.trim()) chunks.push(current.trim())

    setPlaying(true)

    const speakChunk = (i: number) => {
      if (i >= chunks.length) {
        setPlaying(false)
        return
      }
      const utterance = new SpeechSynthesisUtterance(chunks[i])
      utterance.rate = 1.0
      utterance.pitch = 1.0
      utterance.onend = () => speakChunk(i + 1)
      utterance.onerror = () => setPlaying(false)
      speechSynthesis.speak(utterance)
    }

    speakChunk(0)
  }, [playing, supported, text])

  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) speechSynthesis.cancel()
    }
  }, [])

  if (!supported) return null

  return (
    <button
      onClick={toggle}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 14px',
        borderRadius: '20px',
        border: '1px solid #e5e7eb',
        backgroundColor: '#fff',
        color: playing ? '#dc2626' : '#2563eb',
        fontSize: '0.8125rem',
        fontWeight: 600,
        fontFamily: "'DM Sans', sans-serif",
        cursor: 'pointer',
        transition: 'all 0.15s',
      }}
    >
      {playing ? (
        <>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="4" width="4" height="16" rx="1" />
            <rect x="14" y="4" width="4" height="16" rx="1" />
          </svg>
          Stop
        </>
      ) : (
        <>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
          Listen
        </>
      )}
    </button>
  )
}

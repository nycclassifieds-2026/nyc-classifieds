'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

interface Message {
  id: number
  sender_id: number
  content: string
  read: boolean
  created_at: string
}

export default function ThreadClient({ threadId }: { threadId: string }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [listing, setListing] = useState<{ id: number; title: string; images: string[] } | null>(null)
  const [otherUser, setOtherUser] = useState<{ id: number; name: string; verified: boolean } | null>(null)
  const [newMsg, setNewMsg] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<number | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Get current user
    fetch('/api/auth')
      .then(r => r.json())
      .then(d => { if (d.authenticated) setCurrentUserId(d.user.id) })

    // Load thread
    fetch(`/api/messages/${threadId}`)
      .then(r => r.json())
      .then(data => {
        setMessages(data.messages || [])
        setListing(data.listing)
        setOtherUser(data.otherUser)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [threadId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async () => {
    if (!newMsg.trim() || !listing || !otherUser) return
    setSending(true)
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listing_id: listing.id,
          recipient_id: otherUser.id,
          content: newMsg,
        }),
      })
      if (!res.ok) throw new Error('Failed')
      const data = await res.json()
      setMessages(prev => [...prev, {
        id: data.id,
        sender_id: currentUserId!,
        content: newMsg.trim(),
        read: false,
        created_at: new Date().toISOString(),
      }])
      setNewMsg('')
    } catch {
      alert('Failed to send message')
    } finally {
      setSending(false)
    }
  }

  if (loading) return <main style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>Loading...</main>

  return (
    <main style={{ maxWidth: '700px', margin: '0 auto', padding: '0', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 60px)' }}>
      {/* Header */}
      <div style={{
        padding: '1rem 1.5rem',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        backgroundColor: '#fff',
      }}>
        <Link href="/messages" style={{ color: '#2563eb', fontSize: '1.25rem' }}>&larr;</Link>
        <div>
          <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>
            {otherUser?.name || 'Anonymous'}
            {otherUser?.verified && <span style={{ color: '#2563eb', marginLeft: '0.25rem' }}>&#10003;</span>}
          </div>
          {listing && (
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
              {listing.title}
            </span>
          )}
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflow: 'auto', padding: '1rem 1.5rem' }}>
        {messages.map(msg => {
          const isMe = msg.sender_id === currentUserId
          return (
            <div key={msg.id} style={{
              display: 'flex',
              justifyContent: isMe ? 'flex-end' : 'flex-start',
              marginBottom: '0.75rem',
            }}>
              <div style={{
                maxWidth: '70%',
                padding: '0.625rem 0.875rem',
                borderRadius: '1rem',
                backgroundColor: isMe ? '#2563eb' : '#f1f5f9',
                color: isMe ? '#fff' : '#0f172a',
                fontSize: '0.875rem',
                lineHeight: 1.5,
              }}>
                {msg.content}
                <div style={{
                  fontSize: '0.65rem',
                  opacity: 0.7,
                  marginTop: '0.25rem',
                  textAlign: 'right',
                }}>
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: '0.75rem 1.5rem',
        borderTop: '1px solid #e2e8f0',
        display: 'flex',
        gap: '0.5rem',
        backgroundColor: '#fff',
      }}>
        <input
          type="text"
          value={newMsg}
          onChange={e => setNewMsg(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="Type a message..."
          maxLength={2000}
          style={{
            flex: 1,
            padding: '0.625rem 1rem',
            borderRadius: '1.5rem',
            border: '1px solid #e2e8f0',
            fontSize: '0.875rem',
            outline: 'none',
          }}
        />
        <button
          onClick={send}
          disabled={sending || !newMsg.trim()}
          style={{
            padding: '0.625rem 1.25rem',
            borderRadius: '1.5rem',
            border: 'none',
            backgroundColor: '#2563eb',
            color: '#fff',
            fontWeight: 600,
            fontSize: '0.875rem',
            cursor: 'pointer',
          }}
        >
          Send
        </button>
      </div>
    </main>
  )
}

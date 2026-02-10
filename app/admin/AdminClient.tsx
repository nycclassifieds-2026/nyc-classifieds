'use client'

import { useState, useEffect } from 'react'

interface FlaggedItem {
  id: number
  reporter_id: number
  content_type: string
  content_id: number
  reason: string
  status: string
  created_at: string
}

export default function AdminClient() {
  const [items, setItems] = useState<FlaggedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('pending')

  useEffect(() => {
    fetch(`/api/admin/flagged?status=${filter}`)
      .then(r => r.json())
      .then(d => setItems(d.items || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }, [filter])

  const updateStatus = async (id: number, status: string) => {
    await fetch('/api/admin/flagged', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
    setItems(prev => prev.map(i => i.id === id ? { ...i, status } : i))
  }

  return (
    <main style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>Moderation</h1>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {['pending', 'reviewed', 'resolved', 'dismissed'].map(s => (
          <button
            key={s}
            onClick={() => { setFilter(s); setLoading(true) }}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              border: '1px solid #e2e8f0',
              backgroundColor: filter === s ? '#2563eb' : '#fff',
              color: filter === s ? '#fff' : '#475569',
              fontSize: '0.875rem',
              cursor: 'pointer',
              fontWeight: filter === s ? 600 : 400,
            }}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>Loading...</div>
      ) : items.length === 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8', border: '1px dashed #e2e8f0', borderRadius: '0.75rem' }}>
          No {filter} items
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {items.map(item => (
            <div key={item.id} style={{
              padding: '1rem',
              border: '1px solid #e2e8f0',
              borderRadius: '0.75rem',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                  {item.content_type} #{item.content_id}
                </span>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                  {new Date(item.created_at).toLocaleDateString()}
                </span>
              </div>
              <p style={{ color: '#334155', fontSize: '0.875rem', marginBottom: '0.75rem' }}>
                {item.reason}
              </p>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => updateStatus(item.id, 'reviewed')} style={actionBtn}>
                  Mark Reviewed
                </button>
                <button onClick={() => updateStatus(item.id, 'resolved')} style={{ ...actionBtn, backgroundColor: '#16a34a', color: '#fff' }}>
                  Resolve
                </button>
                <button onClick={() => updateStatus(item.id, 'dismissed')} style={{ ...actionBtn, color: '#dc2626' }}>
                  Dismiss
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}

const actionBtn: React.CSSProperties = {
  padding: '0.375rem 0.75rem',
  borderRadius: '0.375rem',
  border: '1px solid #e2e8f0',
  backgroundColor: '#fff',
  fontSize: '0.75rem',
  cursor: 'pointer',
}

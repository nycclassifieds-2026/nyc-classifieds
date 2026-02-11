'use client'

import { useRouter } from 'next/navigation'
import SearchAutocomplete from './SearchAutocomplete'

function scrollToFeedback() {
  window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
  setTimeout(() => {
    const widget = document.querySelector('[data-feedback-widget]') as HTMLElement
    if (widget) widget.click()
  }, 600)
}

export default function HomeSearch() {
  const router = useRouter()

  return (
    <div>
      <SearchAutocomplete
        onSearch={(q) => router.push(`/search?q=${encodeURIComponent(q)}`)}
        placeholder="Search all of NYC..."
      />
      <button
        onClick={scrollToFeedback}
        style={{
          background: 'none',
          border: 'none',
          color: '#dc2626',
          fontSize: '0.75rem',
          fontWeight: 600,
          fontFamily: "'DM Sans', sans-serif",
          cursor: 'pointer',
          padding: '6px 0 0',
        }}
      >
        Feedback?
      </button>
    </div>
  )
}

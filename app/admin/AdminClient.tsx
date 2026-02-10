'use client'

import { useState, useEffect, useCallback } from 'react'

// ─── Types ────────────────────────────────────────────────────
interface AuthUser { id: number; email: string; name: string; role: string; verified: boolean }
interface UserRow { id: number; email: string; name: string | null; verified: boolean; role: string; banned: boolean; created_at: string }
interface FlaggedItem { id: number; reporter_id: number; content_type: string; content_id: number; reason: string; status: string; created_at: string; reporter: { id: number; email: string; name: string | null } | null; content: unknown }

interface TodoItem {
  id: string
  text: string
  done: boolean
  category: string
}

type Tab = 'home' | 'users' | 'listings' | 'porch' | 'moderation' | 'analytics' | 'docs'

// ─── Styles ───────────────────────────────────────────────────
const colors = {
  primary: '#2563eb',
  primaryHover: '#1d4ed8',
  success: '#16a34a',
  warning: '#ea580c',
  danger: '#dc2626',
  border: '#e2e8f0',
  bg: '#f8fafc',
  bgWhite: '#ffffff',
  text: '#0f172a',
  textMuted: '#475569',
  textLight: '#94a3b8',
}

const sidebarStyle: React.CSSProperties = {
  width: '220px',
  backgroundColor: colors.text,
  color: '#fff',
  padding: '1.5rem 0',
  display: 'flex',
  flexDirection: 'column',
  flexShrink: 0,
  minHeight: '100vh',
}

const navItemStyle = (active: boolean): React.CSSProperties => ({
  padding: '0.75rem 1.25rem',
  cursor: 'pointer',
  backgroundColor: active ? 'rgba(255,255,255,0.1)' : 'transparent',
  borderLeft: active ? `3px solid ${colors.primary}` : '3px solid transparent',
  fontSize: '0.875rem',
  fontWeight: active ? 600 : 400,
  transition: 'background-color 0.15s',
  display: 'flex',
  alignItems: 'center',
  gap: '0.625rem',
})

const cardStyle: React.CSSProperties = {
  backgroundColor: colors.bgWhite,
  border: `1px solid ${colors.border}`,
  borderRadius: '0.75rem',
  padding: '1.25rem',
}

const btnPrimary: React.CSSProperties = {
  padding: '0.375rem 0.75rem',
  borderRadius: '0.375rem',
  border: 'none',
  backgroundColor: colors.primary,
  color: '#fff',
  fontSize: '0.75rem',
  cursor: 'pointer',
  fontWeight: 500,
}

const btnDanger: React.CSSProperties = {
  ...btnPrimary,
  backgroundColor: colors.danger,
}

const btnOutline: React.CSSProperties = {
  padding: '0.375rem 0.75rem',
  borderRadius: '0.375rem',
  border: `1px solid ${colors.border}`,
  backgroundColor: colors.bgWhite,
  fontSize: '0.75rem',
  cursor: 'pointer',
}

const inputStyle: React.CSSProperties = {
  padding: '0.5rem 0.75rem',
  borderRadius: '0.5rem',
  border: `1px solid ${colors.border}`,
  fontSize: '0.875rem',
  outline: 'none',
  width: '260px',
}

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  width: '160px',
}

const thStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: '0.625rem 0.75rem',
  fontSize: '0.75rem',
  fontWeight: 600,
  color: colors.textMuted,
  borderBottom: `1px solid ${colors.border}`,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
}

const tdStyle: React.CSSProperties = {
  padding: '0.625rem 0.75rem',
  fontSize: '0.875rem',
  borderBottom: `1px solid ${colors.border}`,
  verticalAlign: 'middle',
}

const badge = (color: string, bg: string): React.CSSProperties => ({
  display: 'inline-block',
  padding: '0.125rem 0.5rem',
  borderRadius: '9999px',
  fontSize: '0.6875rem',
  fontWeight: 600,
  color,
  backgroundColor: bg,
})

// ─── Helpers ──────────────────────────────────────────────────
function api(path: string, opts?: RequestInit) {
  return fetch(path, { credentials: 'same-origin', ...opts }).then(r => r.json())
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// ─── Local Storage for Todos ──────────────────────────────────
const TODOS_KEY = 'nyc_admin_todos'

function loadTodos(): TodoItem[] {
  if (typeof window === 'undefined') return getDefaultTodos()
  try {
    const saved = localStorage.getItem(TODOS_KEY)
    if (saved) return JSON.parse(saved)
  } catch {}
  return getDefaultTodos()
}

function saveTodos(todos: TodoItem[]) {
  try { localStorage.setItem(TODOS_KEY, JSON.stringify(todos)) } catch {}
}

function getDefaultTodos(): TodoItem[] {
  let id = 0
  const t = (text: string, category: string): TodoItem => ({ id: String(++id), text, done: false, category })
  return [
    // ── 1. CRITICAL BUGS & INFRA ──
    t('Fix signup send-otp crash (empty JSON response — Resend key or domain issue)', 'Bugs & Infra'),
    t('Verify env vars on Vercel (SUPABASE keys, RESEND_API_KEY)', 'Bugs & Infra'),
    t('Verify Resend domain for nycclassifieds.com', 'Bugs & Infra'),
    t('Run 002_admin_roles.sql migration in Supabase', 'Bugs & Infra'),
    t('Set admin account role via SQL', 'Bugs & Infra'),
    t('Buy thenycclassifieds.com domain — point at Vercel', 'Bugs & Infra'),
    t('SSL + custom domain config', 'Bugs & Infra'),
    t('Google Search Console setup', 'Bugs & Infra'),
    t('Bing Webmaster Tools setup', 'Bugs & Infra'),

    // ── 2. DESIGN SYSTEM (everything builds on this) ──
    t('Add DM Sans + DM Serif Display from Google Fonts', 'Design System'),
    t('Set DM Serif Display for logo/wordmark + page headers', 'Design System'),
    t('Set DM Sans for all body/UI text', 'Design System'),
    t('Implement full color palette as CSS variables (blue-700 primary, gray-900 text, semantics)', 'Design System'),
    t('Set max-width to 960px (not 1200) — tighter = more readable', 'Design System'),
    t('Implement spacing system (4/8/12/16/24/32/48px)', 'Design System'),
    t('Build button styles: Primary (blue), Secondary (outline), Danger (red), Ghost', 'Design System'),
    t('Build card component: white, 1px gray-200 border, 8px radius, shadow on hover only', 'Design System'),
    t('Build tag/pill component with category accent colors at 10% opacity', 'Design System'),
    t('Build verified badge: green dot (8px) + "Verified" text', 'Design System'),
    t('Header: fixed top, 56px, logo left, search center, Post + Login right', 'Design System'),
    t('Link density rules: 15px font, 1.6 line-height, no underlines (hover only)', 'Design System'),
    t('No gradients, no illustrations, no stock photos, no icon bloat', 'Design System'),

    // ── 3. CATEGORIES & SUBCATEGORIES ──
    t('Build all 11 top-level categories: Barter, Community, For Sale, Gigs, Housing, Jobs, Personals, Pets, Rentals & Lending, Resumes, Services', 'Categories'),
    t('Build For Sale subcategories (21 subs: Electronics, Furniture, Free stuff, E-bikes, etc.)', 'Categories'),
    t('Build Jobs subcategories by industry (13 industries: AI/ML, Cannabis, Creative, Tech, Trades, etc.)', 'Categories'),
    t('Build Services subcategories (14 groups: Home, Cleaning, Tech, Beauty, Childcare, Legal, etc.)', 'Categories'),
    t('Build Housing subcategories (11 subs: Apartments, Rooms, Sublets, Co-working, etc.)', 'Categories'),
    t('Build Gigs subcategories (27 subs: Moving help, Dog walking, Snow shoveling, AI labeling, etc.)', 'Categories'),
    t('Build Community subcategories (11 subs: Events, Lost & found, Garage sales, Pop-ups, etc.)', 'Categories'),
    t('Build Personals subcategories (7 subs + geo-verified-only rule, no explicit content)', 'Categories'),
    t('Build Pets subcategories (10 subs: Adoption, Dog walking, Lost & found pets, etc.)', 'Categories'),
    t('Build Rentals & Lending subcategories (10 subs: Cameras, Tools, Party supplies, etc.)', 'Categories'),
    t('Build Resumes subcategories (10 subs by industry)', 'Categories'),
    t('Build Barter subcategories (5 subs: Goods for goods, Skills for skills, etc.)', 'Categories'),
    t('Category accent colors per design system (blue for-sale, red housing, amber gigs, etc.)', 'Categories'),

    // ── 4. GEOGRAPHY (boroughs + neighborhoods) ──
    t('Seed all 5 boroughs in neighborhoods table', 'Geography'),
    t('Seed ~43 Manhattan neighborhoods', 'Geography'),
    t('Seed ~30 Brooklyn neighborhoods', 'Geography'),
    t('Seed ~30 Queens neighborhoods', 'Geography'),
    t('Seed ~15 Bronx neighborhoods', 'Geography'),
    t('Seed ~10 Staten Island neighborhoods', 'Geography'),
    t('Build borough > neighborhood picker component', 'Geography'),
    t('URL structure: /[borough]/[neighborhood]/[category]/[subcategory]', 'Geography'),
    t('Store user default borough/neighborhood in profile', 'Geography'),
    t('"Near me" adjacent neighborhood cross-linking', 'Geography'),

    // ── 5. SEO INFRASTRUCTURE ──
    t('Auto-generate pages: /[borough], /[borough]/[neighborhood], /[borough]/[category], etc.', 'SEO'),
    t('Target: 5 boroughs x ~130 neighborhoods x 11 categories = 7,150+ indexable pages', 'SEO'),
    t('Unique meta title + description per page', 'SEO'),
    t('Breadcrumb navigation on every page (Home > Borough > Neighborhood > Category)', 'SEO'),
    t('Schema markup: JobPosting, Product, RealEstateListing, Event, LocalBusiness, Person', 'SEO'),
    t('OpenGraph + Twitter Card meta tags on all pages', 'SEO'),
    t('Canonical URLs on all pages', 'SEO'),
    t('Auto-generate sitemap.xml, submit to Google', 'SEO'),
    t('robots.txt', 'SEO'),
    t('SSG (Static Site Generation) for all category/neighborhood pages', 'SEO'),
    t('Footer with ALL neighborhoods linked', 'SEO'),
    t('Internal linking between neighborhoods and categories', 'SEO'),
    t('RSS feed per category per neighborhood', 'SEO'),
    t('Fast Core Web Vitals — target <2s mobile load', 'SEO'),

    // ── 6. CORE PAGES ──
    t('Homepage: location picker, 11 category links (text-dense grid), recent listings, search bar', 'Core Pages'),
    t('Category page: subcategory links, filter bar, grid/list toggle, pagination, listing count', 'Core Pages'),
    t('Listing page: title, description, price, 5 images, category pills, neighborhood, posted date', 'Core Pages'),
    t('Listing page: Message button, Report to admin, poster name + verified badge + member since', 'Core Pages'),
    t('Listing page: approximate map pin, share/copy URL, 30-day auto-expiry + renew button', 'Core Pages'),
    t('Listing page: OpenGraph meta tags for social sharing preview', 'Core Pages'),
    t('Search: global search bar, filter by category/borough/neighborhood/price, trigram ILIKE', 'Core Pages'),
    t('Browse: grid view (thumbnail, title, price, neighborhood, time) + list view toggle', 'Core Pages'),
    t('Browse: sort (newest/price asc/desc), filter (subcategory, neighborhood, price range)', 'Core Pages'),
    t('Browse: map toggle view with approximate pins', 'Core Pages'),
    t('Browse: pagination — NOT infinite scroll', 'Core Pages'),

    // ── 7. CONTENT SEEDING (no empty states at launch) ──
    t('Build scraper/seeder for all 11 categories across all boroughs', 'Seeding'),
    t('Seed For Sale: public listing sources, 50+ per borough', 'Seeding'),
    t('Seed Housing: aggregate public rental/sale listings', 'Seeding'),
    t('Seed Services: real NYC businesses (use existing 99 domains of data)', 'Seeding'),
    t('Seed Jobs: public job boards + AI job boards specifically', 'Seeding'),
    t('Seed Gigs: real gig postings', 'Seeding'),
    t('Seed Community: events from public sources', 'Seeding'),
    t('Seed Pets: adoption listings from shelters', 'Seeding'),
    t('Seed Personals, Barter, Resumes, Rentals with realistic samples', 'Seeding'),
    t('Schedule recurring pulls to keep content fresh', 'Seeding'),
    t('Target: minimum 50 listings per category per borough at launch', 'Seeding'),

    // ── 8. JOBS FILTERS (NYC law) ──
    t('Remote / hybrid / in-person required filter on ALL jobs', 'Jobs'),
    t('Full-time / part-time / contract / freelance filter', 'Jobs'),
    t('Salary range required (NYC transparency law)', 'Jobs'),
    t('Experience level filter (entry / mid / senior)', 'Jobs'),
    t('Benefits, start date, duration filters', 'Jobs'),

    // ── 9. USER PROFILES & REPUTATION ──
    t('User profile: first name + last initial, verified badge, member since, borough', 'Users'),
    t('Active listings count on profile', 'Users'),
    t('Response rate: "usually responds in 2 hours"', 'Users'),
    t('Post-transaction thumbs up/down rating (both parties)', 'Users'),
    t('Display: "12 positive transactions in West Village"', 'Users'),
    t('Cannot rate without completed messaging thread', 'Users'),

    // ── 10. MESSAGING UPGRADES ──
    t('Read receipts in message threads', 'Messaging'),
    t('Image sharing in message threads', 'Messaging'),
    t('"Is this still available?" quick-reply button', 'Messaging'),
    t('Block user option', 'Messaging'),
    t('Report conversation to admin', 'Messaging'),
    t('Email notification for new messages', 'Messaging'),
    t('No external links in first 3 messages (anti-phishing)', 'Messaging'),

    // ── 11. MODERATION RULES ──
    t('Users REPORT (not "flag") — goes to admin queue, no community flagging EVER', 'Moderation'),
    t('Auto-filter: block curse words and slurs on post creation', 'Moderation'),
    t('Auto-filter: block phone numbers/emails in post body (force in-app messaging)', 'Moderation'),
    t('Auto-flag: new accounts posting 5+ listings in first hour', 'Moderation'),
    t('Auto-flag: duplicate post detection (same title + description)', 'Moderation'),
    t('False reporter tracking — warning then suspension for abuse', 'Moderation'),
    t('Banned user cannot re-register (geo-selfie blocks new accounts)', 'Moderation'),
    t('Appeal process: banned users can email to contest', 'Moderation'),

    // ── 12. SAVED & ALERTS ──
    t('Save/bookmark listings', 'Saved & Alerts'),
    t('Save searches with email alerts for new matches', 'Saved & Alerts'),
    t('"Your saved listing was marked sold" notification', 'Saved & Alerts'),
    t('Saved items page in account', 'Saved & Alerts'),
    t('Email digest option: daily or instant', 'Saved & Alerts'),

    // ── 13. NOTIFICATIONS ──
    t('Listing expiring in 3 days + expired renew prompt', 'Notifications'),
    t('New message received notification', 'Notifications'),
    t('Moderation action on your post notification', 'Notifications'),
    t('Saved search match found notification', 'Notifications'),
    t('Transaction rating request notification', 'Notifications'),
    t('Push via PWA or email digest (user choice)', 'Notifications'),

    // ── 14. MAP VIEW ──
    t('Map toggle on all category pages with approximate pins', 'Map'),
    t('Click neighborhood on map to filter', 'Map'),
    t('Port Moodap neighborhood boundary data', 'Map'),
    t('Cluster markers when zoomed out', 'Map'),

    // ── 15. SCARCITY ADS ──
    t('1 corporate + 1 local ad slot per category per neighborhood', 'Ads'),
    t('"Featured Local Business" card at top of category pages', 'Ads'),
    t('Business claiming flow (port from Moodap)', 'Ads'),
    t('Advertiser dashboard: impressions, clicks, CTAs', 'Ads'),
    t('"Advertise With Us" page + pricing structure', 'Ads'),
    t('Self-serve ad purchase flow', 'Ads'),

    // ── 16. STATIC PAGES ──
    t('About page — "Free. Real. Local."', 'Static Pages'),
    t('How It Works — geo-verification, trust model', 'Static Pages'),
    t('Posting guidelines — what\'s allowed, what\'s not', 'Static Pages'),
    t('Safety tips — how to meet safely, avoid scams, suggested meet-up spots', 'Static Pages'),
    t('FAQ page', 'Static Pages'),
    t('Privacy Policy + Terms of Service', 'Static Pages'),
    t('DMCA / Copyright policy', 'Static Pages'),
    t('Contact / Support page', 'Static Pages'),
    t('"For Businesses" landing page (ad model pitch)', 'Static Pages'),
    t('Branded 404 page with search + category links', 'Static Pages'),

    // ── 17. PWA & MOBILE ──
    t('PWA manifest (home screen icon, splash screen)', 'PWA'),
    t('Offline shell', 'PWA'),
    t('Camera access for posting photos + selfie verification', 'PWA'),
    t('Touch-friendly all flows', 'PWA'),
    t('SSG + CDN for static pages', 'PWA'),

    // ── 18. ANALYTICS ──
    t('Page views per category / neighborhood tracking', 'Analytics'),
    t('Posting volume tracking', 'Analytics'),
    t('Search query tracking (what people search = what to seed)', 'Analytics'),
    t('User signup tracking', 'Analytics'),
    t('Message volume tracking', 'Analytics'),
    t('Moderation queue metrics', 'Analytics'),
    t('Ad slot impression / click tracking', 'Analytics'),

    // ── 19. DOMAINS ──
    t('Reserve theclassifieds.com (check availability)', 'Domains'),
    t('Reserve thelaclassifieds.com', 'Domains'),
    t('Reserve thechicagoclassifieds.com', 'Domains'),
    t('Reserve thesfclassifieds.com', 'Domains'),
    t('Reserve themiamiclassifieds.com', 'Domains'),
    t('Reserve thebostonclassifieds.com', 'Domains'),
    t('Reserve thedcclassifieds.com', 'Domains'),
  ]
}

// ─── Main Component ───────────────────────────────────────────
export default function AdminClient() {
  const [tab, setTab] = useState<Tab>('home')
  const [pinUnlocked, setPinUnlocked] = useState(false)
  const [pinInput, setPinInput] = useState('')
  const [pinError, setPinError] = useState(false)

  const handlePinSubmit = async () => {
    // Client-side PIN gate + server-side role check
    if (pinInput !== '2179') {
      setPinError(true)
      setPinInput('')
      return
    }
    try {
      const res = await fetch('/api/auth')
      const data = await res.json()
      if (data.authenticated && (data.user?.role === 'admin' || data.user?.role === 'moderator')) {
        setPinUnlocked(true)
        setPinError(false)
      } else {
        setPinError(true)
        setPinInput('')
      }
    } catch {
      setPinError(true)
      setPinInput('')
    }
  }

  if (!pinUnlocked) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: '1rem' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: colors.text }}>Admin Access</h1>
        <p style={{ color: colors.textMuted, fontSize: '0.875rem' }}>Enter PIN to continue.</p>
        <input
          type="password"
          inputMode="numeric"
          maxLength={4}
          placeholder="4-digit PIN"
          value={pinInput}
          onChange={e => setPinInput(e.target.value.replace(/\D/g, ''))}
          onKeyDown={e => e.key === 'Enter' && handlePinSubmit()}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '0.5rem',
            border: `1px solid ${pinError ? colors.danger : colors.border}`,
            fontSize: '1rem',
            textAlign: 'center',
            width: '120px',
            outline: 'none',
            letterSpacing: '0.25em',
          }}
        />
        {pinError && <p style={{ color: colors.danger, fontSize: '0.8125rem', margin: 0 }}>Access denied.</p>}
        <button style={btnPrimary} onClick={handlePinSubmit} disabled={pinInput.length !== 4}>Continue</button>
      </div>
    )
  }

  const navItems: { key: Tab; label: string; icon: string }[] = [
    { key: 'home', label: 'Home', icon: '\u2302' },
    { key: 'users', label: 'Users', icon: '\u2603' },
    { key: 'listings', label: 'Listings', icon: '\u2616' },
    { key: 'porch', label: 'Porch Posts', icon: '\u2601' },
    { key: 'moderation', label: 'Moderation', icon: '\u2691' },
    { key: 'analytics', label: 'Analytics', icon: '\u2605' },
    { key: 'docs', label: 'Docs', icon: '\u2637' },
  ]

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: colors.bg }}>
      <nav style={sidebarStyle}>
        <div style={{ padding: '0 1.25rem', marginBottom: '2rem' }}>
          <div style={{ fontWeight: 700, fontSize: '1.125rem', marginBottom: '0.125rem' }}>NYC Classifieds</div>
          <div style={{ fontSize: '0.75rem', color: colors.textLight }}>Admin Dashboard</div>
        </div>
        {navItems.map(n => (
          <div key={n.key} style={navItemStyle(tab === n.key)} onClick={() => setTab(n.key)}>
            <span style={{ fontSize: '1rem' }}>{n.icon}</span>
            {n.label}
          </div>
        ))}
        <div style={{ marginTop: 'auto', padding: '1rem 1.25rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <a href="/" style={{ color: colors.textLight, fontSize: '0.75rem', textDecoration: 'none' }}>Back to site</a>
        </div>
      </nav>

      <main style={{ flex: 1, padding: '1.5rem 2rem', maxWidth: '1100px', overflow: 'auto' }}>
        {tab === 'home' && <HomeTab />}
        {tab === 'users' && <UsersTab isAdmin={true} currentUserId={0} />}
        {tab === 'listings' && <ListingsTab />}
        {tab === 'porch' && <PorchTab />}
        {tab === 'moderation' && <ModerationTab />}
        {tab === 'analytics' && <AnalyticsTab />}
        {tab === 'docs' && <DocsTab />}
      </main>
    </div>
  )
}

// ─── Home Tab (Checklist) ─────────────────────────────────────
function HomeTab() {
  const [todos, setTodos] = useState<TodoItem[]>(loadTodos)
  const [newText, setNewText] = useState('')
  const [newCategory, setNewCategory] = useState('General')
  const [stats, setStats] = useState<{ users: number; listings: number; messages: number; pendingFlags: number } | null>(null)

  useEffect(() => {
    api('/api/admin/stats').then(d => setStats(d.stats || null)).catch(() => {})
  }, [])

  useEffect(() => { saveTodos(todos) }, [todos])

  const toggle = (id: string) => {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t))
  }

  const addTodo = () => {
    if (!newText.trim()) return
    setTodos(prev => [...prev, { id: Date.now().toString(), text: newText.trim(), done: false, category: newCategory }])
    setNewText('')
  }

  const removeTodo = (id: string) => {
    setTodos(prev => prev.filter(t => t.id !== id))
  }

  const resetTodos = () => {
    if (confirm('Reset to default checklist? Your current items will be removed.')) {
      setTodos(getDefaultTodos())
    }
  }

  const doneCount = todos.filter(t => t.done).length
  const totalCount = todos.length
  const categories = [...new Set(todos.map(t => t.category))]

  return (
    <div>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.25rem' }}>Dashboard Home</h2>
      <p style={{ color: colors.textMuted, fontSize: '0.875rem', marginBottom: '1.5rem' }}>
        {doneCount}/{totalCount} tasks complete
      </p>

      {/* Quick stats bar */}
      {stats && (
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          {[
            { label: 'Users', value: stats.users },
            { label: 'Listings', value: stats.listings },
            { label: 'Messages', value: stats.messages },
            { label: 'Pending flags', value: stats.pendingFlags, highlight: stats.pendingFlags > 0 },
          ].map(s => (
            <div key={s.label} style={{
              ...cardStyle,
              padding: '0.75rem 1rem',
              flex: 1,
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: s.highlight ? colors.danger : colors.text }}>{s.value}</div>
              <div style={{ fontSize: '0.6875rem', color: colors.textLight, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Progress bar */}
      <div style={{ height: '6px', backgroundColor: colors.border, borderRadius: '3px', marginBottom: '1.5rem' }}>
        <div style={{
          height: '100%',
          width: totalCount > 0 ? `${(doneCount / totalCount) * 100}%` : '0%',
          backgroundColor: doneCount === totalCount ? colors.success : colors.primary,
          borderRadius: '3px',
          transition: 'width 0.3s',
        }} />
      </div>

      {/* Add new item */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <input
          style={{ ...inputStyle, flex: 1, width: 'auto' }}
          placeholder="Add a task..."
          value={newText}
          onChange={e => setNewText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addTodo()}
        />
        <select style={{ ...selectStyle, width: '120px' }} value={newCategory} onChange={e => setNewCategory(e.target.value)}>
          {['Bugs & Infra', 'Design System', 'Categories', 'Geography', 'SEO', 'Core Pages', 'Seeding', 'Jobs', 'Users', 'Messaging', 'Moderation', 'Saved & Alerts', 'Notifications', 'Map', 'Ads', 'Static Pages', 'PWA', 'Analytics', 'Domains', 'General'].map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <button style={btnPrimary} onClick={addTodo}>Add</button>
      </div>

      {/* Checklist grouped by category */}
      {categories.map(cat => {
        const catTodos = todos.filter(t => t.category === cat)
        const catDone = catTodos.filter(t => t.done).length
        return (
          <div key={cat} style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <h3 style={{ fontSize: '0.8125rem', fontWeight: 600, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>{cat}</h3>
              <span style={{ fontSize: '0.6875rem', color: colors.textLight }}>{catDone}/{catTodos.length}</span>
            </div>
            <div style={{ ...cardStyle, padding: 0 }}>
              {catTodos.map((todo, i) => (
                <div
                  key={todo.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.625rem 1rem',
                    borderBottom: i < catTodos.length - 1 ? `1px solid ${colors.border}` : 'none',
                    cursor: 'pointer',
                  }}
                  onClick={() => toggle(todo.id)}
                >
                  <div style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '4px',
                    border: todo.done ? 'none' : `2px solid ${colors.border}`,
                    backgroundColor: todo.done ? colors.success : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    color: '#fff',
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                  }}>
                    {todo.done && '\u2713'}
                  </div>
                  <span style={{
                    flex: 1,
                    fontSize: '0.875rem',
                    color: todo.done ? colors.textLight : colors.text,
                    textDecoration: todo.done ? 'line-through' : 'none',
                  }}>
                    {todo.text}
                  </span>
                  <button
                    onClick={e => { e.stopPropagation(); removeTodo(todo.id) }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: colors.textLight,
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      padding: '0 0.25rem',
                      opacity: 0.5,
                    }}
                  >
                    x
                  </button>
                </div>
              ))}
            </div>
          </div>
        )
      })}

      <button style={{ ...btnOutline, fontSize: '0.6875rem', color: colors.textLight }} onClick={resetTodos}>
        Reset to defaults
      </button>
    </div>
  )
}

// ─── Users Tab ────────────────────────────────────────────────
function UsersTab({ isAdmin, currentUserId }: { isAdmin: boolean; currentUserId: number }) {
  const [users, setUsers] = useState<UserRow[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [loading, setLoading] = useState(true)

  const load = useCallback(() => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page) })
    if (search) params.set('search', search)
    if (roleFilter) params.set('role', roleFilter)
    api(`/api/admin/users?${params}`).then(d => {
      setUsers(d.users || [])
      setTotal(d.total || 0)
      setLoading(false)
    })
  }, [page, search, roleFilter])

  useEffect(() => { load() }, [load])

  const patchUser = async (id: number, action: string, value?: string) => {
    await api('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action, value }),
    })
    load()
  }

  const totalPages = Math.ceil(total / 50)

  return (
    <div>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.25rem' }}>Users</h2>
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', alignItems: 'center' }}>
        <input
          style={inputStyle}
          placeholder="Search by email or name..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
        />
        <select style={selectStyle} value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1) }}>
          <option value="">All roles</option>
          <option value="user">User</option>
          <option value="moderator">Moderator</option>
          <option value="admin">Admin</option>
        </select>
        <span style={{ fontSize: '0.75rem', color: colors.textLight }}>{total} total</span>
      </div>
      {loading ? (
        <div style={{ padding: '2rem', color: colors.textLight, textAlign: 'center' }}>Loading...</div>
      ) : (
        <div style={{ ...cardStyle, padding: 0 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={thStyle}>ID</th>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Role</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Joined</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td style={tdStyle}>{u.id}</td>
                  <td style={tdStyle}>{u.email}</td>
                  <td style={tdStyle}>{u.name || '\u2014'}</td>
                  <td style={tdStyle}>
                    <span style={badge(
                      u.role === 'admin' ? colors.danger : u.role === 'moderator' ? colors.primary : colors.textMuted,
                      u.role === 'admin' ? '#fef2f2' : u.role === 'moderator' ? '#eff6ff' : '#f1f5f9'
                    )}>{u.role}</span>
                  </td>
                  <td style={tdStyle}>
                    {u.banned && <span style={badge('#fff', colors.danger)}>Banned</span>}
                    {u.verified && !u.banned && <span style={badge(colors.success, '#f0fdf4')}>Verified</span>}
                    {!u.verified && !u.banned && <span style={badge(colors.textLight, '#f1f5f9')}>Unverified</span>}
                  </td>
                  <td style={{ ...tdStyle, color: colors.textLight, fontSize: '0.75rem' }}>{formatDate(u.created_at)}</td>
                  <td style={tdStyle}>
                    {u.id !== currentUserId && (
                      <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                        <button style={btnOutline} onClick={() => patchUser(u.id, 'toggle_verified')}>
                          {u.verified ? 'Unverify' : 'Verify'}
                        </button>
                        {u.banned ? (
                          <button style={btnOutline} onClick={() => patchUser(u.id, 'unban')}>Unban</button>
                        ) : (
                          <button style={btnDanger} onClick={() => patchUser(u.id, 'ban')}>Ban</button>
                        )}
                        {isAdmin && (
                          <select
                            style={{ ...selectStyle, width: '110px', fontSize: '0.75rem', padding: '0.25rem 0.375rem' }}
                            value={u.role}
                            onChange={e => patchUser(u.id, 'change_role', e.target.value)}
                          >
                            <option value="user">User</option>
                            <option value="moderator">Moderator</option>
                            <option value="admin">Admin</option>
                          </select>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {totalPages > 1 && (
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', justifyContent: 'center', alignItems: 'center' }}>
          <button style={btnOutline} disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Prev</button>
          <span style={{ fontSize: '0.75rem', color: colors.textMuted }}>Page {page} of {totalPages}</span>
          <button style={btnOutline} disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
        </div>
      )}
    </div>
  )
}

// ─── Moderation Tab ───────────────────────────────────────────
function ModerationTab() {
  const [items, setItems] = useState<FlaggedItem[]>([])
  const [filter, setFilter] = useState('pending')
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)

  const load = useCallback(() => {
    setLoading(true)
    api(`/api/admin/flagged?status=${filter}&page=${page}`).then(d => {
      setItems(d.items || [])
      setTotal(d.total || 0)
      setLoading(false)
    })
  }, [filter, page])

  useEffect(() => { load() }, [load])

  const updateStatus = async (id: number, status: string) => {
    await api('/api/admin/flagged', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
    load()
  }

  const takeAction = async (flagId: number, action: string) => {
    await api('/api/admin/flagged', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ flagId, action }),
    })
    load()
  }

  const totalPages = Math.ceil(total / 50)

  const renderContent = (item: FlaggedItem) => {
    const c = item.content as Record<string, unknown> | null
    if (!c) return <span style={{ color: colors.textLight, fontSize: '0.8125rem' }}>Content not found or deleted</span>

    if (item.content_type === 'listing') {
      const listing = c as unknown as { id: number; title: string; status: string; images: string[]; users: { email: string; name: string | null } }
      return (
        <div style={{ padding: '0.625rem 0.875rem', backgroundColor: colors.bg, borderRadius: '0.5rem' }}>
          <div style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{listing.title}</div>
          <div style={{ fontSize: '0.75rem', color: colors.textMuted }}>by {listing.users?.email} \u2014 Status: {listing.status}</div>
          {listing.images?.[0] && (
            <img src={listing.images[0]} alt="" style={{ maxWidth: '120px', maxHeight: '80px', borderRadius: '0.25rem', marginTop: '0.375rem' }} />
          )}
        </div>
      )
    }

    if (item.content_type === 'user') {
      const user = c as unknown as { id: number; email: string; name: string | null; banned: boolean }
      return (
        <div style={{ padding: '0.625rem 0.875rem', backgroundColor: colors.bg, borderRadius: '0.5rem' }}>
          <div style={{ fontSize: '0.8125rem' }}>{user.email} {user.name ? `(${user.name})` : ''}</div>
          {user.banned && <span style={badge('#fff', colors.danger)}>Banned</span>}
        </div>
      )
    }

    if (item.content_type === 'message') {
      const msg = c as unknown as { id: number; content: string; sender: { email: string; name: string | null } }
      return (
        <div style={{ padding: '0.625rem 0.875rem', backgroundColor: colors.bg, borderRadius: '0.5rem' }}>
          <div style={{ fontSize: '0.75rem', color: colors.textMuted }}>From: {msg.sender?.name || msg.sender?.email}</div>
          <p style={{ fontSize: '0.8125rem', margin: '0.25rem 0 0' }}>{msg.content}</p>
        </div>
      )
    }

    return null
  }

  return (
    <div>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.25rem' }}>Moderation</h2>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
        {['pending', 'reviewed', 'resolved', 'dismissed'].map(s => (
          <button
            key={s}
            onClick={() => { setFilter(s); setPage(1) }}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              border: `1px solid ${colors.border}`,
              backgroundColor: filter === s ? colors.primary : '#fff',
              color: filter === s ? '#fff' : colors.textMuted,
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
        <div style={{ padding: '3rem', textAlign: 'center', color: colors.textLight }}>Loading...</div>
      ) : items.length === 0 ? (
        <div style={{ ...cardStyle, textAlign: 'center', color: colors.textLight, border: `1px dashed ${colors.border}`, padding: '3rem' }}>
          No {filter} items
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {items.map(item => (
            <div key={item.id} style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <div>
                  <span style={badge(
                    item.content_type === 'listing' ? colors.primary : item.content_type === 'user' ? colors.warning : colors.textMuted,
                    item.content_type === 'listing' ? '#eff6ff' : item.content_type === 'user' ? '#fff7ed' : '#f1f5f9'
                  )}>{item.content_type}</span>
                  <span style={{ fontSize: '0.75rem', color: colors.textLight, marginLeft: '0.5rem' }}>#{item.content_id}</span>
                </div>
                <span style={{ fontSize: '0.75rem', color: colors.textLight }}>{formatDate(item.created_at)}</span>
              </div>
              <p style={{ color: colors.textMuted, fontSize: '0.8125rem', margin: '0 0 0.25rem' }}>
                Reported by: {item.reporter?.email || 'Unknown'}
              </p>
              <p style={{ color: colors.text, fontSize: '0.875rem', margin: '0 0 0.75rem' }}>
                {item.reason}
              </p>
              <div style={{ marginBottom: '0.75rem' }}>{renderContent(item)}</div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {filter === 'pending' && (
                  <>
                    <button style={btnOutline} onClick={() => updateStatus(item.id, 'reviewed')}>Mark Reviewed</button>
                    <button style={{ ...btnPrimary, backgroundColor: colors.success }} onClick={() => updateStatus(item.id, 'resolved')}>Resolve</button>
                    <button style={btnOutline} onClick={() => takeAction(item.id, 'dismiss')}>Dismiss</button>
                    {item.content_type === 'listing' && (
                      <button style={btnDanger} onClick={() => takeAction(item.id, 'remove_listing')}>Remove Listing</button>
                    )}
                    <button style={btnDanger} onClick={() => takeAction(item.id, 'ban_user')}>Ban User</button>
                  </>
                )}
                {filter === 'reviewed' && (
                  <>
                    <button style={{ ...btnPrimary, backgroundColor: colors.success }} onClick={() => updateStatus(item.id, 'resolved')}>Resolve</button>
                    <button style={btnOutline} onClick={() => takeAction(item.id, 'dismiss')}>Dismiss</button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      {totalPages > 1 && (
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', justifyContent: 'center', alignItems: 'center' }}>
          <button style={btnOutline} disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Prev</button>
          <span style={{ fontSize: '0.75rem', color: colors.textMuted }}>Page {page} of {totalPages}</span>
          <button style={btnOutline} disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
        </div>
      )}
    </div>
  )
}

// ─── Listings Tab ─────────────────────────────────────────────
function ListingsTab() {
  const [listings, setListings] = useState<{ id: number; title: string; price: number | null; category_slug: string; status: string; images: string[]; created_at: string; user_id: number; users: { email: string; name: string | null } }[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [loading, setLoading] = useState(true)

  const load = useCallback(() => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page) })
    if (search) params.set('search', search)
    if (statusFilter) params.set('status', statusFilter)
    api(`/api/admin/listings?${params}`).then(d => {
      setListings(d.listings || [])
      setTotal(d.total || 0)
      setLoading(false)
    })
  }, [page, search, statusFilter])

  useEffect(() => { load() }, [load])

  const changeStatus = async (id: number, status: string) => {
    await api('/api/admin/listings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
    load()
  }

  const deleteListing = async (id: number) => {
    if (!confirm('Delete this listing permanently?')) return
    await api('/api/admin/listings', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    load()
  }

  const totalPages = Math.ceil(total / 50)

  return (
    <div>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.25rem' }}>Listings</h2>
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', alignItems: 'center' }}>
        <input
          style={inputStyle}
          placeholder="Search by title..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
        />
        <select style={selectStyle} value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }}>
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="sold">Sold</option>
          <option value="expired">Expired</option>
          <option value="removed">Removed</option>
        </select>
        <span style={{ fontSize: '0.75rem', color: colors.textLight }}>{total} total</span>
      </div>
      {loading ? (
        <div style={{ padding: '2rem', color: colors.textLight, textAlign: 'center' }}>Loading...</div>
      ) : (
        <div style={{ ...cardStyle, padding: 0, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={thStyle}>ID</th>
                <th style={thStyle}>Title</th>
                <th style={thStyle}>Category</th>
                <th style={thStyle}>Price</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>User</th>
                <th style={thStyle}>Created</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {listings.map(l => (
                <tr key={l.id}>
                  <td style={tdStyle}>{l.id}</td>
                  <td style={{ ...tdStyle, maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.title}</td>
                  <td style={tdStyle}><span style={badge(colors.primary, '#eff6ff')}>{l.category_slug}</span></td>
                  <td style={tdStyle}>{l.price ? `$${l.price}` : 'Free'}</td>
                  <td style={tdStyle}>
                    <span style={badge(
                      l.status === 'active' ? colors.success : l.status === 'removed' ? '#fff' : colors.textMuted,
                      l.status === 'active' ? '#f0fdf4' : l.status === 'removed' ? colors.danger : '#f1f5f9'
                    )}>{l.status}</span>
                  </td>
                  <td style={{ ...tdStyle, fontSize: '0.75rem' }}>{(l.users as { name: string | null; email: string })?.name || (l.users as { email: string })?.email}</td>
                  <td style={{ ...tdStyle, color: colors.textLight, fontSize: '0.75rem' }}>{formatDate(l.created_at)}</td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                      <select
                        style={{ ...selectStyle, width: '100px', fontSize: '0.7rem', padding: '0.2rem' }}
                        value={l.status}
                        onChange={e => changeStatus(l.id, e.target.value)}
                      >
                        <option value="active">Active</option>
                        <option value="sold">Sold</option>
                        <option value="expired">Expired</option>
                        <option value="removed">Removed</option>
                      </select>
                      <button style={{ ...btnDanger, fontSize: '0.6875rem', padding: '0.25rem 0.5rem' }} onClick={() => deleteListing(l.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {totalPages > 1 && (
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', justifyContent: 'center', alignItems: 'center' }}>
          <button style={btnOutline} disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Prev</button>
          <span style={{ fontSize: '0.75rem', color: colors.textMuted }}>Page {page} of {totalPages}</span>
          <button style={btnOutline} disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
        </div>
      )}
    </div>
  )
}

// ─── Porch Tab ────────────────────────────────────────────────
function PorchTab() {
  const [posts, setPosts] = useState<{ id: number; title: string; post_type: string; borough_slug: string; neighborhood_slug: string; pinned: boolean; created_at: string; reply_count: number; users: { email: string; name: string | null } }[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [boroughFilter, setBoroughFilter] = useState('')
  const [loading, setLoading] = useState(true)

  const load = useCallback(() => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page) })
    if (search) params.set('search', search)
    if (typeFilter) params.set('post_type', typeFilter)
    if (boroughFilter) params.set('borough', boroughFilter)
    api(`/api/admin/porch?${params}`).then(d => {
      setPosts(d.posts || [])
      setTotal(d.total || 0)
      setLoading(false)
    })
  }, [page, search, typeFilter, boroughFilter])

  useEffect(() => { load() }, [load])

  const togglePin = async (id: number, currentPinned: boolean) => {
    await api('/api/admin/porch', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, pinned: !currentPinned }),
    })
    load()
  }

  const deletePost = async (id: number) => {
    if (!confirm('Delete this porch post permanently?')) return
    await api('/api/admin/porch', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    load()
  }

  const totalPages = Math.ceil(total / 50)

  const postTypes = ['recommendation','question','alert','lost-and-found','event','stoop-sale','garage-sale','volunteer','carpool','pet-sighting','welcome','group']
  const boroughs = ['manhattan','brooklyn','queens','bronx','staten-island']

  return (
    <div>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.25rem' }}>Porch Posts</h2>
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          style={inputStyle}
          placeholder="Search by title..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
        />
        <select style={selectStyle} value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1) }}>
          <option value="">All types</option>
          {postTypes.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select style={selectStyle} value={boroughFilter} onChange={e => { setBoroughFilter(e.target.value); setPage(1) }}>
          <option value="">All boroughs</option>
          {boroughs.map(b => <option key={b} value={b}>{b.charAt(0).toUpperCase() + b.slice(1)}</option>)}
        </select>
        <span style={{ fontSize: '0.75rem', color: colors.textLight }}>{total} total</span>
      </div>
      {loading ? (
        <div style={{ padding: '2rem', color: colors.textLight, textAlign: 'center' }}>Loading...</div>
      ) : (
        <div style={{ ...cardStyle, padding: 0, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={thStyle}>ID</th>
                <th style={thStyle}>Title</th>
                <th style={thStyle}>Type</th>
                <th style={thStyle}>Borough</th>
                <th style={thStyle}>Neighborhood</th>
                <th style={thStyle}>User</th>
                <th style={thStyle}>Replies</th>
                <th style={thStyle}>Created</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map(p => (
                <tr key={p.id}>
                  <td style={tdStyle}>{p.id}</td>
                  <td style={{ ...tdStyle, maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {p.pinned && <span style={{ color: colors.warning, marginRight: '0.25rem' }} title="Pinned">*</span>}
                    {p.title}
                  </td>
                  <td style={tdStyle}><span style={badge(colors.primary, '#eff6ff')}>{p.post_type}</span></td>
                  <td style={tdStyle}>{p.borough_slug}</td>
                  <td style={{ ...tdStyle, fontSize: '0.75rem' }}>{p.neighborhood_slug}</td>
                  <td style={{ ...tdStyle, fontSize: '0.75rem' }}>{(p.users as { name: string | null; email: string })?.name || (p.users as { email: string })?.email}</td>
                  <td style={tdStyle}>{p.reply_count}</td>
                  <td style={{ ...tdStyle, color: colors.textLight, fontSize: '0.75rem' }}>{formatDate(p.created_at)}</td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', gap: '0.375rem' }}>
                      <button style={btnOutline} onClick={() => togglePin(p.id, p.pinned)}>
                        {p.pinned ? 'Unpin' : 'Pin'}
                      </button>
                      <button style={{ ...btnDanger, fontSize: '0.6875rem', padding: '0.25rem 0.5rem' }} onClick={() => deletePost(p.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {totalPages > 1 && (
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', justifyContent: 'center', alignItems: 'center' }}>
          <button style={btnOutline} disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Prev</button>
          <span style={{ fontSize: '0.75rem', color: colors.textMuted }}>Page {page} of {totalPages}</span>
          <button style={btnOutline} disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
        </div>
      )}
    </div>
  )
}

// ─── Analytics Tab ────────────────────────────────────────────
interface AnalyticsData {
  totals: { users: number; listings: number; porch_posts: number; porch_replies: number; messages: number; posts_today: number }
  daily: {
    user_growth: { real: Record<string, number>; seed: Record<string, number> }
    post_volume: { real: Record<string, number>; seed: Record<string, number> }
    listing_volume: { real: Record<string, number>; seed: Record<string, number> }
    replies: Record<string, number>
    messages: Record<string, number>
  }
  breakdowns: {
    by_borough: Record<string, number>
    by_post_type: Record<string, number>
    by_category: Record<string, number>
  }
  cron: { enabled: boolean; posts_today: number; date: string; start_date: string } | null
}

function BarChart({ data, label, color = colors.primary }: { data: Record<string, number>; label: string; color?: string }) {
  const entries = Object.entries(data).sort(([a], [b]) => a.localeCompare(b))
  const max = Math.max(...entries.map(([, v]) => v), 1)

  if (entries.length === 0) {
    return <p style={{ color: colors.textLight, fontSize: '0.75rem' }}>No data</p>
  }

  return (
    <div>
      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: colors.textMuted, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {entries.map(([key, value]) => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.625rem', color: colors.textLight, width: '70px', textAlign: 'right', flexShrink: 0 }}>{key.replace(/-/g, ' ')}</span>
            <div style={{ flex: 1, height: '14px', backgroundColor: '#f1f5f9', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${(value / max) * 100}%`, backgroundColor: color, borderRadius: '2px', minWidth: value > 0 ? '2px' : '0' }} />
            </div>
            <span style={{ fontSize: '0.625rem', color: colors.textMuted, width: '30px', flexShrink: 0 }}>{value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function StatCard({ label, value, highlight }: { label: string; value: string | number; highlight?: boolean }) {
  return (
    <div style={{ ...cardStyle, padding: '0.75rem 1rem', flex: 1, textAlign: 'center', minWidth: '120px' }}>
      <div style={{ fontSize: '1.25rem', fontWeight: 700, color: highlight ? colors.primary : colors.text }}>{value}</div>
      <div style={{ fontSize: '0.6875rem', color: colors.textLight, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
    </div>
  )
}

function AnalyticsTab() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api('/api/admin/analytics').then(d => {
      setData(d)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  if (loading) return <div style={{ padding: '2rem', color: colors.textLight, textAlign: 'center' }}>Loading analytics...</div>
  if (!data) return <div style={{ padding: '2rem', color: colors.textLight, textAlign: 'center' }}>Failed to load analytics</div>

  // Merge real+seed for daily charts
  const allDates = new Set<string>()
  const addDates = (obj: Record<string, number>) => Object.keys(obj).forEach(d => allDates.add(d))
  addDates(data.daily.post_volume.real)
  addDates(data.daily.post_volume.seed)
  addDates(data.daily.listing_volume.real)
  addDates(data.daily.listing_volume.seed)

  const dailyPostTotal: Record<string, number> = {}
  for (const d of allDates) {
    dailyPostTotal[d] = (data.daily.post_volume.real[d] || 0) + (data.daily.post_volume.seed[d] || 0) +
                        (data.daily.listing_volume.real[d] || 0) + (data.daily.listing_volume.seed[d] || 0)
  }

  const cronStatus = data.cron
    ? (data.cron.enabled ? 'Enabled' : 'Disabled')
    : 'Not configured'

  return (
    <div>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.25rem' }}>Analytics</h2>

      {/* Stat cards */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <StatCard label="Total Users" value={data.totals.users} />
        <StatCard label="Porch Posts" value={data.totals.porch_posts} />
        <StatCard label="Listings" value={data.totals.listings} />
        <StatCard label="Posts Today" value={data.totals.posts_today} highlight />
        <StatCard label="Cron" value={cronStatus} />
      </div>

      {/* Daily volume chart */}
      <div style={{ ...cardStyle, marginBottom: '1rem' }}>
        <BarChart data={dailyPostTotal} label="Daily Post Volume (30 days)" color={colors.primary} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        {/* Replies */}
        <div style={cardStyle}>
          <BarChart data={data.daily.replies} label="Daily Replies" color={colors.success} />
        </div>
        {/* Messages */}
        <div style={cardStyle}>
          <BarChart data={data.daily.messages} label="Daily Messages" color={colors.warning} />
        </div>
      </div>

      {/* Breakdowns */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        <div style={cardStyle}>
          <BarChart data={data.breakdowns.by_borough} label="By Borough" color="#2563eb" />
        </div>
        <div style={cardStyle}>
          <BarChart data={data.breakdowns.by_post_type} label="By Post Type" color="#7c3aed" />
        </div>
        <div style={cardStyle}>
          <BarChart data={data.breakdowns.by_category} label="By Category" color="#059669" />
        </div>
      </div>

      {/* Cron status */}
      {data.cron && (
        <div style={cardStyle}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: colors.textMuted, marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Cron Seed Status</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.6875rem', color: colors.textLight }}>Status</div>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: data.cron.enabled ? colors.success : colors.danger }}>
                {data.cron.enabled ? 'Enabled' : 'Disabled'}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.6875rem', color: colors.textLight }}>Seeds Today</div>
              <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{data.cron.posts_today}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.6875rem', color: colors.textLight }}>Date</div>
              <div style={{ fontSize: '0.875rem' }}>{data.cron.date}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.6875rem', color: colors.textLight }}>Start Date</div>
              <div style={{ fontSize: '0.875rem' }}>{data.cron.start_date}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Docs Tab ─────────────────────────────────────────────────
function DocsTab() {
  const sections = [
    {
      title: '1. Architecture',
      content: `NYC Classifieds is a Next.js 16 app (App Router) with Supabase (Postgres) backend, Resend for transactional email, and Vercel for hosting + cron jobs.

**Stack:** Next.js 16 + React 19 + Supabase + Resend + Vercel
**Auth:** Email OTP + 4-digit PIN, cookie-based sessions (nyc_classifieds_user)
**Styling:** Inline styles (React.CSSProperties), color system based on Tailwind palette
**Cron:** Vercel cron jobs for automated seeding (every 15 min) and notification emails (daily)
**Email:** Resend for OTP, welcome, message notifications, listing expiry, porch reply notifications
**Content:** Porch system (community posts) + Listings (classifieds) + Messages (DMs)`,
    },
    {
      title: '2. Database Tables',
      content: `**Core tables:**
- **users** — id, email, name, pin (hashed), verified, role, banned, address, lat/lng, selfie_url, account_type, business_name, business_slug, business_category, website, phone, business_description, hours, service_area, photo_gallery
- **user_verification_codes** — OTP codes with 15-min expiry
- **listings** — title, description, price, category_slug, subcategory_slug, images[], status (active/sold/expired/removed), location, lat/lng, expires_at
- **messages** — listing_id, sender_id, recipient_id, content, read flag
- **flagged_content** — reporter_id, content_type (listing/user/message), content_id, reason, status
- **audit_log** — actor, action, entity, entity_id, details (JSON), ip
- **categories** — name, slug, icon, subcategories (JSON), sort_order
- **neighborhoods** — name, slug, lat/lng, boundary

**Porch system:**
- **porch_posts** — user_id, post_type, title, body, borough_slug, neighborhood_slug, pinned, expires_at
- **porch_replies** — post_id, user_id, body, helpful_count
- **porch_helpful_votes** — reply_id, user_id (tracks who voted)

**Cron:**
- **cron_seed_state** — id (always 1), date, posts_today, replies_today, last_post_at, posts_by_user (JSONB), start_date, enabled`,
    },
    {
      title: '3. Admin Roles & Auth',
      content: `**Role hierarchy:** user < moderator < admin

- **user** — default role, can browse/post/message
- **moderator** — can access /admin, manage users (verify/ban), moderate flagged content, view analytics
- **admin** — all moderator powers + change roles, delete listings/posts, manage categories

**Auth flow:**
1. Client-side PIN gate (2179) in AdminClient.tsx
2. Server-side requireAdmin() checks cookie + role level
3. All mutations logged via logAdminAction() to audit_log table`,
    },
    {
      title: '4. API Routes',
      content: `**Auth:**
| /api/auth | GET, POST | Auth status, login, OTP, PIN, set-name, set-account-type, set-business, set-address, logout |

**Content:**
| /api/listings | GET, POST | Browse/create listings |
| /api/listings/[id] | GET, PATCH, DELETE | View/edit/delete listing |
| /api/porch | GET, POST | Browse/create porch posts |
| /api/porch/[id] | GET, PATCH, DELETE | View/edit/delete porch post |
| /api/porch/[id]/replies | POST | Create reply on porch post |
| /api/porch/[id]/replies/[replyId]/helpful | POST | Vote reply as helpful |
| /api/messages | GET, POST | Inbox threads, send message |
| /api/messages/[threadId] | GET | View message thread |
| /api/search | GET | Global search |
| /api/flag | POST | Report content |
| /api/upload | POST | Image upload |
| /api/geocode | GET | Geocode address |
| /api/business/[slug] | GET | Business profile page |
| /api/business/photos | POST | Business photo upload |

**Admin:**
| /api/admin/stats | GET | Dashboard stat counts (users, listings, messages, flags, porch) |
| /api/admin/users | GET, PATCH | List/search users, toggle verified, ban, change role |
| /api/admin/listings | GET, PATCH, DELETE | List/search listings, change status, delete |
| /api/admin/porch | GET, PATCH, DELETE | List/search porch posts, pin/unpin, delete |
| /api/admin/messages | GET | View messages/threads |
| /api/admin/flagged | GET, PATCH, POST | Flagged content queue, take actions |
| /api/admin/audit | GET | Browse audit log |
| /api/admin/categories | GET, POST, PATCH, DELETE | CRUD categories |
| /api/admin/analytics | GET | Full analytics data (daily volumes, breakdowns, cron status) |

**Cron:**
| /api/cron/seed | GET | Automated content seeding (every 15 min, requires CRON_SECRET) |
| /api/cron/notifications | GET | Listing expiry emails (daily at 9 AM ET, requires CRON_SECRET) |`,
    },
    {
      title: '5. Porch System',
      content: `**Post types:** recommendation, question, alert, lost-and-found, event, stoop-sale, garage-sale, volunteer, carpool, pet-sighting, welcome, group

**Expiry rules:**
- alert: 48 hours
- lost-and-found, pet-sighting: 72 hours
- All others: 30 days (720 hours)

**Pinning:** lost-and-found and pet-sighting auto-pin (40% chance in seeds). Admins can pin/unpin any post.

**Moderation:** All posts run through moderateFields() which checks for:
- Blocked: excessive uppercase, external URLs, curse words
- Flagged: political content, negative sentiment

**Replies:** Max 3 replies per user per thread. Max 10 replies per day per user. 1-300 character limit.

**Helpful votes:** Users can mark replies as helpful. One vote per user per reply.`,
    },
    {
      title: '6. Content Moderation',
      content: `**9 layers of moderation:**

1. **Form structure** — Required fields, character limits on all inputs
2. **Auto-filter (block)** — Curse words/slurs rejected on submission
3. **Character limits** — Title: 100 chars, Body: 500 chars (porch) / 2000 chars (listings)
4. **Rate limits** — 3 porch posts/day, 10 replies/day, 30 messages/minute
5. **URL blocking** — External URLs blocked in porch posts and replies
6. **Uppercase blocking** — >50% uppercase characters blocked
7. **Political content flagging** — Keywords flagged for review (not blocked)
8. **Negative sentiment flagging** — Harsh language flagged for review
9. **Admin-only removal** — Only admins can delete content; moderators can flag/review

**Moderation queue:** /admin > Moderation tab. Status flow: pending > reviewed > resolved/dismissed.
Actions: dismiss, resolve, remove listing, ban user.`,
    },
    {
      title: '7. Automated Seeding',
      content: `**Cron job:** Runs every 15 minutes via Vercel cron (/api/cron/seed).
**Auth:** Requires Authorization: Bearer <CRON_SECRET> header.

**Schedule:**
- Hourly weights match NYC activity: peaks at 12-2 PM and 6-9 PM, quiet 1-5 AM
- Each 15-min run produces (hourlyWeight / 4) x ramp x weekend x killSwitch posts
- Split: 60% porch posts, 40% listings
- For every 3 posts: 1-2 replies added to existing posts

**Weekly ramp:**
- Week 1: 65% (55-70 posts/day)
- Week 2: 80% (65-85 posts/day)
- Week 3: 92% (75-95 posts/day)
- Week 4+: 100% (85-110 posts/day)

**Weekend bonus:** +20% on Saturday/Sunday

**Kill switch (real user activity):**
- 50+ real user posts today: 50% reduction
- 100+ real user posts: 75% reduction
- 200+ real user posts: seed engine OFF

**Tone profiles** (deterministic from userId % 100):
- Texter (20%): lowercase, no punctuation
- Neighbor (25%): natural, as-written
- Straight Shooter (20%): minimal exclamation
- Storyteller (15%): verbose, detailed
- Parent (10%): family-oriented
- Professional (10%): formal capitalization

**State:** Single-row cron_seed_state table. Resets daily (ET timezone). Max 3 posts per user per day.

**Enable/disable:** Set enabled=true/false in cron_seed_state table.`,
    },
    {
      title: '8. Email System',
      content: `**Provider:** Resend (RESEND_API_KEY env var)
**From:** NYC Classifieds <noreply@nycclassifieds.com>
**Domain:** nycclassifieds.com must be verified in Resend

**Email types:**
1. **OTP verification** — 6-digit code, 15-min expiry. Sent on login/signup.
2. **Welcome** — Sent after account type is set. Lists what user can do.
3. **New message notification** — Sent when someone DMs about a listing.
4. **Listing expiring** — 3 days before listing expires. Sent by daily cron.
5. **Listing expired** — When listing expires. Sent by daily cron.
6. **Porch reply notification** — When someone replies to your porch post.

**Infrastructure:**
- lib/email.ts — sendEmail() wrapper around Resend
- lib/email-templates.ts — All 6 HTML email templates
- Consistent branding: blue accent, clean layout, NYC Classifieds header

**Trigger points:**
- OTP: app/api/auth/route.ts (send-otp action)
- Welcome: app/api/auth/route.ts (set-account-type action)
- Message: app/api/messages/route.ts (POST handler)
- Porch reply: app/api/porch/[id]/replies/route.ts (POST handler)
- Listing expiry: app/api/cron/notifications/route.ts (daily cron)`,
    },
    {
      title: '9. SEO',
      content: `**Strategy:** Generate indexable pages for every borough/neighborhood/category combination.
Target: 5 boroughs x ~130 neighborhoods x 11 categories = 7,150+ pages.

**Implemented:**
- lib/seo.ts — Meta tag generation utilities
- Dynamic routes: /[borough], /[borough]/[neighborhood], /[borough]/[category]
- Schema markup: JobPosting, Product, RealEstateListing
- OpenGraph + Twitter Card meta tags
- Canonical URLs
- Breadcrumb navigation

**Planned:**
- Auto-generated sitemap.xml
- robots.txt optimization
- RSS feeds per category/neighborhood
- SSG for static pages
- Footer with all neighborhoods linked`,
    },
    {
      title: '10. Environment Variables',
      content: `Required in Vercel (Settings > Environment Variables):

**Supabase:**
- NEXT_PUBLIC_SUPABASE_URL — Supabase project URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY — Supabase anon/public key
- SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_SERVICE_KEY) — Service role key (server-only)

**Email:**
- RESEND_API_KEY — Resend API key

**Cron:**
- CRON_SECRET — Secret for authenticating Vercel cron requests

**Optional:**
- NEXT_PUBLIC_SITE_URL — Base URL for email links (defaults to https://nycclassifieds.com)

**Domain:** nycclassifieds.com must be verified in Resend for email delivery.`,
    },
    {
      title: '11. Audit Actions',
      content: `All admin mutations are logged to audit_log table with actor, action, entity, entity_id, details, and IP.

**User actions:**
admin_toggle_verified, admin_change_role, admin_ban_user, admin_unban_user

**Listing actions:**
admin_change_listing_status, admin_delete_listing

**Porch actions:**
admin_pin_porch_post, admin_unpin_porch_post, admin_delete_porch_post

**Flag actions:**
admin_resolve_flag, admin_dismiss_flag, admin_remove_flagged_listing

**Category actions:**
admin_create_category, admin_update_category, admin_delete_category

**User-generated:**
create_porch_post, create_porch_reply`,
    },
    {
      title: '12. Key Files',
      content: `**Lib:**
- lib/admin-auth.ts — requireAdmin() + logAdminAction()
- lib/supabase-server.ts — Supabase admin client singleton
- lib/supabase.ts — Supabase browser client
- lib/rate-limit.ts — In-memory rate limiter
- lib/email.ts — Centralized sendEmail() function
- lib/email-templates.ts — All 6 email templates (OTP, welcome, message, expiring, expired, reply)
- lib/porch-moderation.ts — moderateContent() + moderateFields()
- lib/seed-templates.ts — All content templates (porch, listings, replies, demographics, geography)
- lib/seed-engine.ts — Cron seed logic (scheduling, tone profiles, kill switch)
- lib/seo.ts — SEO meta tag utilities
- lib/data.ts — Static data
- lib/geocode.ts — Geocoding utilities

**App:**
- app/admin/AdminClient.tsx — Admin dashboard (7 tabs: Home, Users, Listings, Porch, Moderation, Analytics, Docs)
- app/api/auth/route.ts — Auth endpoints
- app/api/porch/route.ts — Porch CRUD
- app/api/listings/route.ts — Listings CRUD
- app/api/messages/route.ts — Messaging
- app/api/cron/seed/route.ts — Automated seeding cron
- app/api/cron/notifications/route.ts — Daily notification emails cron
- app/api/admin/* — All admin API routes

**Config:**
- vercel.json — Cron schedules (seed every 15 min, notifications daily 9 AM ET)
- middleware.ts — Request middleware
- scripts/seed-platform.mjs — Initial bulk seeder (500 users, 1500 posts, 750 listings)`,
    },
  ]

  return (
    <div>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.25rem' }}>Build Documentation</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {sections.map(s => (
          <details key={s.title} style={{ ...cardStyle, cursor: 'pointer' }}>
            <summary style={{ fontWeight: 600, fontSize: '0.9375rem', marginBottom: '0' }}>{s.title}</summary>
            <div style={{ marginTop: '0.75rem', fontSize: '0.8125rem', color: colors.textMuted, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
              {s.content}
            </div>
          </details>
        ))}
      </div>
    </div>
  )
}

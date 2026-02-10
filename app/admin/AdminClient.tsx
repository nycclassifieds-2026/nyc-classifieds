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

type Tab = 'home' | 'users' | 'moderation' | 'docs'

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
const ADMIN_PIN = '2179'

export default function AdminClient() {
  const [tab, setTab] = useState<Tab>('home')
  const [pinUnlocked, setPinUnlocked] = useState(false)
  const [pinInput, setPinInput] = useState('')
  const [pinError, setPinError] = useState(false)

  const handlePinSubmit = () => {
    if (pinInput === ADMIN_PIN) {
      setPinUnlocked(true)
      setPinError(false)
    } else {
      setPinError(true)
      setPinInput('')
    }
  }

  if (!pinUnlocked) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: '1rem' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: colors.text }}>Admin PIN</h1>
        <p style={{ color: colors.textMuted, fontSize: '0.875rem' }}>Enter PIN to continue</p>
        <input
          type="password"
          maxLength={4}
          value={pinInput}
          onChange={e => { setPinInput(e.target.value.replace(/\D/g, '')); setPinError(false) }}
          onKeyDown={e => e.key === 'Enter' && handlePinSubmit()}
          autoFocus
          style={{
            ...inputStyle,
            width: '120px',
            textAlign: 'center',
            fontSize: '1.5rem',
            letterSpacing: '0.5rem',
            borderColor: pinError ? colors.danger : colors.border,
          }}
        />
        {pinError && <p style={{ color: colors.danger, fontSize: '0.8125rem', margin: 0 }}>Wrong PIN</p>}
        <button style={btnPrimary} onClick={handlePinSubmit}>Enter</button>
      </div>
    )
  }

  const navItems: { key: Tab; label: string; icon: string }[] = [
    { key: 'home', label: 'Home', icon: '\u2302' },
    { key: 'users', label: 'Users', icon: '\u2603' },
    { key: 'moderation', label: 'Moderation', icon: '\u2691' },
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
        {tab === 'moderation' && <ModerationTab />}
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

// ─── Docs Tab ─────────────────────────────────────────────────
function DocsTab() {
  const sections = [
    {
      title: 'Architecture',
      content: `NYC Classifieds is a Next.js 16 app (App Router) with Supabase (Postgres) backend and Resend for transactional email. Deployed on Vercel.

**Stack:** Next.js 16 + React 19 + Supabase + Resend + Vercel
**Auth:** Email OTP + 4-digit PIN, cookie-based sessions (nyc_classifieds_user)
**Styling:** Inline styles (React.CSSProperties), color system based on Tailwind palette`,
    },
    {
      title: 'Database Tables',
      content: `- **users** — id, email, name, pin (hashed), verified, role, banned, address, lat/lng, selfie_url
- **user_verification_codes** — OTP codes with 15-min expiry
- **listings** — title, description, price (cents), category_slug, images[], status (active/sold/expired/removed)
- **messages** — listing_id, sender_id, recipient_id, content, read flag
- **flagged_content** — reporter_id, content_type (listing/user/message), content_id, reason, status
- **audit_log** — actor, action, entity, entity_id, details (JSON), ip
- **categories** — name, slug, icon, subcategories (JSON), sort_order
- **neighborhoods** — name, slug, lat/lng, boundary`,
    },
    {
      title: 'Admin Roles',
      content: `Three roles: **user** < **moderator** < **admin**

- **user** — default role, can browse/post/message
- **moderator** — can access /admin, manage users (verify/ban), moderate flagged content
- **admin** — all moderator powers + change roles, delete listings, manage categories

Role is stored in users.role column. Admin PIN (2179) is an extra client-side gate.`,
    },
    {
      title: 'Admin API Routes',
      content: `All routes require moderator+ role via requireAdmin() helper.

| Route | Methods | Purpose |
|-------|---------|---------|
| /api/admin/stats | GET | Dashboard stat counts |
| /api/admin/users | GET, PATCH | List/search users, toggle verified, ban, change role |
| /api/admin/listings | GET, PATCH, DELETE | List/search listings, change status, delete |
| /api/admin/messages | GET | View flagged messages, thread viewer |
| /api/admin/flagged | GET, PATCH, POST | Flagged content with joined details, take actions |
| /api/admin/audit | GET | Browse audit log with filters |
| /api/admin/categories | GET, POST, PATCH, DELETE | CRUD categories (admin only) |`,
    },
    {
      title: 'Audit Actions',
      content: `All admin mutations are logged to audit_log:

admin_toggle_verified, admin_change_role, admin_ban_user, admin_unban_user, admin_change_listing_status, admin_delete_listing, admin_resolve_flag, admin_dismiss_flag, admin_remove_flagged_listing, admin_create_category, admin_update_category, admin_delete_category`,
    },
    {
      title: 'Key Files',
      content: `- **lib/admin-auth.ts** — requireAdmin() + logAdminAction() helpers
- **lib/supabase-server.ts** — Supabase admin client singleton
- **lib/rate-limit.ts** — In-memory rate limiter
- **app/api/auth/route.ts** — All auth endpoints (login, OTP, PIN, etc.)
- **app/admin/AdminClient.tsx** — This admin dashboard UI
- **supabase/migrations/001_schema.sql** — Base schema
- **supabase/migrations/002_admin_roles.sql** — Role + banned columns`,
    },
    {
      title: 'Environment Variables',
      content: `Required in Vercel (Settings > Environment Variables):

- **NEXT_PUBLIC_SUPABASE_URL** — Supabase project URL
- **NEXT_PUBLIC_SUPABASE_ANON_KEY** — Supabase anon/public key
- **SUPABASE_SERVICE_KEY** — Supabase service role key (server-only)
- **RESEND_API_KEY** — Resend API key for sending emails

Domain nycclassifieds.com must be verified in Resend for email delivery.`,
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

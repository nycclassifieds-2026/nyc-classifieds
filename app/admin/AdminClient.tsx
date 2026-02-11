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

type Tab = 'home' | 'users' | 'listings' | 'porch' | 'moderation' | 'feedback' | 'analytics' | 'ads' | 'notifications' | 'docs'

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
  const [pinError, setPinError] = useState(false)

  // Auto-lock after 60 minutes of inactivity
  useEffect(() => {
    if (!pinUnlocked) return
    let timer: ReturnType<typeof setTimeout>
    const resetTimer = () => {
      clearTimeout(timer)
      timer = setTimeout(() => setPinUnlocked(false), 60 * 60 * 1000)
    }
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'] as const
    events.forEach(e => window.addEventListener(e, resetTimer))
    resetTimer()
    return () => {
      clearTimeout(timer)
      events.forEach(e => window.removeEventListener(e, resetTimer))
    }
  }, [pinUnlocked])

  // Verify admin role on mount via server-side auth check
  useEffect(() => {
    api('/api/auth').then(data => {
      if (data?.authenticated && (data.user?.role === 'admin' || data.user?.role === 'moderator')) {
        setPinUnlocked(true)
      } else {
        setPinError(true)
      }
    }).catch(() => setPinError(true))
  }, [])

  if (!pinUnlocked) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: '1rem' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: colors.text }}>Admin Access</h1>
        {pinError ? (
          <p style={{ color: colors.danger, fontSize: '0.875rem' }}>Access denied. You must be logged in as an admin.</p>
        ) : (
          <p style={{ color: colors.textMuted, fontSize: '0.875rem' }}>Verifying access...</p>
        )}
      </div>
    )
  }

  const navItems: { key: Tab; label: string; icon: string }[] = [
    { key: 'home', label: 'Home', icon: '\u2302' },
    { key: 'users', label: 'Users', icon: '\u2603' },
    { key: 'listings', label: 'Listings', icon: '\u2616' },
    { key: 'porch', label: 'Porch Posts', icon: '\u2601' },
    { key: 'moderation', label: 'Moderation', icon: '\u2691' },
    { key: 'feedback', label: 'Feedback', icon: '\u270D' },
    { key: 'analytics', label: 'Analytics', icon: '\u2605' },
    { key: 'ads', label: 'Ads', icon: '\u2606' },
    { key: 'notifications', label: 'Notifications', icon: '\u2709' },
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
        {tab === 'feedback' && <FeedbackTab />}
        {tab === 'analytics' && <AnalyticsTab />}
        {tab === 'ads' && <AdsTab />}
        {tab === 'notifications' && <NotificationsTab />}
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
interface FunnelStep { started: number; completed: number; failed: number; errors: Record<string, number> }
type FunnelData = Record<string, FunnelStep>

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
  signup_funnel: {
    last_7_days: FunnelData
    last_30_days: FunnelData
  }
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

const FUNNEL_STEPS = ['email', 'otp', 'type', 'name', 'business', 'pin', 'address', 'selfie', 'done']

function SignupFunnel({ data, label }: { data: FunnelData; label: string }) {
  const steps = FUNNEL_STEPS.filter(s => data[s])
  if (steps.length === 0) return <p style={{ color: colors.textLight, fontSize: '0.75rem' }}>No signup data yet</p>

  const maxStarted = Math.max(...steps.map(s => data[s].started), 1)

  return (
    <div>
      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: colors.textMuted, marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        {steps.map((step, i) => {
          const d = data[step]
          const rate = d.started > 0 ? Math.round((d.completed / d.started) * 100) : 0
          const barColor = rate >= 80 ? '#16a34a' : rate >= 50 ? '#ea580c' : '#dc2626'
          const prevCompleted = i > 0 ? data[steps[i - 1]]?.completed || 0 : 0
          const dropOff = i > 0 && prevCompleted > 0 ? Math.round(((prevCompleted - d.started) / prevCompleted) * 100) : 0

          return (
            <div key={step}>
              {i > 0 && dropOff > 0 && (
                <div style={{ fontSize: '0.625rem', color: '#dc2626', textAlign: 'right', paddingRight: '2rem', marginBottom: '1px' }}>
                  -{dropOff}% drop-off
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.6875rem', color: colors.textMuted, width: '52px', textAlign: 'right', flexShrink: 0, fontWeight: 500 }}>{step}</span>
                <div style={{ flex: 1, height: '18px', backgroundColor: '#f1f5f9', borderRadius: '3px', overflow: 'hidden', position: 'relative' }}>
                  <div style={{ height: '100%', width: `${(d.started / maxStarted) * 100}%`, backgroundColor: barColor, borderRadius: '3px', minWidth: d.started > 0 ? '2px' : '0', opacity: 0.2 }} />
                  <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: `${(d.completed / maxStarted) * 100}%`, backgroundColor: barColor, borderRadius: '3px', minWidth: d.completed > 0 ? '2px' : '0' }} />
                </div>
                <span style={{ fontSize: '0.625rem', color: colors.textMuted, width: '80px', flexShrink: 0 }}>
                  {d.completed}/{d.started} <span style={{ color: barColor, fontWeight: 600 }}>{rate}%</span>
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function SignupErrors({ data }: { data: FunnelData }) {
  const allErrors: { step: string; error: string; count: number }[] = []
  for (const step of FUNNEL_STEPS) {
    const d = data[step]
    if (!d) continue
    for (const [error, count] of Object.entries(d.errors)) {
      allErrors.push({ step, error, count })
    }
  }
  allErrors.sort((a, b) => b.count - a.count)

  if (allErrors.length === 0) return <p style={{ color: colors.textLight, fontSize: '0.75rem' }}>No errors recorded</p>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
      {allErrors.slice(0, 10).map((e, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem' }}>
          <span style={{
            display: 'inline-block', padding: '0.125rem 0.5rem', borderRadius: '9999px',
            fontSize: '0.6875rem', fontWeight: 600, backgroundColor: '#fee2e2', color: '#dc2626',
          }}>{e.step}</span>
          <span style={{ color: colors.textMuted, flex: 1 }}>{e.error}</span>
          <span style={{ fontWeight: 600, color: colors.text }}>{e.count}</span>
        </div>
      ))}
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

      {/* Signup Funnel */}
      {data.signup_funnel && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div style={cardStyle}>
              <SignupFunnel data={data.signup_funnel.last_7_days} label="Signup Funnel (7 days)" />
            </div>
            <div style={cardStyle}>
              <SignupFunnel data={data.signup_funnel.last_30_days} label="Signup Funnel (30 days)" />
            </div>
          </div>
          <div style={{ ...cardStyle, marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: colors.textMuted, marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Top Signup Errors (30 days)</div>
            <SignupErrors data={data.signup_funnel.last_30_days} />
          </div>
        </>
      )}

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

// ─── Notifications Tab ────────────────────────────────────────
interface AdminNotification {
  id: number
  sender_id: number
  recipient_id: number | null
  title: string
  body: string | null
  link: string | null
  sent_notification: boolean
  sent_email: boolean
  recipient_count: number
  created_at: string
  sender: { email: string; name: string | null } | null
  recipient: { email: string; name: string | null } | null
}

function NotificationsTab() {
  const [mode, setMode] = useState<'single' | 'broadcast'>('single')
  const [emailLookup, setEmailLookup] = useState('')
  const [foundUser, setFoundUser] = useState<{ id: number; email: string; name: string | null } | null>(null)
  const [lookupError, setLookupError] = useState('')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [link, setLink] = useState('')
  const [sendNotification, setSendNotification] = useState(true)
  const [sendEmailFlag, setSendEmailFlag] = useState(true)
  const [sending, setSending] = useState(false)
  const [sendResult, setSendResult] = useState<{ ok: boolean; message: string } | null>(null)
  const [confirmBroadcast, setConfirmBroadcast] = useState(false)

  const [history, setHistory] = useState<AdminNotification[]>([])
  const [historyTotal, setHistoryTotal] = useState(0)
  const [historyPage, setHistoryPage] = useState(1)
  const [historyLoading, setHistoryLoading] = useState(true)

  const historyLimit = 50
  const historyTotalPages = Math.ceil(historyTotal / historyLimit)

  const fetchHistory = useCallback(async () => {
    setHistoryLoading(true)
    const data = await api(`/api/admin/notifications?page=${historyPage}`)
    setHistory(data.notifications || [])
    setHistoryTotal(data.total || 0)
    setHistoryLoading(false)
  }, [historyPage])

  useEffect(() => { fetchHistory() }, [fetchHistory])

  const lookupUser = async () => {
    setLookupError('')
    setFoundUser(null)
    if (!emailLookup.trim()) return
    const data = await api(`/api/admin/users?search=${encodeURIComponent(emailLookup.trim())}`)
    const users = data.users || []
    if (users.length === 0) {
      setLookupError('No user found with that email')
    } else {
      setFoundUser({ id: users[0].id, email: users[0].email, name: users[0].name })
    }
  }

  const handleSend = async () => {
    if (!title.trim()) return
    if (mode === 'single' && !foundUser) return
    if (mode === 'broadcast' && !confirmBroadcast) {
      setConfirmBroadcast(true)
      return
    }

    setSending(true)
    setSendResult(null)
    const res = await api('/api/admin/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: mode === 'broadcast' ? 'all' : foundUser!.id,
        title: title.trim(),
        body: body.trim() || undefined,
        link: link.trim() || undefined,
        sendNotification,
        sendEmail: sendEmailFlag,
      }),
    })

    if (res.error) {
      setSendResult({ ok: false, message: res.error })
    } else {
      setSendResult({ ok: true, message: `Sent to ${res.recipientCount} user${res.recipientCount === 1 ? '' : 's'}` })
      setTitle('')
      setBody('')
      setLink('')
      setFoundUser(null)
      setEmailLookup('')
      setConfirmBroadcast(false)
      fetchHistory()
    }
    setSending(false)
  }

  return (
    <div>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.25rem' }}>Notifications</h2>

      {/* Compose */}
      <div style={cardStyle}>
        <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '1rem' }}>Compose Notification</h3>

        {/* Mode toggle */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <button
            style={{ ...btnPrimary, backgroundColor: mode === 'single' ? colors.primary : '#e2e8f0', color: mode === 'single' ? '#fff' : colors.text }}
            onClick={() => { setMode('single'); setConfirmBroadcast(false) }}
          >
            Single User
          </button>
          <button
            style={{ ...btnPrimary, backgroundColor: mode === 'broadcast' ? colors.warning : '#e2e8f0', color: mode === 'broadcast' ? '#fff' : colors.text }}
            onClick={() => { setMode('broadcast'); setConfirmBroadcast(false) }}
          >
            Broadcast
          </button>
        </div>

        {/* Broadcast warning */}
        {mode === 'broadcast' && (
          <div style={{ backgroundColor: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '0.5rem', padding: '0.75rem', marginBottom: '1rem', fontSize: '0.8125rem', color: '#9a3412' }}>
            Broadcasts go to all non-banned users. Rate limited to 2 per hour per admin.
          </div>
        )}

        {/* Single user lookup */}
        {mode === 'single' && (
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: colors.textMuted, display: 'block', marginBottom: '0.25rem' }}>Recipient</label>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input
                style={inputStyle}
                placeholder="Search by email or name..."
                value={emailLookup}
                onChange={e => { setEmailLookup(e.target.value); setFoundUser(null); setLookupError('') }}
                onKeyDown={e => e.key === 'Enter' && lookupUser()}
              />
              <button style={btnPrimary} onClick={lookupUser}>Look up</button>
            </div>
            {lookupError && <p style={{ color: colors.danger, fontSize: '0.75rem', margin: '0.25rem 0 0' }}>{lookupError}</p>}
            {foundUser && (
              <div style={{ marginTop: '0.5rem', fontSize: '0.8125rem', color: colors.success }}>
                Found: {foundUser.name || foundUser.email} ({foundUser.email})
              </div>
            )}
          </div>
        )}

        {/* Title */}
        <div style={{ marginBottom: '0.75rem' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: colors.textMuted, display: 'block', marginBottom: '0.25rem' }}>Title *</label>
          <input
            style={{ ...inputStyle, width: '100%' }}
            placeholder="Notification title"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
        </div>

        {/* Body */}
        <div style={{ marginBottom: '0.75rem' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: colors.textMuted, display: 'block', marginBottom: '0.25rem' }}>Body</label>
          <textarea
            style={{ ...inputStyle, width: '100%', minHeight: '80px', resize: 'vertical', fontFamily: 'inherit' }}
            placeholder="Optional message body..."
            value={body}
            onChange={e => setBody(e.target.value)}
          />
        </div>

        {/* Link */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: colors.textMuted, display: 'block', marginBottom: '0.25rem' }}>Link (optional)</label>
          <input
            style={{ ...inputStyle, width: '100%' }}
            placeholder="/path or https://..."
            value={link}
            onChange={e => setLink(e.target.value)}
          />
        </div>

        {/* Delivery method */}
        <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', cursor: 'pointer' }}>
            <input type="checkbox" checked={sendNotification} onChange={e => setSendNotification(e.target.checked)} />
            In-app notification
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', cursor: 'pointer' }}>
            <input type="checkbox" checked={sendEmailFlag} onChange={e => setSendEmailFlag(e.target.checked)} />
            Email
          </label>
        </div>

        {/* Send button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {mode === 'broadcast' && confirmBroadcast ? (
            <>
              <span style={{ fontSize: '0.8125rem', color: colors.warning, fontWeight: 600 }}>Are you sure? This will send to all users.</span>
              <button
                style={{ ...btnPrimary, backgroundColor: colors.warning }}
                onClick={handleSend}
                disabled={sending || !title.trim()}
              >
                {sending ? 'Sending...' : 'Confirm Broadcast'}
              </button>
              <button style={btnOutline} onClick={() => setConfirmBroadcast(false)}>Cancel</button>
            </>
          ) : (
            <button
              style={{ ...btnPrimary, backgroundColor: mode === 'broadcast' ? colors.warning : colors.primary }}
              onClick={handleSend}
              disabled={sending || !title.trim() || (mode === 'single' && !foundUser) || (!sendNotification && !sendEmailFlag)}
            >
              {sending ? 'Sending...' : mode === 'broadcast' ? 'Send Broadcast' : 'Send Notification'}
            </button>
          )}
          {sendResult && (
            <span style={{ fontSize: '0.8125rem', color: sendResult.ok ? colors.success : colors.danger }}>
              {sendResult.message}
            </span>
          )}
        </div>
      </div>

      {/* History */}
      <div style={{ ...cardStyle, marginTop: '1.5rem' }}>
        <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '1rem' }}>Notification History</h3>

        {historyLoading ? (
          <p style={{ color: colors.textLight, fontSize: '0.875rem' }}>Loading...</p>
        ) : history.length === 0 ? (
          <p style={{ color: colors.textLight, fontSize: '0.875rem' }}>No notifications sent yet.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={thStyle}>Date</th>
                  <th style={thStyle}>Title</th>
                  <th style={thStyle}>Recipient</th>
                  <th style={thStyle}>Method</th>
                  <th style={thStyle}>Count</th>
                  <th style={thStyle}>Sender</th>
                </tr>
              </thead>
              <tbody>
                {history.map(n => (
                  <tr key={n.id}>
                    <td style={tdStyle}>{formatDate(n.created_at)}</td>
                    <td style={{ ...tdStyle, maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.title}</td>
                    <td style={tdStyle}>
                      {n.recipient_id === null ? (
                        <span style={badge('#9a3412', '#ffedd5')}>Broadcast</span>
                      ) : (
                        <span style={{ fontSize: '0.8125rem' }}>{n.recipient?.name || n.recipient?.email || `User #${n.recipient_id}`}</span>
                      )}
                    </td>
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', gap: '0.25rem' }}>
                        {n.sent_notification && <span style={badge('#1e40af', '#dbeafe')}>In-app</span>}
                        {n.sent_email && <span style={badge('#166534', '#dcfce7')}>Email</span>}
                      </div>
                    </td>
                    <td style={tdStyle}>{n.recipient_count}</td>
                    <td style={tdStyle}>
                      <span style={{ fontSize: '0.8125rem' }}>{n.sender?.name || n.sender?.email || '—'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {historyTotalPages > 1 && (
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', justifyContent: 'center', marginTop: '1rem' }}>
            <button style={btnOutline} disabled={historyPage <= 1} onClick={() => setHistoryPage(p => p - 1)}>Prev</button>
            <span style={{ fontSize: '0.75rem', color: colors.textMuted }}>Page {historyPage} of {historyTotalPages}</span>
            <button style={btnOutline} disabled={historyPage >= historyTotalPages} onClick={() => setHistoryPage(p => p + 1)}>Next</button>
          </div>
        )}
      </div>
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
**Auth:** Email OTP + 4–10 digit PIN, cookie-based sessions (nyc_classifieds_user)
**Styling:** Inline styles (React.CSSProperties), color system based on Tailwind palette
**Cron:** Vercel cron jobs for automated seeding (every 15 min) and notification emails (daily)
**Email:** Resend — 24 transactional email templates (see Email System section)
**Notifications:** In-app notification center + bell icon in nav (see Notifications section)
**Content:** Porch (community) + Classifieds (listings) + Messages (DMs) + Notifications`,
    },
    {
      title: '2. Database Tables',
      content: `**Core tables:**
- **users** — id, email, name, pin (hashed), verified, role, banned, address, lat/lng, selfie_url, account_type, business_name, business_slug, business_category, website, phone, business_description, hours, service_area, photo_gallery
- **user_verification_codes** — OTP codes with 30-min expiry
- **listings** — title, description, price, category_slug, subcategory_slug, images[], status (active/sold/expired/removed), location, lat/lng, expires_at
- **messages** — listing_id, sender_id, recipient_id, content, read flag
- **blocked_users** — blocker_id, blocked_id (unique pair). Blocks messaging in both directions.
- **notifications** — user_id, type, title, body, link, read flag. Types: new_message, porch_reply, helpful_vote, listing_expiring, listing_expired, listing_removed, porch_post_removed, flag_resolved, account_banned, account_restored
- **flagged_content** — reporter_id, content_type (listing/user/message/porch_post/porch_reply), content_id, reason, status
- **audit_log** — actor, action, entity, entity_id, details (JSON), ip
- **categories** — name, slug, icon, subcategories (JSON), sort_order
- **neighborhoods** — name, slug, lat/lng, boundary

**Porch system:**
- **porch_posts** — user_id, post_type, title, body, borough_slug, neighborhood_slug, pinned, expires_at
- **porch_replies** — post_id, user_id, body, helpful_count
- **porch_helpful_votes** — reply_id, user_id (tracks who voted)

**Cron:**
- **cron_seed_state** — id (always 1), date, posts_today, replies_today, last_post_at, posts_by_user (JSONB), start_date, enabled

**Migrations:** supabase/migrations/ (001_schema, 002_admin_roles, 003_business_accounts, 004_porch, 005_ads, 006_blocked_users, 007_notifications)`,
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
3. All mutations logged via logAdminAction() to audit_log table

**Forgot PIN:** /forgot-pin page — email OTP verification, then set new PIN. Uses existing verify-otp (auto-login via cookie) + set-pin auth actions.`,
    },
    {
      title: '4. API Routes',
      content: `**Auth:**
| /api/auth | GET, POST | Auth status, login, OTP, PIN, set-name, set-account-type, set-business, set-address, logout |
| /api/auth/complete-signup | POST | Final account creation (upsert user, upload selfie, set cookie) |

**Content:**
| /api/listings | GET, POST | Browse/create listings (POST enforces posting gates) |
| /api/listings/[id] | GET, PATCH, DELETE | View/edit/delete listing (owner only for PATCH/DELETE) |
| /api/porch | GET, POST | Browse/create porch posts |
| /api/porch/[id] | GET, PATCH, DELETE | View/edit/delete porch post |
| /api/porch/[id]/replies | POST | Create reply on porch post |
| /api/porch/[id]/replies/[replyId]/helpful | POST | Vote reply as helpful |
| /api/search | GET | Global search |
| /api/flag | POST | Report content (listing/user/message/porch_post/porch_reply) |
| /api/upload | POST | Image upload |
| /api/geocode | GET | Geocode address |
| /api/business/[slug] | GET | Business profile page |
| /api/business/photos | POST | Business photo upload |

**Messaging:**
| /api/messages | GET, POST | Inbox threads (filters blocked users), send message (checks blocks) |
| /api/messages/[threadId] | GET, DELETE | View thread + mark read, delete entire conversation |
| /api/block | POST, DELETE | Block/unblock a user |
| /api/notifications | GET, PATCH | List notifications, mark as read (by IDs or "all") |

**Admin:**
| /api/admin/stats | GET | Dashboard stat counts (users, listings, messages, flags, porch) |
| /api/admin/users | GET, PATCH | List/search users, toggle verified, ban/unban, change role |
| /api/admin/listings | GET, PATCH, DELETE | List/search listings, change status, delete |
| /api/admin/porch | GET, PATCH, DELETE | List/search porch posts, pin/unpin, delete |
| /api/admin/messages | GET | View messages/threads |
| /api/admin/flagged | GET, PATCH, POST | Flagged content queue, take actions (remove, ban, dismiss) |
| /api/admin/audit | GET | Browse audit log |
| /api/admin/categories | GET, POST, PATCH, DELETE | CRUD categories |
| /api/admin/analytics | GET | Full analytics data (daily volumes, breakdowns, cron status) |

**Cron:**
| /api/cron/seed | GET | Automated content seeding (every 15 min, requires CRON_SECRET) |
| /api/cron/notifications | GET | Listing expiry emails + in-app notifications (daily at 9 AM ET) |`,
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
      title: '7. Messaging & Safety',
      content: `**Messaging flow:**
1. User clicks "Message Seller" on listing detail page
2. Message sent via POST /api/messages (rate limited: 30/min)
3. Recipient gets email notification + in-app notification
4. Inbox groups messages into threads by (listing_id, user_pair)
5. Opening a thread auto-marks unread messages as read

**Block system:**
- POST /api/block — block a user (stored in blocked_users table)
- DELETE /api/block — unblock
- Inbox hides threads with blocked users
- Sending messages checks both directions (can't message if either side blocked)
- "Message Seller" button still shows but send fails with clear error

**Thread actions (... menu in thread header):**
- Report — reason input, submits to /api/flag with content_type: 'message'
- Block User — confirmation dialog, blocks user, redirects to inbox
- Delete Conversation — confirmation dialog, hard-deletes all messages in thread

**Safety:**
- Can't message yourself
- Can't message on inactive listings
- Messages max 2000 characters
- Rate limited per IP`,
    },
    {
      title: '8. Notifications',
      content: `**In-app notification center** at /notifications, accessible via bell icon in nav header.

**Infrastructure:**
- notifications table — user_id, type, title, body, link, read, created_at
- lib/notifications.ts — createNotification() helper
- GET /api/notifications — list user's 50 most recent
- PATCH /api/notifications — mark as read (by IDs array or "all")

**Nav badge:** Bell icon shows red badge with unread notification count. Account avatar shows unread message count. Both fetched from GET /api/auth.

**10 notification types wired into trigger points:**

| Type | Trigger | Link |
|------|---------|------|
| new_message | Someone sends you a message | /messages/[threadId] |
| porch_reply | Someone replies to your porch post | /porch/post/[id]/[slug] |
| helpful_vote | Someone votes your reply helpful | /porch/post/[id]/[slug] |
| listing_expiring | Listing expires in 3 days (cron) | /listings/[cat]/[id] |
| listing_expired | Listing has expired (cron) | /account |
| listing_removed | Mod removed your listing | /account |
| porch_post_removed | Mod removed your porch post | /porch |
| flag_resolved | Your report was reviewed | /notifications |
| account_banned | Account suspended | — |
| account_restored | Account restored | — |

**Every notification also triggers the corresponding email** (24 total email templates in lib/email-templates.ts).`,
    },
    {
      title: '9. Posting Gates',
      content: `**Category-based posting requirements** enforced at POST /api/listings and shown in the post listing UI.

| Category | Requirements |
|----------|-------------|
| For Sale, Barter, Personals, Rentals, Tickets, Pets, Community, Resumes | Verified account |
| Services | Verified + business profile (account_type: 'business' + business_name set) |
| Jobs | Verified + business profile + business email (not gmail/yahoo/outlook/etc.) |
| Housing | Verified (ready for future doc upload gate) |

**Frontend behavior (PostListingClient.tsx):**
- Selecting a gated category shows a yellow warning banner explaining the requirement
- "Create Business Profile" links to /account
- Form fields hidden until requirements met
- Business email check uses a list of 10 common free email domains

**Location field:** Borough + Neighborhood cascading dropdowns (from lib/data.ts boroughs). Stored as "Neighborhood, Borough" string.`,
    },
    {
      title: '10. Automated Seeding',
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
      title: '11. Email System',
      content: `**Provider:** Resend (RESEND_API_KEY env var)
**From:** NYC Classifieds <noreply@nycclassifieds.com>
**Domain:** nycclassifieds.com must be verified in Resend

**24 email templates** in lib/email-templates.ts:

**Auth & Account:**
1. otpEmail — 6-digit OTP code (30-min expiry)
2. welcomeEmail — After signup completion
3. verificationSuccessEmail — After selfie verification
4. accountBannedEmail — When admin bans account
5. accountRestoredEmail — When admin unbans account
6. manuallyVerifiedEmail — When admin manually verifies
7. roleChangedEmail — When admin changes user role
8. businessProfileLiveEmail — When business profile is saved

**Listings:**
9. listingLiveEmail — After posting a listing
10. listingExpiringEmail — 3 days before expiry (cron)
11. listingExpiredEmail — When listing expires (cron)
12. listingRemovedEmail — When mod removes listing

**Messaging:**
13. newMessageEmail — When someone sends you a message

**Porch:**
14. porchReplyEmail — When someone replies to your post
15. helpfulVoteEmail — When someone votes your reply helpful
16. urgentPostLiveEmail — After posting a porch post
17. porchPostRemovedEmail — When mod removes your post

**Moderation:**
18. flagConfirmationEmail — Confirmation to reporter
19. flagResolvedEmail — When report is reviewed
20. moderatorAlertEmail — Alert to all mods on new flag

**Admin:**
21. adminNewSignupEmail — Alert admins of new signups
22. adminDailyDigestEmail — Daily stats digest (cron)

**Infrastructure:**
- lib/email.ts — sendEmail() wrapper around Resend
- Consistent branding: blue accent, clean layout, NYC Classifieds header
- All strings HTML-escaped via esc() to prevent XSS`,
    },
    {
      title: '12. SEO',
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
      title: '13. Environment Variables',
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
- NEXT_PUBLIC_SITE_URL — Base URL for email links (defaults to https://thenycclassifieds.com)

**Domain:** nycclassifieds.com must be verified in Resend for email delivery.`,
    },
    {
      title: '14. Audit Actions',
      content: `All admin mutations are logged to audit_log table with actor, action, entity, entity_id, details, and IP.

**User actions:**
admin_toggle_verified, admin_change_role, admin_ban_user, admin_unban_user

**Listing actions:**
admin_change_listing_status, admin_delete_listing, admin_remove_flagged_listing

**Porch actions:**
admin_pin_porch_post, admin_unpin_porch_post, admin_delete_porch_post

**Flag actions:**
admin_resolve_flag, admin_dismiss_flag

**Category actions:**
admin_create_category, admin_update_category, admin_delete_category

**User-generated:**
create_listing, create_porch_post, create_porch_reply`,
    },
    {
      title: '15. Key Files',
      content: `**Lib:**
- lib/admin-auth.ts — requireAdmin() + logAdminAction()
- lib/auth-utils.ts — signEmailToken(), hashPin()
- lib/supabase-server.ts — Supabase admin client singleton
- lib/supabase.ts — Supabase browser client
- lib/rate-limit.ts — In-memory rate limiter
- lib/email.ts — Centralized sendEmail() function
- lib/email-templates.ts — 24 HTML email templates
- lib/notifications.ts — createNotification() helper for in-app notifications
- lib/porch-moderation.ts — moderateContent() + moderateFields()
- lib/seed-templates.ts — Content templates (porch, listings, replies, demographics, geography)
- lib/seed-engine.ts — Cron seed logic (scheduling, tone profiles, kill switch)
- lib/seo.ts — SEO meta tag utilities
- lib/data.ts — Static data (categories, boroughs, neighborhoods, porch post types, business categories)
- lib/geocode.ts — Geocoding utilities

**App pages:**
- app/admin/ — Admin dashboard (8 tabs: Home, Users, Listings, Porch, Moderation, Analytics, Ads, Docs)
- app/(auth)/login/ — Login page (email + PIN)
- app/(auth)/signup/ — Multi-step signup (email > OTP > name > account type > business > PIN > address > selfie)
- app/(auth)/forgot-pin/ — PIN reset via email OTP (3 steps: email > code > new PIN)
- app/account/ — User profile dashboard (messages, listings with view/edit/share, porch posts)
- app/messages/ — Inbox + thread view (with block/report/delete actions)
- app/notifications/ — Notification center (list, mark read, mark all read)
- app/listings/new/ — Post listing form (with posting gates + borough/neighborhood dropdowns)
- app/listings/edit/[id]/ — Edit listing form (owner only)
- app/listings/[category]/[subcategory]/ — Listing detail + "Message Seller"
- app/porch/ — Community feed by neighborhood

**API routes:**
- app/api/auth/ — Auth endpoints (login, OTP, PIN, signup completion)
- app/api/listings/ — Listings CRUD + posting gates
- app/api/porch/ — Porch CRUD + replies + helpful votes
- app/api/messages/ — Messaging (inbox, threads, send, delete)
- app/api/block/ — Block/unblock users
- app/api/notifications/ — In-app notifications (list, mark read)
- app/api/flag/ — Report content
- app/api/admin/* — All admin API routes
- app/api/cron/seed/ — Automated seeding cron
- app/api/cron/notifications/ — Expiry notifications cron

**Config:**
- vercel.json — Cron schedules (seed every 15 min, notifications daily 9 AM ET)
- middleware.ts — Request middleware
- scripts/seed-platform.mjs — Initial bulk seeder (500 users, 1500 posts, 750 listings)
- supabase/migrations/ — 7 migration files (001-007)`,
    },
    {
      title: '16. User Flows',
      content: `**Signup:** Email > OTP > Account type (personal/business) > Name > [Business details] > PIN > Address > Selfie > Done
**Login:** Email + PIN > Dashboard
**Forgot PIN:** Email > OTP > New PIN > Auto-login to home
**Post listing:** Category > [posting gate check] > Title > Subcategory > Price > Description > Borough > Neighborhood > Photos > Submit
**Edit listing:** Account > Edit button > Edit form (title, subcategory, price, description, location, photos) > Save
**Send message:** Listing detail > "Message Seller" > Type message > Send (blocked if either side has blocked the other)
**Block user:** Thread view > ... menu > Block User > Confirm > Back to inbox
**Report:** Thread view > ... menu > Report > Enter reason > Submit
**Delete conversation:** Thread view > ... menu > Delete > Confirm > Back to inbox
**View notifications:** Bell icon in nav > /notifications page > Click to navigate, auto-marks read`,
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

// ─── Ads Tab ─────────────────────────────────────────────────

const AD_BOROUGHS = [
  { name: 'Manhattan', slug: 'manhattan', neighborhoods: ['Alphabet City','Battery Park City','Carnegie Hill','Chelsea','Chinatown','East Harlem','East Village','Financial District','Flatiron','Gramercy','Greenwich Village','Hamilton Heights','Harlem',"Hell's Kitchen",'Hudson Yards','Inwood','Kips Bay','Koreatown','Lenox Hill','Lincoln Square','Little Italy','Lower East Side','Manhattan Valley','Meatpacking District','Midtown East','Midtown West','Morningside Heights','Murray Hill','NoHo','Nolita','Roosevelt Island','SoHo','Stuyvesant Town','Sugar Hill','Times Square','Tribeca','Two Bridges','Upper East Side','Upper West Side','Washington Heights','West Village'] },
  { name: 'Brooklyn', slug: 'brooklyn', neighborhoods: ['Bay Ridge','Bed-Stuy','Bensonhurst','Boerum Hill','Borough Park','Brighton Beach','Brooklyn Heights','Brownsville','Bushwick','Canarsie','Carroll Gardens','Clinton Hill','Cobble Hill','Coney Island','Crown Heights','Downtown Brooklyn','DUMBO','Dyker Heights','East New York','Flatbush','Fort Greene','Greenpoint','Kensington','Midwood','Park Slope','Prospect Heights','Red Hook','Sheepshead Bay','Sunset Park','Williamsburg'] },
  { name: 'Queens', slug: 'queens', neighborhoods: ['Astoria','Bayside','Bellerose','Briarwood','College Point','Corona','Douglaston','Elmhurst','Far Rockaway','Flushing','Forest Hills','Fresh Meadows','Glen Oaks','Howard Beach','Jackson Heights','Jamaica','Kew Gardens','Little Neck','Long Island City','Maspeth','Middle Village','Ozone Park','Rego Park','Ridgewood','Rockaway Beach','St. Albans','Sunnyside','Whitestone','Woodhaven','Woodside'] },
  { name: 'The Bronx', slug: 'bronx', neighborhoods: ['Belmont','Concourse','Fordham','Highbridge','Hunts Point','Kingsbridge','Morris Park','Mott Haven','Norwood','Pelham Bay','Riverdale','South Bronx','Throgs Neck','Tremont','Wakefield'] },
  { name: 'Staten Island', slug: 'staten-island', neighborhoods: ['Annadale','Eltingville','Great Kills','Huguenot','New Dorp',"Prince's Bay",'St. George','Stapleton','Tompkinsville','Tottenville'] },
]

const AD_CATEGORIES = [
  { name: 'Housing', slug: 'housing' },
  { name: 'Jobs', slug: 'jobs' },
  { name: 'For Sale', slug: 'for-sale' },
  { name: 'Services', slug: 'services' },
  { name: 'Gigs', slug: 'gigs' },
  { name: 'Community', slug: 'community' },
  { name: 'Tickets & Events', slug: 'tickets' },
  { name: 'Pets', slug: 'pets' },
  { name: 'Personals', slug: 'personals' },
  { name: 'Barter', slug: 'barter' },
  { name: 'Rentals & Lending', slug: 'rentals' },
  { name: 'Resumes', slug: 'resumes' },
]

function nhSlug(name: string) {
  return name.toLowerCase().replace(/ /g, '-').replace(/'/g, '').replace(/\./g, '')
}

interface AdRow {
  id: number
  type: string
  advertiser: string
  image_url: string
  link_url: string
  category_slug: string | null
  borough_slug: string | null
  neighborhood_slug: string | null
  active: boolean
  starts_at: string
  expires_at: string
  created_at: string
}

function AdsTab() {
  const [ads, setAds] = useState<AdRow[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState('')
  const [filterActive, setFilterActive] = useState('')

  // Form state
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formType, setFormType] = useState<'homepage' | 'neighborhood' | 'borough' | 'all-nyc'>('homepage')
  const [formAdvertiser, setFormAdvertiser] = useState('')
  const [formImageUrl, setFormImageUrl] = useState('')
  const [formLinkUrl, setFormLinkUrl] = useState('')
  const [formCategory, setFormCategory] = useState('')
  const [formBorough, setFormBorough] = useState('')
  const [formNeighborhood, setFormNeighborhood] = useState('')
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)

  const limit = 50
  const totalPages = Math.ceil(total / limit)

  const fetchAds = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page) })
    if (filterType) params.set('type', filterType)
    if (filterActive) params.set('active', filterActive)
    const data = await api(`/api/admin/ads?${params}`)
    setAds(data.ads || [])
    setTotal(data.total || 0)
    setLoading(false)
  }, [page, filterType, filterActive])

  useEffect(() => { fetchAds() }, [fetchAds])

  const selectedBorough = AD_BOROUGHS.find(b => b.slug === formBorough)

  const resetForm = () => {
    setEditingId(null)
    setFormType('homepage')
    setFormAdvertiser('')
    setFormImageUrl('')
    setFormLinkUrl('')
    setFormCategory('')
    setFormBorough('')
    setFormNeighborhood('')
    setFormError('')
    setShowForm(false)
  }

  const startEdit = (ad: AdRow) => {
    setEditingId(ad.id)
    setFormType(ad.type as 'homepage' | 'neighborhood' | 'borough' | 'all-nyc')
    setFormAdvertiser(ad.advertiser)
    setFormImageUrl(ad.image_url)
    setFormLinkUrl(ad.link_url)
    setFormCategory(ad.category_slug || '')
    setFormBorough(ad.borough_slug || '')
    setFormNeighborhood(ad.neighborhood_slug || '')
    setFormError('')
    setShowForm(true)
  }

  const handleSave = async () => {
    setFormError('')
    if (!formAdvertiser.trim()) { setFormError('Advertiser name is required'); return }
    if (!formImageUrl.trim()) { setFormError('Image URL is required'); return }
    if (formType === 'neighborhood' && (!formCategory || !formBorough || !formNeighborhood)) {
      setFormError('Category, borough, and neighborhood are all required for neighborhood ads')
      return
    }
    if (formType === 'borough' && (!formCategory || !formBorough)) {
      setFormError('Category and borough are required for borough ads')
      return
    }
    if (formType === 'all-nyc' && !formCategory) {
      setFormError('Category is required for all-NYC ads')
      return
    }

    setSaving(true)
    const payload = {
      type: formType,
      advertiser: formAdvertiser.trim(),
      image_url: formImageUrl.trim(),
      link_url: formLinkUrl.trim(),
      category_slug: formType !== 'homepage' ? formCategory : null,
      borough_slug: (formType === 'neighborhood' || formType === 'borough') ? formBorough : null,
      neighborhood_slug: formType === 'neighborhood' ? formNeighborhood : null,
    }

    let res
    if (editingId) {
      res = await api('/api/admin/ads', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: editingId, ...payload }) })
    } else {
      res = await api('/api/admin/ads', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    }

    setSaving(false)
    if (res.error) { setFormError(res.error); return }
    resetForm()
    fetchAds()
  }

  const toggleActive = async (ad: AdRow) => {
    await api('/api/admin/ads', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: ad.id, active: !ad.active }) })
    fetchAds()
  }

  const deleteAd = async (ad: AdRow) => {
    if (!confirm(`Delete ad from "${ad.advertiser}"?`)) return
    await api('/api/admin/ads', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: ad.id }) })
    fetchAds()
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Ads</h2>
        <button style={btnPrimary} onClick={() => { resetForm(); setShowForm(true) }}>+ New Ad</button>
      </div>

      {/* Program overview */}
      <div style={{ ...cardStyle, marginBottom: '1rem', fontSize: '0.8125rem', color: colors.textMuted, lineHeight: 1.6 }}>
        <strong style={{ color: colors.text }}>Ad Program</strong>
        <div style={{ marginTop: '0.375rem' }}>
          <span style={badge('#7c3aed', '#ede9fe')}>Homepage</span>{' '}
          1 banner on the homepage — all visitors.
        </div>
        <div style={{ marginTop: '0.25rem' }}>
          <span style={badge('#059669', '#dcfce7')}>All NYC</span>{' '}
          1 ad per category — city-wide fallback when no borough or neighborhood ad exists.
        </div>
        <div style={{ marginTop: '0.25rem' }}>
          <span style={badge('#d97706', '#fff7ed')}>Borough</span>{' '}
          1 ad per category per borough — fallback when no neighborhood ad exists.
        </div>
        <div style={{ marginTop: '0.25rem' }}>
          <span style={badge(colors.primary, '#dbeafe')}>Neighborhood</span>{' '}
          1 ad per category per neighborhood — most specific, shown first.
        </div>
      </div>

      {/* Create / Edit form */}
      {showForm && (
        <div style={{ ...cardStyle, marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, margin: 0 }}>
              {editingId ? 'Edit Ad' : 'New Ad'}
            </h3>
            <button style={{ ...btnOutline, fontSize: '0.6875rem' }} onClick={resetForm}>Cancel</button>
          </div>

          {/* Type toggle */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            {([
              { key: 'homepage', label: 'Homepage' },
              { key: 'all-nyc', label: 'All NYC' },
              { key: 'borough', label: 'Borough' },
              { key: 'neighborhood', label: 'Neighborhood' },
            ] as const).map(t => (
              <button
                key={t.key}
                onClick={() => setFormType(t.key)}
                style={{
                  padding: '0.375rem 1rem',
                  borderRadius: '0.375rem',
                  border: `1px solid ${formType === t.key ? colors.primary : colors.border}`,
                  backgroundColor: formType === t.key ? colors.primary : colors.bgWhite,
                  color: formType === t.key ? '#fff' : colors.text,
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Fields */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: colors.textMuted, display: 'block', marginBottom: '0.25rem' }}>Advertiser</label>
              <input style={{ ...inputStyle, width: '100%' }} value={formAdvertiser} onChange={e => setFormAdvertiser(e.target.value)} placeholder="Business name" />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: colors.textMuted, display: 'block', marginBottom: '0.25rem' }}>Link URL</label>
              <input style={{ ...inputStyle, width: '100%' }} value={formLinkUrl} onChange={e => setFormLinkUrl(e.target.value)} placeholder="https://..." />
            </div>
          </div>

          <div style={{ marginBottom: '0.75rem' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: colors.textMuted, display: 'block', marginBottom: '0.25rem' }}>Image URL</label>
            <input style={{ ...inputStyle, width: '100%' }} value={formImageUrl} onChange={e => setFormImageUrl(e.target.value)} placeholder="https://...image.jpg" />
          </div>

          {formImageUrl && (
            <div style={{ marginBottom: '0.75rem', padding: '0.5rem', border: `1px solid ${colors.border}`, borderRadius: '0.5rem', backgroundColor: colors.bg }}>
              <div style={{ fontSize: '0.6875rem', color: colors.textLight, marginBottom: '0.375rem' }}>Preview</div>
              <img src={formImageUrl} alt="Ad preview" style={{ maxWidth: '100%', maxHeight: '120px', borderRadius: '0.375rem', objectFit: 'contain' }} />
            </div>
          )}

          {/* Category targeting */}
          {/* Targeting fields — shown based on type */}
          {formType !== 'homepage' && (
            <div style={{ display: 'grid', gridTemplateColumns: formType === 'all-nyc' ? '1fr' : formType === 'borough' ? '1fr 1fr' : '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: colors.textMuted, display: 'block', marginBottom: '0.25rem' }}>Category</label>
                <select style={{ ...selectStyle, width: '100%' }} value={formCategory} onChange={e => setFormCategory(e.target.value)}>
                  <option value="">Select...</option>
                  {AD_CATEGORIES.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
                </select>
              </div>
              {(formType === 'borough' || formType === 'neighborhood') && (
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: colors.textMuted, display: 'block', marginBottom: '0.25rem' }}>Borough</label>
                  <select style={{ ...selectStyle, width: '100%' }} value={formBorough} onChange={e => { setFormBorough(e.target.value); setFormNeighborhood('') }}>
                    <option value="">Select...</option>
                    {AD_BOROUGHS.map(b => <option key={b.slug} value={b.slug}>{b.name}</option>)}
                  </select>
                </div>
              )}
              {formType === 'neighborhood' && (
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: colors.textMuted, display: 'block', marginBottom: '0.25rem' }}>Neighborhood</label>
                  <select style={{ ...selectStyle, width: '100%' }} value={formNeighborhood} onChange={e => setFormNeighborhood(e.target.value)} disabled={!formBorough}>
                    <option value="">Select...</option>
                    {selectedBorough?.neighborhoods.map(n => <option key={n} value={nhSlug(n)}>{n}</option>)}
                  </select>
                </div>
              )}
            </div>
          )}

          {formError && (
            <div style={{ fontSize: '0.8125rem', color: colors.danger, marginBottom: '0.75rem' }}>{formError}</div>
          )}

          <button style={{ ...btnPrimary, padding: '0.5rem 1.5rem', fontSize: '0.8125rem' }} onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : editingId ? 'Update Ad' : 'Create Ad'}
          </button>
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', alignItems: 'center' }}>
        <select style={selectStyle} value={filterType} onChange={e => { setFilterType(e.target.value); setPage(1) }}>
          <option value="">All types</option>
          <option value="homepage">Homepage</option>
          <option value="all-nyc">All NYC</option>
          <option value="borough">Borough</option>
          <option value="neighborhood">Neighborhood</option>
        </select>
        <select style={selectStyle} value={filterActive} onChange={e => { setFilterActive(e.target.value); setPage(1) }}>
          <option value="">All status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
        <span style={{ fontSize: '0.75rem', color: colors.textLight }}>{total} ad{total !== 1 ? 's' : ''}</span>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ color: colors.textMuted, fontSize: '0.875rem' }}>Loading...</div>
      ) : ads.length === 0 ? (
        <div style={{ ...cardStyle, textAlign: 'center', color: colors.textMuted, padding: '2rem', fontSize: '0.875rem' }}>
          No ads yet. Click &quot;+ New Ad&quot; to create one.
        </div>
      ) : (
        <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={thStyle}>Type</th>
                <th style={thStyle}>Advertiser</th>
                <th style={thStyle}>Slot</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Expires</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {ads.map(ad => {
                const expired = new Date(ad.expires_at) < new Date()
                const catName = AD_CATEGORIES.find(c => c.slug === ad.category_slug)?.name
                const borName = AD_BOROUGHS.find(b => b.slug === ad.borough_slug)?.name

                return (
                  <tr key={ad.id}>
                    <td style={tdStyle}>
                      {ad.type === 'homepage' && <span style={badge('#7c3aed', '#ede9fe')}>Homepage</span>}
                      {ad.type === 'all-nyc' && <span style={badge('#059669', '#dcfce7')}>All NYC</span>}
                      {ad.type === 'borough' && <span style={badge('#d97706', '#fff7ed')}>Borough</span>}
                      {ad.type === 'neighborhood' && <span style={badge(colors.primary, '#dbeafe')}>Neighborhood</span>}
                    </td>
                    <td style={tdStyle}>
                      <div style={{ fontWeight: 500 }}>{ad.advertiser}</div>
                      {ad.image_url && (
                        <img src={ad.image_url} alt="" style={{ maxWidth: '80px', maxHeight: '32px', marginTop: '2px', borderRadius: '3px', objectFit: 'contain' }} />
                      )}
                    </td>
                    <td style={{ ...tdStyle, fontSize: '0.8125rem' }}>
                      {ad.type === 'homepage' && <span style={{ color: colors.textMuted }}>Homepage banner</span>}
                      {ad.type === 'all-nyc' && <span>{catName} &middot; All NYC</span>}
                      {ad.type === 'borough' && <span>{catName} &middot; {borName}</span>}
                      {ad.type === 'neighborhood' && <span>{catName} &middot; {borName} &middot; {ad.neighborhood_slug}</span>}
                    </td>
                    <td style={tdStyle}>
                      {expired
                        ? <span style={badge(colors.warning, '#fff7ed')}>Expired</span>
                        : ad.active
                          ? <span style={badge(colors.success, '#dcfce7')}>Active</span>
                          : <span style={badge(colors.textLight, '#f1f5f9')}>Inactive</span>
                      }
                    </td>
                    <td style={{ ...tdStyle, fontSize: '0.8125rem', color: colors.textMuted }}>
                      {formatDate(ad.expires_at)}
                    </td>
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', gap: '0.375rem' }}>
                        <button style={btnOutline} onClick={() => startEdit(ad)}>Edit</button>
                        <button style={btnOutline} onClick={() => toggleActive(ad)}>
                          {ad.active ? 'Pause' : 'Activate'}
                        </button>
                        <button style={btnDanger} onClick={() => deleteAd(ad)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', justifyContent: 'center', marginTop: '1rem' }}>
          <button style={btnOutline} disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Prev</button>
          <span style={{ fontSize: '0.75rem', color: colors.textMuted }}>Page {page} of {totalPages}</span>
          <button style={btnOutline} disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
        </div>
      )}
    </div>
  )
}

// ─── Feedback Tab ────────────────────────────────────────────
interface FeedbackItem {
  id: number
  user_id: number | null
  email: string | null
  category: string
  message: string
  page_url: string | null
  status: string
  admin_reply: string | null
  replied_at: string | null
  created_at: string
  user: { id: number; email: string; name: string | null } | null
  replier: { id: number; email: string; name: string | null } | null
}

const feedbackStatusColors: Record<string, { color: string; bg: string }> = {
  new: { color: '#2563eb', bg: '#eff6ff' },
  read: { color: '#475569', bg: '#f1f5f9' },
  in_progress: { color: '#ea580c', bg: '#fff7ed' },
  resolved: { color: '#16a34a', bg: '#f0fdf4' },
  dismissed: { color: '#94a3b8', bg: '#f8fafc' },
}

const categoryColors: Record<string, { color: string; bg: string }> = {
  bug: { color: '#dc2626', bg: '#fef2f2' },
  feature: { color: '#7c3aed', bg: '#f5f3ff' },
  general: { color: '#2563eb', bg: '#eff6ff' },
  other: { color: '#475569', bg: '#f1f5f9' },
}

function FeedbackTab() {
  const [items, setItems] = useState<FeedbackItem[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('new')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [replyingId, setReplyingId] = useState<number | null>(null)
  const [replyText, setReplyText] = useState('')
  const [sendingReply, setSendingReply] = useState(false)

  const limit = 50
  const totalPages = Math.ceil(total / limit)

  const fetchFeedback = useCallback(async () => {
    setLoading(true)
    try {
      const data = await api(`/api/admin/feedback?status=${statusFilter}&page=${page}`)
      setItems(data.items || [])
      setTotal(data.total || 0)
    } catch {}
    setLoading(false)
  }, [statusFilter, page])

  useEffect(() => { fetchFeedback() }, [fetchFeedback])

  const updateStatus = async (id: number, status: string) => {
    await api('/api/admin/feedback', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
    fetchFeedback()
  }

  const sendReply = async (id: number) => {
    if (!replyText.trim()) return
    setSendingReply(true)
    await api('/api/admin/feedback', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, reply: replyText.trim() }),
    })
    setReplyingId(null)
    setReplyText('')
    setSendingReply(false)
    fetchFeedback()
  }

  const statusFilters: { key: string; label: string }[] = [
    { key: 'new', label: 'New' },
    { key: 'read', label: 'Read' },
    { key: 'in_progress', label: 'In Progress' },
    { key: 'resolved', label: 'Resolved' },
    { key: 'dismissed', label: 'Dismissed' },
  ]

  return (
    <div>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>Feedback</h2>

      {/* Status filter */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {statusFilters.map(s => (
          <button
            key={s.key}
            onClick={() => { setStatusFilter(s.key); setPage(1) }}
            style={{
              padding: '0.375rem 0.75rem',
              borderRadius: '9999px',
              border: statusFilter === s.key ? '2px solid #2563eb' : '1px solid #e2e8f0',
              backgroundColor: statusFilter === s.key ? '#eff6ff' : '#fff',
              color: statusFilter === s.key ? '#2563eb' : '#475569',
              fontSize: '0.75rem',
              fontWeight: statusFilter === s.key ? 600 : 400,
              cursor: 'pointer',
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ color: colors.textLight }}>Loading...</p>
      ) : items.length === 0 ? (
        <div style={{ ...cardStyle, textAlign: 'center', padding: '2rem', color: colors.textMuted }}>
          No {statusFilter} feedback.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {items.map(item => {
            const sc = feedbackStatusColors[item.status] || feedbackStatusColors.new
            const cc = categoryColors[item.category] || categoryColors.other
            const submitter = item.user?.name || item.user?.email || item.email || 'Anonymous'
            const hasEmail = !!(item.user?.email || item.email)

            return (
              <div key={item.id} style={cardStyle}>
                {/* Top row: category + status + date */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                  <span style={badge(cc.color, cc.bg)}>{item.category}</span>
                  <span style={badge(sc.color, sc.bg)}>{item.status.replace('_', ' ')}</span>
                  <span style={{ fontSize: '0.75rem', color: colors.textLight, marginLeft: 'auto' }}>
                    {formatDate(item.created_at)}
                  </span>
                </div>

                {/* Submitter + page */}
                <div style={{ fontSize: '0.8125rem', color: colors.textMuted, marginBottom: '0.5rem' }}>
                  From: <strong>{submitter}</strong>
                  {item.page_url && (
                    <span> &middot; <a href={item.page_url} target="_blank" rel="noopener noreferrer" style={{ color: colors.primary, fontSize: '0.75rem' }}>{item.page_url}</a></span>
                  )}
                </div>

                {/* Message */}
                <p style={{ fontSize: '0.875rem', color: colors.text, lineHeight: 1.5, margin: '0 0 0.75rem', whiteSpace: 'pre-wrap' }}>
                  {item.message}
                </p>

                {/* Existing reply */}
                {item.admin_reply && (
                  <div style={{ background: '#f0fdf4', borderRadius: '0.5rem', padding: '0.75rem', marginBottom: '0.75rem', borderLeft: '3px solid #16a34a' }}>
                    <div style={{ fontSize: '0.6875rem', color: '#16a34a', fontWeight: 600, marginBottom: '4px' }}>
                      Reply by {item.replier?.name || item.replier?.email || 'Admin'} &middot; {item.replied_at ? formatDate(item.replied_at) : ''}
                    </div>
                    <p style={{ fontSize: '0.8125rem', color: colors.text, margin: 0, whiteSpace: 'pre-wrap' }}>{item.admin_reply}</p>
                  </div>
                )}

                {/* Reply form */}
                {replyingId === item.id && (
                  <div style={{ marginBottom: '0.75rem' }}>
                    {!hasEmail && (
                      <p style={{ fontSize: '0.75rem', color: colors.warning, margin: '0 0 0.5rem' }}>
                        No email on file &mdash; user won&apos;t be notified.
                      </p>
                    )}
                    <textarea
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                      placeholder="Type your reply..."
                      rows={3}
                      style={{
                        width: '100%',
                        padding: '0.5rem 0.75rem',
                        borderRadius: '0.5rem',
                        border: `1px solid ${colors.border}`,
                        fontSize: '0.8125rem',
                        resize: 'vertical',
                        outline: 'none',
                        fontFamily: 'inherit',
                        boxSizing: 'border-box',
                        marginBottom: '0.5rem',
                      }}
                    />
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button style={btnPrimary} disabled={sendingReply || !replyText.trim()} onClick={() => sendReply(item.id)}>
                        {sendingReply ? 'Sending...' : 'Send Reply'}
                      </button>
                      <button style={btnOutline} onClick={() => { setReplyingId(null); setReplyText('') }}>Cancel</button>
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                  {item.status === 'new' && (
                    <button style={btnOutline} onClick={() => updateStatus(item.id, 'read')}>Mark Read</button>
                  )}
                  {(item.status === 'new' || item.status === 'read') && (
                    <button style={{ ...btnOutline, color: colors.warning }} onClick={() => updateStatus(item.id, 'in_progress')}>In Progress</button>
                  )}
                  {!item.admin_reply && replyingId !== item.id && (
                    <button style={btnPrimary} onClick={() => { setReplyingId(item.id); setReplyText('') }}>Reply</button>
                  )}
                  {item.status !== 'resolved' && (
                    <button style={{ ...btnOutline, color: colors.success }} onClick={() => updateStatus(item.id, 'resolved')}>Resolve</button>
                  )}
                  {item.status !== 'dismissed' && (
                    <button style={{ ...btnOutline, color: colors.textLight }} onClick={() => updateStatus(item.id, 'dismissed')}>Dismiss</button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', justifyContent: 'center', marginTop: '1rem' }}>
          <button style={btnOutline} disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Prev</button>
          <span style={{ fontSize: '0.75rem', color: colors.textMuted }}>Page {page} of {totalPages}</span>
          <button style={btnOutline} disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
        </div>
      )}
    </div>
  )
}

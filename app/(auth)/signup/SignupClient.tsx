'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import SelfieVerification from '@/app/components/SelfieVerification'
import { boroughs, businessCategories } from '@/lib/data'

type Step = 'email' | 'otp' | 'type' | 'name' | 'business' | 'pin' | 'address' | 'selfie' | 'done'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const

type Hours = Record<string, { open: string; close: string; closed: boolean }>

function defaultHours(): Hours {
  const h: Hours = {}
  for (const d of DAYS) {
    h[d] = { open: '09:00', close: '17:00', closed: d === 'Sun' }
  }
  return h
}

// Flatten all neighborhoods with borough prefix for the service area picker
const allNeighborhoods = boroughs.flatMap(b =>
  b.neighborhoods.map(n => ({ label: `${n}, ${b.name}`, value: n }))
)

export default function SignupClient() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [accountType, setAccountType] = useState<'personal' | 'business'>('personal')
  const [name, setName] = useState('')
  // Business fields
  const [businessName, setBusinessName] = useState('')
  const [businessCategory, setBusinessCategory] = useState('')
  const [website, setWebsite] = useState('')
  const [phone, setPhone] = useState('')
  const [businessDesc, setBusinessDesc] = useState('')
  const [hours, setHours] = useState<Hours>(defaultHours)
  const [serviceArea, setServiceArea] = useState<string[]>([])
  const [areaSearch, setAreaSearch] = useState('')
  // Auth fields
  const [pin, setPin] = useState('')
  const [pinConfirm, setPinConfirm] = useState('')
  const [address, setAddress] = useState('')
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [userId, setUserId] = useState<string>('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const isBusiness = accountType === 'business'

  const api = async (body: Record<string, unknown>) => {
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Something went wrong')
      return data
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Something went wrong'
      setError(msg)
      return null
    } finally {
      setLoading(false)
    }
  }

  const handleSendOtp = async () => {
    const data = await api({ action: 'send-otp', email })
    if (data?.sent) setStep('otp')
  }

  const handleVerifyOtp = async () => {
    const data = await api({ action: 'verify-otp', email, code: otp })
    if (data?.verified) {
      setUserId(String(data.userId))
      if (data.hasPin) {
        router.push('/')
      } else {
        setStep('type')
      }
    }
  }

  const handleSetType = async (type: 'personal' | 'business') => {
    setAccountType(type)
    const data = await api({ action: 'set-account-type', account_type: type })
    if (data?.accountTypeSet) setStep('name')
  }

  const handleSetName = async () => {
    const data = await api({ action: 'set-name', name })
    if (data?.nameSet) {
      setStep(isBusiness ? 'business' : 'pin')
    }
  }

  const handleSetBusiness = async () => {
    if (!businessName.trim()) {
      setError('Business name required')
      return
    }
    if (!businessCategory) {
      setError('Pick a category')
      return
    }
    const data = await api({
      action: 'set-business',
      business_name: businessName,
      business_category: businessCategory,
      website,
      phone,
      business_description: businessDesc,
      hours,
      service_area: serviceArea,
    })
    if (data?.businessSet) setStep('pin')
  }

  const handleSetPin = async () => {
    if (pin !== pinConfirm) { setError('PINs do not match'); return }
    if (!/^\d{4}$/.test(pin)) { setError('PIN must be exactly 4 digits'); return }
    const data = await api({ action: 'set-pin', userId, pin })
    if (data?.pinSet) setStep('address')
  }

  const handleSetAddress = async () => {
    if (!address.trim()) { setError('Enter your address'); return }
    setLoading(true)
    setError('')
    try {
      const geoRes = await fetch('/api/geocode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address }),
      })
      const geoData = await geoRes.json()
      if (!geoRes.ok) throw new Error(geoData.error || 'Could not find address')
      setCoords({ lat: geoData.lat, lng: geoData.lng })
      const saveData = await api({ action: 'set-address', address, lat: geoData.lat, lng: geoData.lng })
      if (saveData?.addressSet) setStep('selfie')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Address lookup failed')
    } finally {
      setLoading(false)
    }
  }

  const handleVerified = () => {
    setStep('done')
    setTimeout(() => router.push('/'), 2000)
  }

  const toggleArea = (n: string) => {
    setServiceArea(prev => prev.includes(n) ? prev.filter(x => x !== n) : [...prev, n])
  }

  const updateHour = (day: string, field: 'open' | 'close' | 'closed', val: string | boolean) => {
    setHours(prev => ({
      ...prev,
      [day]: { ...prev[day], [field]: val },
    }))
  }

  const filteredNeighborhoods = areaSearch
    ? allNeighborhoods.filter(n => n.label.toLowerCase().includes(areaSearch.toLowerCase()))
    : allNeighborhoods

  // Dynamic progress steps
  const visibleSteps: Step[] = isBusiness
    ? ['email', 'otp', 'type', 'name', 'business', 'pin', 'address', 'selfie']
    : ['email', 'otp', 'type', 'name', 'pin', 'address', 'selfie']

  const stepLabels: Record<Step, string> = {
    email: 'Email', otp: 'Verify', type: 'Type', name: 'Name',
    business: 'Business', pin: 'PIN', address: 'Address', selfie: 'Selfie', done: 'Done',
  }

  const currentIdx = visibleSteps.indexOf(step)

  return (
    <main style={{ maxWidth: '480px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Progress */}
      {step !== 'done' && (
        <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '2rem' }}>
          {visibleSteps.map((s, i) => (
            <div key={s} style={{ flex: 1 }}>
              <div style={{
                height: '4px', borderRadius: '2px',
                backgroundColor: i <= currentIdx ? '#2563eb' : '#e2e8f0',
                transition: 'background-color 0.2s',
              }} />
              <div style={{
                fontSize: '0.7rem',
                color: i <= currentIdx ? '#2563eb' : '#94a3b8',
                marginTop: '0.25rem', textAlign: 'center',
              }}>
                {stepLabels[s]}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Email ── */}
      {step === 'email' && (
        <div>
          <h1 style={h1Style}>Create your account</h1>
          <p style={descStyle}>Enter your email to get started.</p>
          <input type="email" placeholder="you@example.com" value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSendOtp()}
            style={inputStyle} />
          {error && <p style={errorStyle}>{error}</p>}
          <button onClick={handleSendOtp} disabled={loading || !email} style={btnStyle}>
            {loading ? 'Sending...' : 'Send Verification Code'}
          </button>
          <p style={{ textAlign: 'center', marginTop: '1rem', color: '#64748b', fontSize: '0.875rem' }}>
            Already have an account? <a href="/login" style={{ color: '#2563eb', fontWeight: 500 }}>Log in</a>
          </p>
        </div>
      )}

      {/* ── OTP ── */}
      {step === 'otp' && (
        <div>
          <h1 style={h1Style}>Check your email</h1>
          <p style={descStyle}>We sent a 6-digit code to <strong>{email}</strong></p>
          <input type="text" inputMode="numeric" maxLength={6} placeholder="000000" value={otp}
            onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
            onKeyDown={e => e.key === 'Enter' && handleVerifyOtp()}
            style={{ ...inputStyle, textAlign: 'center', letterSpacing: '0.25em', fontSize: '1.5rem' }} />
          {error && <p style={errorStyle}>{error}</p>}
          <button onClick={handleVerifyOtp} disabled={loading || otp.length !== 6} style={btnStyle}>
            {loading ? 'Verifying...' : 'Verify Code'}
          </button>
          <button onClick={() => { setOtp(''); handleSendOtp() }} style={linkBtnStyle}>Resend code</button>
        </div>
      )}

      {/* ── Account Type ── */}
      {step === 'type' && (
        <div>
          <h1 style={h1Style}>Are you a person or a business?</h1>
          <p style={descStyle}>Businesses get a free profile page to promote to the neighborhood.</p>
          <button onClick={() => handleSetType('personal')} disabled={loading} style={{ ...typeCardStyle, borderColor: '#e2e8f0' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.25rem' }}>Person</div>
            <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
              Post listings, message sellers, join the community.
            </div>
          </button>
          <button onClick={() => handleSetType('business')} disabled={loading}
            style={{ ...typeCardStyle, borderColor: '#2563eb', backgroundColor: '#eff6ff' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.25rem' }}>Business</div>
            <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
              Get a free business profile page with your website, hours, photos, and services — visible to all NYC users. Required to post in Services.
            </div>
          </button>
          {error && <p style={errorStyle}>{error}</p>}
        </div>
      )}

      {/* ── Name ── */}
      {step === 'name' && (
        <div>
          <h1 style={h1Style}>{isBusiness ? 'Your name' : 'What\u2019s your name?'}</h1>
          <p style={descStyle}>{isBusiness ? 'The contact person for this business.' : 'This is shown on your listings.'}</p>
          <input type="text" placeholder="Your name" value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSetName()}
            style={inputStyle} />
          {error && <p style={errorStyle}>{error}</p>}
          <button onClick={handleSetName} disabled={loading || !name.trim()} style={btnStyle}>
            {loading ? 'Saving...' : 'Continue'}
          </button>
        </div>
      )}

      {/* ── Business Details ── */}
      {step === 'business' && (
        <div>
          <h1 style={h1Style}>Your business profile</h1>
          <p style={descStyle}>This becomes your free business page on NYC Classifieds. Promote to your whole neighborhood.</p>

          {/* Business Name */}
          <label style={labelStyle}>Business name *</label>
          <input type="text" placeholder="Joe's Plumbing" value={businessName}
            onChange={e => setBusinessName(e.target.value)} style={inputStyle} />

          {/* Category */}
          <label style={labelStyle}>Category *</label>
          <select value={businessCategory} onChange={e => setBusinessCategory(e.target.value)}
            style={{ ...inputStyle, backgroundColor: '#fff' }}>
            <option value="">Select a category...</option>
            {businessCategories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          {/* Description */}
          <label style={labelStyle}>Tell NYC about your business</label>
          <textarea placeholder="What do you do? What makes you different?" value={businessDesc}
            onChange={e => setBusinessDesc(e.target.value)} rows={3}
            style={{ ...inputStyle, resize: 'vertical' }} />

          {/* Website */}
          <label style={labelStyle}>Website</label>
          <input type="url" placeholder="https://yourbusiness.com" value={website}
            onChange={e => setWebsite(e.target.value)} style={inputStyle} />

          {/* Phone */}
          <label style={labelStyle}>Phone number</label>
          <input type="tel" placeholder="(212) 555-1234" value={phone}
            onChange={e => setPhone(e.target.value)} style={inputStyle} />

          {/* Hours */}
          <label style={labelStyle}>Hours of operation</label>
          <div style={{ marginBottom: '1rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem', overflow: 'hidden' }}>
            {DAYS.map(day => (
              <div key={day} style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.5rem 0.75rem',
                borderBottom: day !== 'Sun' ? '1px solid #f1f5f9' : 'none',
                backgroundColor: hours[day].closed ? '#f8fafc' : '#fff',
              }}>
                <span style={{ width: '2.5rem', fontSize: '0.8125rem', fontWeight: 600, color: '#374151' }}>{day}</span>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: '#64748b', cursor: 'pointer' }}>
                  <input type="checkbox" checked={hours[day].closed}
                    onChange={e => updateHour(day, 'closed', e.target.checked)} />
                  Closed
                </label>
                {!hours[day].closed && (
                  <>
                    <input type="time" value={hours[day].open}
                      onChange={e => updateHour(day, 'open', e.target.value)}
                      style={timeInputStyle} />
                    <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>to</span>
                    <input type="time" value={hours[day].close}
                      onChange={e => updateHour(day, 'close', e.target.value)}
                      style={timeInputStyle} />
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Service Area */}
          <label style={labelStyle}>Service area — which neighborhoods do you serve?</label>
          <input type="text" placeholder="Search neighborhoods..." value={areaSearch}
            onChange={e => setAreaSearch(e.target.value)}
            style={{ ...inputStyle, marginBottom: '0.5rem' }} />
          {serviceArea.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginBottom: '0.5rem' }}>
              {serviceArea.map(n => (
                <span key={n} onClick={() => toggleArea(n)} style={{
                  padding: '0.25rem 0.5rem', borderRadius: '1rem', fontSize: '0.75rem',
                  backgroundColor: '#2563eb', color: '#fff', cursor: 'pointer', fontWeight: 500,
                }}>
                  {n} &times;
                </span>
              ))}
            </div>
          )}
          <div style={{
            maxHeight: '160px', overflowY: 'auto', border: '1px solid #e2e8f0',
            borderRadius: '0.5rem', marginBottom: '1rem',
          }}>
            {filteredNeighborhoods.map(n => (
              <div key={n.label} onClick={() => toggleArea(n.value)} style={{
                padding: '0.375rem 0.75rem', fontSize: '0.8125rem', cursor: 'pointer',
                backgroundColor: serviceArea.includes(n.value) ? '#eff6ff' : '#fff',
                color: serviceArea.includes(n.value) ? '#2563eb' : '#374151',
                borderBottom: '1px solid #f1f5f9',
              }}>
                {n.label}
              </div>
            ))}
          </div>

          {error && <p style={errorStyle}>{error}</p>}
          <button onClick={handleSetBusiness} disabled={loading || !businessName.trim() || !businessCategory} style={btnStyle}>
            {loading ? 'Saving...' : 'Continue'}
          </button>
          <p style={{ fontSize: '0.75rem', color: '#94a3b8', textAlign: 'center', marginTop: '0.75rem' }}>
            You can add photos after signup from your profile.
          </p>
        </div>
      )}

      {/* ── PIN ── */}
      {step === 'pin' && (
        <div>
          <h1 style={h1Style}>Set a 4-digit PIN</h1>
          <p style={descStyle}>You&apos;ll use this to log in quickly.</p>
          <input type="password" inputMode="numeric" maxLength={4} placeholder="PIN" value={pin}
            onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
            style={{ ...inputStyle, marginBottom: '0.75rem' }} />
          <input type="password" inputMode="numeric" maxLength={4} placeholder="Confirm PIN" value={pinConfirm}
            onChange={e => setPinConfirm(e.target.value.replace(/\D/g, ''))}
            onKeyDown={e => e.key === 'Enter' && handleSetPin()}
            style={inputStyle} />
          {error && <p style={errorStyle}>{error}</p>}
          <button onClick={handleSetPin} disabled={loading || pin.length !== 4} style={btnStyle}>
            {loading ? 'Setting...' : 'Set PIN'}
          </button>
        </div>
      )}

      {/* ── Address ── */}
      {step === 'address' && (
        <div>
          <h1 style={h1Style}>{isBusiness ? 'Business address' : 'Your address'}</h1>
          <p style={descStyle}>
            {isBusiness
              ? 'We verify your business is at this location. Your neighborhood is shown publicly.'
              : 'We verify you live in NYC. Your exact address is never shown publicly.'}
          </p>
          <input type="text" placeholder={isBusiness ? '123 Broadway, New York, NY' : '123 Main St, New York, NY'}
            value={address} onChange={e => setAddress(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSetAddress()} style={inputStyle} />
          {error && <p style={errorStyle}>{error}</p>}
          <button onClick={handleSetAddress} disabled={loading || !address.trim()} style={btnStyle}>
            {loading ? 'Looking up...' : 'Verify Address'}
          </button>
        </div>
      )}

      {/* ── Selfie ── */}
      {step === 'selfie' && coords && (
        <div>
          <h1 style={h1Style}>{isBusiness ? 'Verify your location' : 'Take a selfie'}</h1>
          <p style={descStyle}>
            {isBusiness
              ? <>Take a photo at your business. This becomes your profile photo. You must be at <strong>{address}</strong> right now.</>
              : <>This becomes your profile photo. You must be at <strong>{address}</strong> right now — we verify your exact location.</>}
          </p>
          <SelfieVerification onVerified={handleVerified} />
        </div>
      )}

      {/* ── Done ── */}
      {step === 'done' && (
        <div style={{ textAlign: 'center', padding: '3rem 0' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>&#10003;</div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#16a34a', marginBottom: '0.5rem' }}>
            You&apos;re verified!
          </h1>
          <p style={{ color: '#64748b' }}>
            {isBusiness
              ? 'Your business profile is live. Redirecting...'
              : 'Redirecting you to the homepage...'}
          </p>
        </div>
      )}
    </main>
  )
}

const h1Style: React.CSSProperties = { fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }
const descStyle: React.CSSProperties = { color: '#64748b', marginBottom: '1.5rem' }
const labelStyle: React.CSSProperties = { display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#374151', marginBottom: '0.375rem' }

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '0.75rem 1rem', borderRadius: '0.5rem',
  border: '1px solid #e2e8f0', fontSize: '1rem', outline: 'none',
  marginBottom: '1rem', fontFamily: "'DM Sans', sans-serif",
}

const timeInputStyle: React.CSSProperties = {
  padding: '0.25rem 0.375rem', borderRadius: '0.25rem', border: '1px solid #e2e8f0',
  fontSize: '0.8125rem', outline: 'none', fontFamily: "'DM Sans', sans-serif",
}

const btnStyle: React.CSSProperties = {
  width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: 'none',
  backgroundColor: '#2563eb', color: '#fff', fontSize: '1rem', fontWeight: 600, cursor: 'pointer',
}

const errorStyle: React.CSSProperties = { color: '#dc2626', fontSize: '0.875rem', marginBottom: '0.75rem' }

const linkBtnStyle: React.CSSProperties = {
  display: 'block', width: '100%', textAlign: 'center', background: 'none',
  border: 'none', color: '#2563eb', fontSize: '0.875rem', cursor: 'pointer',
  marginTop: '0.75rem', padding: '0.5rem',
}

const typeCardStyle: React.CSSProperties = {
  width: '100%', padding: '1.25rem', borderRadius: '0.75rem', border: '2px solid',
  backgroundColor: '#fff', cursor: 'pointer', textAlign: 'left', marginBottom: '0.75rem',
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import SelfieVerification from '@/app/components/SelfieVerification'

type Step = 'email' | 'otp' | 'name' | 'pin' | 'address' | 'selfie' | 'done'

export default function SignupClient() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [name, setName] = useState('')
  const [pin, setPin] = useState('')
  const [pinConfirm, setPinConfirm] = useState('')
  const [address, setAddress] = useState('')
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [userId, setUserId] = useState<string>('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

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
        // Existing user doing OTP login
        router.push('/')
      } else {
        setStep('name')
      }
    }
  }

  const handleSetName = async () => {
    const data = await api({ action: 'set-name', name })
    if (data?.nameSet) setStep('pin')
  }

  const handleSetPin = async () => {
    if (pin !== pinConfirm) {
      setError('PINs do not match')
      return
    }
    if (!/^\d{4}$/.test(pin)) {
      setError('PIN must be exactly 4 digits')
      return
    }
    const data = await api({ action: 'set-pin', userId, pin })
    if (data?.pinSet) setStep('address')
  }

  const handleSetAddress = async () => {
    if (!address.trim()) {
      setError('Enter your address')
      return
    }

    setLoading(true)
    setError('')
    try {
      // Geocode the address
      const geoRes = await fetch('/api/geocode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address }),
      })
      const geoData = await geoRes.json()
      if (!geoRes.ok) throw new Error(geoData.error || 'Could not find address')

      setCoords({ lat: geoData.lat, lng: geoData.lng })

      // Save to user
      const saveData = await api({
        action: 'set-address',
        address,
        lat: geoData.lat,
        lng: geoData.lng,
      })
      if (saveData?.addressSet) setStep('selfie')
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Address lookup failed'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleVerified = () => {
    setStep('done')
    setTimeout(() => router.push('/'), 2000)
  }

  const stepLabels: Record<Step, string> = {
    email: 'Email',
    otp: 'Verify',
    name: 'Name',
    pin: 'PIN',
    address: 'Address',
    selfie: 'Selfie',
    done: 'Done',
  }

  const steps: Step[] = ['email', 'otp', 'name', 'pin', 'address', 'selfie', 'done']
  const currentIdx = steps.indexOf(step)

  return (
    <main style={{ maxWidth: '480px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Progress */}
      <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '2rem' }}>
        {steps.slice(0, -1).map((s, i) => (
          <div key={s} style={{ flex: 1 }}>
            <div style={{
              height: '4px',
              borderRadius: '2px',
              backgroundColor: i <= currentIdx ? '#2563eb' : '#e2e8f0',
              transition: 'background-color 0.2s',
            }} />
            <div style={{
              fontSize: '0.7rem',
              color: i <= currentIdx ? '#2563eb' : '#94a3b8',
              marginTop: '0.25rem',
              textAlign: 'center',
            }}>
              {stepLabels[s]}
            </div>
          </div>
        ))}
      </div>

      {step === 'email' && (
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Create your account</h1>
          <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>Enter your email to get started.</p>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSendOtp()}
            style={inputStyle}
          />
          {error && <p style={errorStyle}>{error}</p>}
          <button onClick={handleSendOtp} disabled={loading || !email} style={btnStyle}>
            {loading ? 'Sending...' : 'Send Verification Code'}
          </button>
          <p style={{ textAlign: 'center', marginTop: '1rem', color: '#64748b', fontSize: '0.875rem' }}>
            Already have an account?{' '}
            <a href="/login" style={{ color: '#2563eb', fontWeight: 500 }}>Log in</a>
          </p>
        </div>
      )}

      {step === 'otp' && (
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Check your email</h1>
          <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>We sent a 6-digit code to <strong>{email}</strong></p>
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="000000"
            value={otp}
            onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
            onKeyDown={e => e.key === 'Enter' && handleVerifyOtp()}
            style={{ ...inputStyle, textAlign: 'center', letterSpacing: '0.25em', fontSize: '1.5rem' }}
          />
          {error && <p style={errorStyle}>{error}</p>}
          <button onClick={handleVerifyOtp} disabled={loading || otp.length !== 6} style={btnStyle}>
            {loading ? 'Verifying...' : 'Verify Code'}
          </button>
          <button onClick={() => { setOtp(''); handleSendOtp() }} style={linkBtnStyle}>
            Resend code
          </button>
        </div>
      )}

      {step === 'name' && (
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>What&apos;s your name?</h1>
          <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>This is shown on your listings.</p>
          <input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSetName()}
            style={inputStyle}
          />
          {error && <p style={errorStyle}>{error}</p>}
          <button onClick={handleSetName} disabled={loading || !name.trim()} style={btnStyle}>
            {loading ? 'Saving...' : 'Continue'}
          </button>
        </div>
      )}

      {step === 'pin' && (
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Set a 4-digit PIN</h1>
          <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>You&apos;ll use this to log in quickly.</p>
          <input
            type="password"
            inputMode="numeric"
            maxLength={4}
            placeholder="PIN"
            value={pin}
            onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
            style={{ ...inputStyle, marginBottom: '0.75rem' }}
          />
          <input
            type="password"
            inputMode="numeric"
            maxLength={4}
            placeholder="Confirm PIN"
            value={pinConfirm}
            onChange={e => setPinConfirm(e.target.value.replace(/\D/g, ''))}
            onKeyDown={e => e.key === 'Enter' && handleSetPin()}
            style={inputStyle}
          />
          {error && <p style={errorStyle}>{error}</p>}
          <button onClick={handleSetPin} disabled={loading || pin.length !== 4} style={btnStyle}>
            {loading ? 'Setting...' : 'Set PIN'}
          </button>
        </div>
      )}

      {step === 'address' && (
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Your address</h1>
          <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>We verify you live in NYC. Your exact address is never shown publicly.</p>
          <input
            type="text"
            placeholder="123 Main St, New York, NY"
            value={address}
            onChange={e => setAddress(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSetAddress()}
            style={inputStyle}
          />
          {error && <p style={errorStyle}>{error}</p>}
          <button onClick={handleSetAddress} disabled={loading || !address.trim()} style={btnStyle}>
            {loading ? 'Looking up...' : 'Verify Address'}
          </button>
        </div>
      )}

      {step === 'selfie' && coords && (
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Take a selfie</h1>
          <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
            We&apos;ll capture your photo and location to verify you&apos;re at your address. Make sure you&apos;re near <strong>{address}</strong>.
          </p>
          <SelfieVerification onVerified={handleVerified} />
        </div>
      )}

      {step === 'done' && (
        <div style={{ textAlign: 'center', padding: '3rem 0' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>&#10003;</div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#16a34a', marginBottom: '0.5rem' }}>
            You&apos;re verified!
          </h1>
          <p style={{ color: '#64748b' }}>Redirecting you to the homepage...</p>
        </div>
      )}
    </main>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.75rem 1rem',
  borderRadius: '0.5rem',
  border: '1px solid #e2e8f0',
  fontSize: '1rem',
  outline: 'none',
  marginBottom: '1rem',
}

const btnStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.75rem',
  borderRadius: '0.5rem',
  border: 'none',
  backgroundColor: '#2563eb',
  color: '#fff',
  fontSize: '1rem',
  fontWeight: 600,
  cursor: 'pointer',
}

const errorStyle: React.CSSProperties = {
  color: '#dc2626',
  fontSize: '0.875rem',
  marginBottom: '0.75rem',
}

const linkBtnStyle: React.CSSProperties = {
  display: 'block',
  width: '100%',
  textAlign: 'center',
  background: 'none',
  border: 'none',
  color: '#2563eb',
  fontSize: '0.875rem',
  cursor: 'pointer',
  marginTop: '0.75rem',
  padding: '0.5rem',
}

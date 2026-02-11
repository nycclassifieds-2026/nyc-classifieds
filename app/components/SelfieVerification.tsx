'use client'

import { useState, useRef, useCallback } from 'react'

interface Props {
  onVerified: () => void
  /** When provided, parent handles the upload. Receives (blob, geoCoords). */
  onSubmit?: (blob: Blob, geoCoords: { lat: number; lon: number }) => Promise<void>
}

export default function SelfieVerification({ onVerified, onSubmit }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [streaming, setStreaming] = useState(false)
  const [captured, setCaptured] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [geoCoords, setGeoCoords] = useState<{ lat: number; lon: number } | null>(null)

  const startCamera = useCallback(async () => {
    setError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
        setStreaming(true)
      }

      // Get geolocation simultaneously
      navigator.geolocation.getCurrentPosition(
        pos => setGeoCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
        () => setError('Location access denied. Please enable location services.'),
        { enableHighAccuracy: true, timeout: 15000 }
      )
    } catch {
      setError('Camera access denied. Please enable camera permissions.')
    }
  }, [])

  const capture = () => {
    if (!videoRef.current || !canvasRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = videoRef.current.videoWidth
    canvas.height = videoRef.current.videoHeight
    ctx.drawImage(videoRef.current, 0, 0)
    setCaptured(true)

    // Stop camera
    const stream = videoRef.current.srcObject as MediaStream
    stream?.getTracks().forEach(t => t.stop())
  }

  const retake = () => {
    setCaptured(false)
    startCamera()
  }

  const submit = async () => {
    if (!canvasRef.current || !geoCoords) {
      setError('Waiting for location...')
      return
    }

    setUploading(true)
    setError('')

    try {
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvasRef.current!.toBlob(
          b => (b ? resolve(b) : reject(new Error('Failed to capture image'))),
          'image/jpeg',
          0.85
        )
      })

      if (onSubmit) {
        // Parent handles the full submission (used by signup flow)
        await onSubmit(blob, geoCoords)
        onVerified()
      } else {
        // Default: call verify-location directly (used by re-verification)
        const formData = new FormData()
        formData.append('selfie', blob, 'selfie.jpg')
        formData.append('lat', String(geoCoords.lat))
        formData.append('lon', String(geoCoords.lon))

        const res = await fetch('/api/auth/verify-location', {
          method: 'POST',
          body: formData,
        })

        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Verification failed')

        onVerified()
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Verification failed'
      setError(msg)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      {!streaming && !captured && (
        <button onClick={startCamera} style={{
          width: '100%',
          padding: '1rem',
          borderRadius: '0.75rem',
          border: '2px dashed #e2e8f0',
          backgroundColor: '#f8fafc',
          cursor: 'pointer',
          color: '#475569',
          fontSize: '1rem',
        }}>
          Open Camera
        </button>
      )}

      <video
        ref={videoRef}
        style={{
          width: '100%',
          borderRadius: '0.75rem',
          display: streaming && !captured ? 'block' : 'none',
          backgroundColor: '#000',
        }}
        playsInline
        muted
      />

      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          borderRadius: '0.75rem',
          display: captured ? 'block' : 'none',
        }}
      />

      {streaming && !captured && (
        <button onClick={capture} style={{
          width: '100%',
          padding: '0.75rem',
          borderRadius: '0.5rem',
          border: 'none',
          backgroundColor: '#2563eb',
          color: '#fff',
          fontSize: '1rem',
          fontWeight: 600,
          cursor: 'pointer',
          marginTop: '1rem',
        }}>
          Capture Photo
        </button>
      )}

      {captured && (
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
          <button onClick={retake} style={{
            flex: 1,
            padding: '0.75rem',
            borderRadius: '0.5rem',
            border: '1px solid #e2e8f0',
            backgroundColor: '#fff',
            color: '#475569',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}>
            Retake
          </button>
          <button onClick={submit} disabled={uploading || !geoCoords} style={{
            flex: 2,
            padding: '0.75rem',
            borderRadius: '0.5rem',
            border: 'none',
            backgroundColor: '#16a34a',
            color: '#fff',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}>
            {uploading ? 'Verifying...' : !geoCoords ? 'Getting location...' : 'Verify & Submit'}
          </button>
        </div>
      )}

      {geoCoords && streaming && (
        <p style={{ fontSize: '0.75rem', color: '#16a34a', marginTop: '0.5rem', textAlign: 'center' }}>
          Location acquired
        </p>
      )}

      {error && (
        <p style={{ color: '#dc2626', fontSize: '0.875rem', marginTop: '0.75rem' }}>{error}</p>
      )}
    </div>
  )
}

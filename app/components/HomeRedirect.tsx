'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function HomeRedirect() {
  const router = useRouter()

  useEffect(() => {
    const home = localStorage.getItem('home')
    if (home) router.replace(`/${home}`)
  }, [router])

  return null
}

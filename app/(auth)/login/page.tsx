import type { Metadata } from 'next'
import LoginClient from './LoginClient'

export const metadata: Metadata = {
  title: 'Log In',
  description: 'Log in to NYC Classifieds',
}

export default function LoginPage() {
  return <LoginClient />
}

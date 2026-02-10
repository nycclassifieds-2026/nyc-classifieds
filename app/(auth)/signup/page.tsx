import type { Metadata } from 'next'
import SignupClient from './SignupClient'

export const metadata: Metadata = {
  title: 'Sign Up',
  description: 'Create a verified NYC Classifieds account',
}

export default function SignupPage() {
  return <SignupClient />
}

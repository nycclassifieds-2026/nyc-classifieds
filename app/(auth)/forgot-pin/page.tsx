import type { Metadata } from 'next'
import ForgotPinClient from './ForgotPinClient'

export const metadata: Metadata = {
  title: 'Reset PIN',
  description: 'Reset your NYC Classifieds PIN via email verification',
}

export default function ForgotPinPage() {
  return <ForgotPinClient />
}

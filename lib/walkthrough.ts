export interface WalkthroughStep {
  id: number
  target: string            // data-walkthrough attribute value
  title: string
  body: string
  advanceOn: 'event' | 'manual'
  event?: string            // CustomEvent name (when advanceOn === 'event')
  buttonLabel?: string      // label for manual advance button
  placement: 'bottom' | 'top' | 'right' | 'left'
}

export const STEPS: WalkthroughStep[] = [
  {
    id: 1,
    target: 'borough-nav',
    title: 'Welcome to The NYC Classifieds',
    body: "We're setting up your home base. First, pick your borough — we'll show you classifieds from your neighborhood.",
    advanceOn: 'event',
    event: 'walkthrough:borough-expanded',
    placement: 'bottom',
  },
  {
    id: 2,
    target: 'neighborhood-list',
    title: 'Now pick your neighborhood',
    body: "This is how we keep things local. You'll see listings from real people nearby.",
    advanceOn: 'event',
    event: 'walkthrough:neighborhood-clicked',
    placement: 'bottom',
  },
  {
    id: 3,
    target: 'save-confirm',
    title: 'Save it as home',
    body: "Tap Yes and we'll remember your neighborhood so you always land in the right spot.",
    advanceOn: 'event',
    event: 'walkthrough:home-saved',
    placement: 'bottom',
  },
  {
    id: 4,
    target: 'porch-tab',
    title: 'Meet The Porch',
    body: 'Local tips, neighborhood guides, and community conversation — all written by your neighbors.',
    advanceOn: 'manual',
    buttonLabel: 'Next',
    placement: 'bottom',
  },
  {
    id: 5,
    target: 'post-button',
    title: 'Post something',
    body: "It's free. You'll verify with a quick selfie so everyone knows you're real. That's what makes this different.",
    advanceOn: 'manual',
    buttonLabel: 'Got it',
    placement: 'bottom',
  },
]

// ---- localStorage helpers ----

const KEY_STEP = 'walkthrough_step'
const KEY_VISITS = 'walkthrough_visit_count'
const KEY_DISMISSED = 'walkthrough_dismissed'
const MAX_VISITS = 3

export function getStep(): number {
  return parseInt(localStorage.getItem(KEY_STEP) || '1', 10)
}

export function setStep(step: number) {
  localStorage.setItem(KEY_STEP, String(step))
}

export function isDismissed(): boolean {
  return localStorage.getItem(KEY_DISMISSED) === 'true'
}

export function dismiss() {
  localStorage.setItem(KEY_DISMISSED, 'true')
}

export function incrementVisit(): number {
  const count = parseInt(localStorage.getItem(KEY_VISITS) || '0', 10) + 1
  localStorage.setItem(KEY_VISITS, String(count))
  return count
}

export function shouldShow(): boolean {
  if (isDismissed()) return false
  const visits = parseInt(localStorage.getItem(KEY_VISITS) || '0', 10)
  return visits <= MAX_VISITS
}

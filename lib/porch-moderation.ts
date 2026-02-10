/**
 * Content moderation for Porch posts and replies.
 *
 * - BLOCKED content is rejected outright.
 * - FLAGGED content is allowed but marked for review.
 */

const CURSE_WORDS = ['shit', 'fuck', 'ass', 'damn', 'bitch', 'crap', 'hell']
const POLITICAL_KEYWORDS = [
  'trump', 'biden', 'democrat', 'republican',
  'liberal', 'conservative', 'election', 'maga',
]
const NEGATIVE_KEYWORDS = [
  'hate', 'terrible', 'worst', 'disgusting', 'stupid',
]

function buildWordBoundaryRegex(words: string[]): RegExp {
  // Match whole words, case-insensitive
  return new RegExp(`\\b(${words.join('|')})\\b`, 'i')
}

const curseRegex = buildWordBoundaryRegex(CURSE_WORDS)
const politicalRegex = buildWordBoundaryRegex(POLITICAL_KEYWORDS)
const negativeRegex = buildWordBoundaryRegex(NEGATIVE_KEYWORDS)
const urlRegex = /https?:\/\//i

function isExcessiveUppercase(text: string): boolean {
  if (text.length <= 10) return false
  const alphaChars = text.replace(/[^a-zA-Z]/g, '')
  if (alphaChars.length === 0) return false
  const upperCount = alphaChars.replace(/[^A-Z]/g, '').length
  return upperCount / alphaChars.length > 0.5
}

export interface ModerationResult {
  blocked: boolean
  flagged: boolean
  reason?: string
}

/**
 * Moderate a piece of text content. Checks for block-worthy and flag-worthy
 * patterns. Call once per field (title, body) and merge results.
 */
export function moderateContent(text: string): ModerationResult {
  // --- Block checks ---
  if (isExcessiveUppercase(text)) {
    return { blocked: true, flagged: false, reason: 'Excessive uppercase' }
  }

  if (urlRegex.test(text)) {
    return { blocked: true, flagged: false, reason: 'External URLs are not allowed' }
  }

  if (curseRegex.test(text)) {
    return { blocked: true, flagged: false, reason: 'Inappropriate language' }
  }

  // --- Flag checks ---
  if (politicalRegex.test(text)) {
    return { blocked: false, flagged: true, reason: 'Political content' }
  }

  if (negativeRegex.test(text)) {
    return { blocked: false, flagged: true, reason: 'Negative sentiment' }
  }

  return { blocked: false, flagged: false }
}

/**
 * Moderate multiple text fields and return the most severe result.
 * If any field is blocked, the combined result is blocked.
 * If any field is flagged, the combined result is flagged.
 */
export function moderateFields(...texts: string[]): ModerationResult {
  let flagged = false
  let flagReason: string | undefined

  for (const text of texts) {
    const result = moderateContent(text)
    if (result.blocked) {
      return result
    }
    if (result.flagged) {
      flagged = true
      flagReason = result.reason
    }
  }

  if (flagged) {
    return { blocked: false, flagged: true, reason: flagReason }
  }

  return { blocked: false, flagged: false }
}

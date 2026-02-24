const HEADER = `<h1 style="font-size: 1.5rem; font-weight: 700; color: #0f172a; margin-bottom: 0.5rem;">The NYC Classifieds</h1>`
const WRAPPER_START = `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 2rem;">`
const WRAPPER_END = `</div>`
const FOOTER = `<p style="color: #94a3b8; font-size: 0.75rem; margin-top: 2rem; border-top: 1px solid #e2e8f0; padding-top: 1rem;">The NYC Classifieds &mdash; Free. Real. Local. Verified.</p>`
const BUTTON = (href: string, text: string) =>
  `<a href="${href}" style="display: inline-block; background: #2563eb; color: #fff; padding: 0.75rem 1.5rem; border-radius: 0.5rem; text-decoration: none; font-weight: 600; font-size: 0.875rem; margin-top: 1rem;">${text}</a>`

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://thenycclassifieds.com'

/** Escape HTML special characters to prevent XSS in emails */
function esc(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'post'
}

export function otpEmail(code: string): { subject: string; html: string } {
  return {
    subject: `${code} — Your NYC Classifieds verification code`,
    html: `
      ${WRAPPER_START}
        ${HEADER}
        <p style="color: #475569; margin-bottom: 1.5rem;">Enter this code to verify your email:</p>
        <div style="background: #f1f5f9; border-radius: 0.75rem; padding: 1.5rem; text-align: center; margin-bottom: 1.5rem;">
          <span style="font-size: 2rem; font-weight: 700; letter-spacing: 0.25em; color: #0f172a;">${code}</span>
        </div>
        <p style="color: #94a3b8; font-size: 0.875rem;">This code expires in 15 minutes. If you didn't request this, you can ignore this email.</p>
        ${FOOTER}
      ${WRAPPER_END}
    `,
  }
}

export function welcomeEmail(name: string, neighborhood: string): { subject: string; html: string } {
  const n = esc(name), nh = esc(neighborhood)
  return {
    subject: `Welcome to The NYC Classifieds, ${n}!`,
    html: `
      ${WRAPPER_START}
        ${HEADER}
        <p style="color: #475569; font-size: 1rem; margin-bottom: 1rem;">Welcome to the neighborhood, <strong>${n}</strong>!</p>
        <p style="color: #475569; font-size: 0.875rem; margin-bottom: 1rem;">
          You're verified${nh ? ` in <strong>${nh}</strong>` : ''}. Here's what you can do now:
        </p>
        <ul style="color: #475569; font-size: 0.875rem; line-height: 1.8; padding-left: 1.25rem;">
          <li>Post on the Porch &mdash; share recommendations, ask questions, post alerts</li>
          <li>List items for sale, housing, services, jobs, and more</li>
          <li>Message other verified neighbors directly</li>
          <li>Browse your neighborhood feed</li>
        </ul>
        ${BUTTON(BASE_URL, 'Start Browsing')}
        ${FOOTER}
      ${WRAPPER_END}
    `,
  }
}

export function newMessageEmail(
  recipientName: string,
  senderName: string,
  listingTitle: string,
): { subject: string; html: string } {
  const rn = esc(recipientName), sn = esc(senderName), lt = esc(listingTitle)
  return {
    subject: `${sn} sent you a message about "${lt}"`,
    html: `
      ${WRAPPER_START}
        ${HEADER}
        <p style="color: #475569; font-size: 0.875rem;">Hi ${rn},</p>
        <p style="color: #475569; font-size: 0.875rem; margin-bottom: 1rem;">
          <strong>${sn}</strong> sent you a message about <strong>"${lt}"</strong>.
        </p>
        <div style="background: #f1f5f9; border-radius: 0.75rem; padding: 1rem; margin-bottom: 1rem;">
          <p style="color: #475569; font-size: 0.875rem; margin: 0;">Log in to read and reply to your message.</p>
        </div>
        ${BUTTON(`${BASE_URL}/messages`, 'View Messages')}
        ${FOOTER}
      ${WRAPPER_END}
    `,
  }
}

export function listingExpiringEmail(
  name: string,
  listingTitle: string,
  listingId: number,
  categorySlug?: string,
): { subject: string; html: string } {
  const n = esc(name), lt = esc(listingTitle)
  const listingUrl = categorySlug
    ? `${BASE_URL}/listings/${categorySlug}/${listingId}`
    : `${BASE_URL}/listings/for-sale/${listingId}`
  return {
    subject: `Your listing "${lt}" expires in 3 days`,
    html: `
      ${WRAPPER_START}
        ${HEADER}
        <p style="color: #475569; font-size: 0.875rem;">Hi ${n},</p>
        <p style="color: #475569; font-size: 0.875rem; margin-bottom: 1rem;">
          Your listing <strong>"${lt}"</strong> expires in 3 days. Renew it to keep it active and visible to your neighbors.
        </p>
        ${BUTTON(listingUrl, 'View Listing')}
        ${FOOTER}
      ${WRAPPER_END}
    `,
  }
}

export function listingExpiredEmail(
  name: string,
  listingTitle: string,
): { subject: string; html: string } {
  const n = esc(name), lt = esc(listingTitle)
  return {
    subject: `Your listing "${lt}" has expired`,
    html: `
      ${WRAPPER_START}
        ${HEADER}
        <p style="color: #475569; font-size: 0.875rem;">Hi ${n},</p>
        <p style="color: #475569; font-size: 0.875rem; margin-bottom: 1rem;">
          Your listing <strong>"${lt}"</strong> has expired. Repost it to keep it visible to the community.
        </p>
        ${BUTTON(`${BASE_URL}/listings/new`, 'Repost Listing')}
        ${FOOTER}
      ${WRAPPER_END}
    `,
  }
}

export function porchReplyEmail(
  recipientName: string,
  replierName: string,
  postTitle: string,
  postId: number,
): { subject: string; html: string } {
  const rn = esc(recipientName), rln = esc(replierName), pt = esc(postTitle)
  return {
    subject: `${rln} replied to your post "${pt}"`,
    html: `
      ${WRAPPER_START}
        ${HEADER}
        <p style="color: #475569; font-size: 0.875rem;">Hi ${rn},</p>
        <p style="color: #475569; font-size: 0.875rem; margin-bottom: 1rem;">
          <strong>${rln}</strong> replied to your Porch post <strong>"${pt}"</strong>.
        </p>
        ${BUTTON(`${BASE_URL}/porch/post/${postId}/${slugify(postTitle)}`, 'View Post')}
        ${FOOTER}
      ${WRAPPER_END}
    `,
  }
}

export function verificationSuccessEmail(
  name: string,
  neighborhood: string,
): { subject: string; html: string } {
  const n = esc(name), nh = esc(neighborhood)
  return {
    subject: `You're verified! Welcome to ${nh || 'your neighborhood'}`,
    html: `
      ${WRAPPER_START}
        ${HEADER}
        <p style="color: #475569; font-size: 1rem; margin-bottom: 1rem;">Congrats, <strong>${n}</strong>!</p>
        <p style="color: #475569; font-size: 0.875rem; margin-bottom: 1rem;">
          Your location has been verified${nh ? ` in <strong>${nh}</strong>` : ''}. You now have full access to The NYC Classifieds.
        </p>
        <ul style="color: #475569; font-size: 0.875rem; line-height: 1.8; padding-left: 1.25rem;">
          <li>Post on the Porch &mdash; share recommendations, ask questions, post alerts</li>
          <li>List items for sale, housing, services, jobs, and more</li>
          <li>Message other verified neighbors directly</li>
        </ul>
        ${BUTTON(BASE_URL, 'Start Browsing')}
        ${FOOTER}
      ${WRAPPER_END}
    `,
  }
}

export function accountBannedEmail(name: string): { subject: string; html: string } {
  const n = esc(name)
  return {
    subject: 'Your account has been suspended',
    html: `
      ${WRAPPER_START}
        ${HEADER}
        <p style="color: #475569; font-size: 0.875rem;">Hi ${n},</p>
        <p style="color: #475569; font-size: 0.875rem; margin-bottom: 1rem;">
          Your account has been suspended for violating our community guidelines. Your listings and posts are no longer visible.
        </p>
        <p style="color: #475569; font-size: 0.875rem;">
          If you believe this was a mistake, reply to this email.
        </p>
        ${FOOTER}
      ${WRAPPER_END}
    `,
  }
}

export function accountRestoredEmail(name: string): { subject: string; html: string } {
  const n = esc(name)
  return {
    subject: 'Your account has been restored',
    html: `
      ${WRAPPER_START}
        ${HEADER}
        <p style="color: #475569; font-size: 0.875rem;">Hi ${n},</p>
        <p style="color: #475569; font-size: 0.875rem; margin-bottom: 1rem;">
          Good news &mdash; your account has been restored. You can log in and use The NYC Classifieds again.
        </p>
        ${BUTTON(BASE_URL, 'Log In')}
        ${FOOTER}
      ${WRAPPER_END}
    `,
  }
}

export function manuallyVerifiedEmail(name: string): { subject: string; html: string } {
  const n = esc(name)
  return {
    subject: 'Your account has been verified',
    html: `
      ${WRAPPER_START}
        ${HEADER}
        <p style="color: #475569; font-size: 0.875rem;">Hi ${n},</p>
        <p style="color: #475569; font-size: 0.875rem; margin-bottom: 1rem;">
          An admin has verified your account. You now have full access to post, list, and message on The NYC Classifieds.
        </p>
        ${BUTTON(BASE_URL, 'Start Browsing')}
        ${FOOTER}
      ${WRAPPER_END}
    `,
  }
}

export function roleChangedEmail(
  name: string,
  newRole: string,
): { subject: string; html: string } {
  const n = esc(name), nr = esc(newRole)
  return {
    subject: `Your role has been updated to ${nr}`,
    html: `
      ${WRAPPER_START}
        ${HEADER}
        <p style="color: #475569; font-size: 0.875rem;">Hi ${n},</p>
        <p style="color: #475569; font-size: 0.875rem; margin-bottom: 1rem;">
          Your account role has been updated to <strong>${nr}</strong>.
        </p>
        ${newRole === 'moderator' || newRole === 'admin' ? `<p style="color: #475569; font-size: 0.875rem; margin-bottom: 1rem;">You can now access the admin dashboard to help manage the community.</p>` : ''}
        ${BUTTON(BASE_URL, 'Go to NYC Classifieds')}
        ${FOOTER}
      ${WRAPPER_END}
    `,
  }
}

export function listingRemovedEmail(
  name: string,
  listingTitle: string,
): { subject: string; html: string } {
  const n = esc(name), lt = esc(listingTitle)
  return {
    subject: `Your listing "${lt}" has been removed`,
    html: `
      ${WRAPPER_START}
        ${HEADER}
        <p style="color: #475569; font-size: 0.875rem;">Hi ${n},</p>
        <p style="color: #475569; font-size: 0.875rem; margin-bottom: 1rem;">
          Your listing <strong>"${lt}"</strong> has been removed by a moderator for violating community guidelines.
        </p>
        <p style="color: #475569; font-size: 0.875rem;">
          If you believe this was a mistake, reply to this email.
        </p>
        ${FOOTER}
      ${WRAPPER_END}
    `,
  }
}

export function porchPostRemovedEmail(
  name: string,
  postTitle: string,
): { subject: string; html: string } {
  const n = esc(name), pt = esc(postTitle)
  return {
    subject: `Your Porch post "${pt}" has been removed`,
    html: `
      ${WRAPPER_START}
        ${HEADER}
        <p style="color: #475569; font-size: 0.875rem;">Hi ${n},</p>
        <p style="color: #475569; font-size: 0.875rem; margin-bottom: 1rem;">
          Your Porch post <strong>"${pt}"</strong> has been removed by a moderator for violating community guidelines.
        </p>
        <p style="color: #475569; font-size: 0.875rem;">
          If you believe this was a mistake, reply to this email.
        </p>
        ${FOOTER}
      ${WRAPPER_END}
    `,
  }
}

export function listingLiveEmail(
  name: string,
  listingTitle: string,
  listingId: number,
  categorySlug?: string,
): { subject: string; html: string } {
  const n = esc(name), lt = esc(listingTitle)
  const listingUrl = categorySlug
    ? `${BASE_URL}/listings/${categorySlug}/${listingId}`
    : `${BASE_URL}/listings/for-sale/${listingId}`
  return {
    subject: `Your listing "${lt}" is live!`,
    html: `
      ${WRAPPER_START}
        ${HEADER}
        <p style="color: #475569; font-size: 0.875rem;">Hi ${n},</p>
        <p style="color: #475569; font-size: 0.875rem; margin-bottom: 1rem;">
          Your listing <strong>"${lt}"</strong> is now live and visible to your neighbors. Good luck!
        </p>
        ${BUTTON(listingUrl, 'View Your Listing')}
        ${FOOTER}
      ${WRAPPER_END}
    `,
  }
}

export function savedSearchMatchEmail(
  name: string,
  searchLabel: string,
  listingTitle: string,
  listingId: number,
  categorySlug: string,
): { subject: string; html: string } {
  const n = esc(name), sl = esc(searchLabel), lt = esc(listingTitle)
  const listingUrl = `${BASE_URL}/listings/${categorySlug}/${listingId}`
  return {
    subject: `New match: "${sl}"`,
    html: `
      ${WRAPPER_START}
        ${HEADER}
        <p style="color: #475569; font-size: 0.875rem;">Hi ${n},</p>
        <p style="color: #475569; font-size: 0.875rem; margin-bottom: 1rem;">
          A new listing matches your alert <strong>"${sl}"</strong>:
        </p>
        <div style="background: #f1f5f9; border-radius: 0.75rem; padding: 1rem; margin-bottom: 1rem;">
          <p style="color: #0f172a; font-size: 0.9375rem; font-weight: 600; margin: 0;">${lt}</p>
        </div>
        ${BUTTON(listingUrl, 'View Listing')}
        <p style="color: #94a3b8; font-size: 0.75rem; margin-top: 1.5rem;">
          You're receiving this because you set up an alert on The NYC Classifieds. Manage your alerts in your <a href="${BASE_URL}/alerts" style="color: #2563eb;">account settings</a>.
        </p>
        ${FOOTER}
      ${WRAPPER_END}
    `,
  }
}

export function urgentPostLiveEmail(
  name: string,
  postTitle: string,
  postType: string,
  postId: number,
): { subject: string; html: string } {
  const n = esc(name), pt = esc(postTitle)
  const typeLabel = postType.replace(/-/g, ' ')
  const tl = esc(typeLabel)
  return {
    subject: `Your ${tl} post is live`,
    html: `
      ${WRAPPER_START}
        ${HEADER}
        <p style="color: #475569; font-size: 0.875rem;">Hi ${n},</p>
        <p style="color: #475569; font-size: 0.875rem; margin-bottom: 1rem;">
          Your ${tl} post <strong>"${pt}"</strong> is now live on the Porch. Neighbors in your area will see it right away.
        </p>
        ${BUTTON(`${BASE_URL}/porch/post/${postId}/${slugify(postTitle)}`, 'View Your Post')}
        ${FOOTER}
      ${WRAPPER_END}
    `,
  }
}

export function flagConfirmationEmail(
  name: string,
  contentType: string,
): { subject: string; html: string } {
  const n = esc(name), ct = esc(contentType)
  return {
    subject: 'Thanks for your report',
    html: `
      ${WRAPPER_START}
        ${HEADER}
        <p style="color: #475569; font-size: 0.875rem;">Hi ${n},</p>
        <p style="color: #475569; font-size: 0.875rem; margin-bottom: 1rem;">
          We received your report about a ${ct}. Our moderation team will review it and take action if it violates our community guidelines.
        </p>
        <p style="color: #475569; font-size: 0.875rem;">
          You'll be notified when the report has been reviewed.
        </p>
        ${FOOTER}
      ${WRAPPER_END}
    `,
  }
}

export function moderatorAlertEmail(
  contentType: string,
  reason: string,
  reporterName: string,
): { subject: string; html: string } {
  const ct = esc(contentType), r = esc(reason), rn = esc(reporterName)
  return {
    subject: `New flag: ${ct} reported by ${rn}`,
    html: `
      ${WRAPPER_START}
        ${HEADER}
        <p style="color: #475569; font-size: 0.875rem; margin-bottom: 0.5rem;">A ${ct} has been flagged for review.</p>
        <div style="background: #f1f5f9; border-radius: 0.75rem; padding: 1rem; margin-bottom: 1rem;">
          <p style="color: #475569; font-size: 0.875rem; margin: 0 0 0.5rem;"><strong>Reporter:</strong> ${rn}</p>
          <p style="color: #475569; font-size: 0.875rem; margin: 0;"><strong>Reason:</strong> ${r}</p>
        </div>
        ${BUTTON(`${BASE_URL}/admin`, 'Review in Admin')}
        ${FOOTER}
      ${WRAPPER_END}
    `,
  }
}

export function flagResolvedEmail(
  name: string,
  contentType: string,
  outcome: string,
): { subject: string; html: string } {
  const n = esc(name), ct = esc(contentType), o = esc(outcome)
  return {
    subject: `Your report has been reviewed`,
    html: `
      ${WRAPPER_START}
        ${HEADER}
        <p style="color: #475569; font-size: 0.875rem;">Hi ${n},</p>
        <p style="color: #475569; font-size: 0.875rem; margin-bottom: 1rem;">
          We've reviewed your report about a ${ct}. <strong>Outcome: ${o}.</strong>
        </p>
        <p style="color: #475569; font-size: 0.875rem;">
          Thanks for helping keep the community safe.
        </p>
        ${FOOTER}
      ${WRAPPER_END}
    `,
  }
}

export function helpfulVoteEmail(
  recipientName: string,
  voterName: string,
  postTitle: string,
  postId: number,
): { subject: string; html: string } {
  const rn = esc(recipientName), vn = esc(voterName), pt = esc(postTitle)
  return {
    subject: `${vn} found your reply helpful`,
    html: `
      ${WRAPPER_START}
        ${HEADER}
        <p style="color: #475569; font-size: 0.875rem;">Hi ${rn},</p>
        <p style="color: #475569; font-size: 0.875rem; margin-bottom: 1rem;">
          <strong>${vn}</strong> marked your reply on <strong>"${pt}"</strong> as helpful. Keep it up!
        </p>
        ${BUTTON(`${BASE_URL}/porch/post/${postId}/${slugify(postTitle)}`, 'View Post')}
        ${FOOTER}
      ${WRAPPER_END}
    `,
  }
}

export function adminNewSignupEmail(
  userName: string,
  userEmail: string,
  neighborhood: string,
  accountType: string,
): { subject: string; html: string } {
  const n = esc(userName), e = esc(userEmail), nh = esc(neighborhood), at = esc(accountType)
  return {
    subject: `New verified ${at} user: ${n}`,
    html: `
      ${WRAPPER_START}
        ${HEADER}
        <p style="color: #475569; font-size: 0.875rem; margin-bottom: 0.5rem;">A new user just completed verification.</p>
        <div style="background: #f1f5f9; border-radius: 0.75rem; padding: 1rem; margin-bottom: 1rem;">
          <p style="color: #475569; font-size: 0.875rem; margin: 0 0 0.25rem;"><strong>Name:</strong> ${n}</p>
          <p style="color: #475569; font-size: 0.875rem; margin: 0 0 0.25rem;"><strong>Email:</strong> ${e}</p>
          <p style="color: #475569; font-size: 0.875rem; margin: 0 0 0.25rem;"><strong>Neighborhood:</strong> ${nh || 'Not set'}</p>
          <p style="color: #475569; font-size: 0.875rem; margin: 0;"><strong>Account:</strong> ${at}</p>
        </div>
        ${BUTTON(`${BASE_URL}/admin`, 'View in Admin')}
        ${FOOTER}
      ${WRAPPER_END}
    `,
  }
}

export interface DailyDigestStats {
  newUsers: number
  newListings: number
  newPorchPosts: number
  newReplies: number
  newMessages: number
  pendingFlags: number
  seedPostsToday: number
  totalUsers: number
  totalListings: number
  expiringNotified: number
  expiredNotified: number
  // Seed engine metrics
  seedListingsToday: number
  seedRepliesToday: number
  seedNewUsers: number
  // Totals including seed
  totalSeedUsers: number
  totalPorchPosts: number
  totalSeedListings: number
  // Yesterday comparisons for growth %
  yesterdayListings: number
  yesterdayPorchPosts: number
  yesterdaySeedUsers: number
  // Category breakdown for seed listings
  seedListingsByCategory: Record<string, number>
}

export function adminDailyDigestEmail(stats: DailyDigestStats): { subject: string; html: string } {
  const row = (label: string, val: number | string) =>
    `<tr><td style="padding: 4px 12px 4px 0; color: #475569; font-size: 0.875rem;">${label}</td><td style="padding: 4px 0; font-weight: 600; color: #0f172a; font-size: 0.875rem;">${val}</td></tr>`

  const growthRow = (label: string, today: number, yesterday: number) => {
    if (yesterday === 0) return row(label, `${today} (new)`)
    const pct = ((today - yesterday) / yesterday * 100).toFixed(1)
    const arrow = today >= yesterday ? '↑' : '↓'
    const color = today >= yesterday ? '#059669' : '#dc2626'
    return `<tr><td style="padding: 4px 12px 4px 0; color: #475569; font-size: 0.875rem;">${label}</td><td style="padding: 4px 0; font-weight: 600; color: #0f172a; font-size: 0.875rem;">${today} <span style="color: ${color}; font-size: 0.75rem;">${arrow} ${pct}%</span></td></tr>`
  }

  // Seed listing category breakdown
  const catRows = Object.entries(stats.seedListingsByCategory || {})
    .sort(([, a], [, b]) => b - a)
    .map(([cat, count]) => row(`  ${cat}`, count))
    .join('')

  const totalSeedToday = stats.seedPostsToday + stats.seedListingsToday + stats.seedRepliesToday

  return {
    subject: `Daily Digest: ${totalSeedToday} seed actions | ${stats.newUsers} real users | ${stats.totalListings} active listings`,
    html: `
      ${WRAPPER_START}
        ${HEADER}
        <p style="color: #475569; font-size: 0.875rem; margin-bottom: 1rem;">Here's today's activity on The NYC Classifieds.</p>

        <h3 style="font-size: 0.875rem; font-weight: 700; color: #0f172a; margin: 1rem 0 0.5rem;">Real User Activity</h3>
        <table style="border-collapse: collapse;">
          ${row('New verified users', stats.newUsers)}
          ${row('New listings', stats.newListings)}
          ${row('New porch posts', stats.newPorchPosts)}
          ${row('New replies', stats.newReplies)}
          ${row('New messages', stats.newMessages)}
        </table>

        <h3 style="font-size: 0.875rem; font-weight: 700; color: #059669; margin: 1rem 0 0.5rem;">Seed Engine — Today</h3>
        <table style="border-collapse: collapse;">
          ${row('New seed users', stats.seedNewUsers)}
          ${row('Seed porch posts', stats.seedPostsToday)}
          ${row('Seed porch replies', stats.seedRepliesToday)}
          ${row('Seed listings', stats.seedListingsToday)}
          ${row('Total seed actions', totalSeedToday)}
        </table>

        ${catRows ? `
        <h3 style="font-size: 0.875rem; font-weight: 700; color: #059669; margin: 1rem 0 0.5rem;">Seed Listings by Category</h3>
        <table style="border-collapse: collapse;">
          ${catRows}
        </table>` : ''}

        <h3 style="font-size: 0.875rem; font-weight: 700; color: #2563eb; margin: 1rem 0 0.5rem;">Growth (vs Yesterday)</h3>
        <table style="border-collapse: collapse;">
          ${growthRow('Listings (all)', stats.seedListingsToday + stats.newListings, stats.yesterdayListings)}
          ${growthRow('Porch posts (all)', stats.seedPostsToday + stats.newPorchPosts, stats.yesterdayPorchPosts)}
          ${growthRow('Users (seed)', stats.seedNewUsers, stats.yesterdaySeedUsers)}
        </table>

        <h3 style="font-size: 0.875rem; font-weight: 700; color: #0f172a; margin: 1rem 0 0.5rem;">Platform Totals</h3>
        <table style="border-collapse: collapse;">
          ${row('Total real users', stats.totalUsers)}
          ${row('Total seed users', stats.totalSeedUsers)}
          ${row('Total active listings', stats.totalListings)}
          ${row('Total seed listings', stats.totalSeedListings)}
          ${row('Total porch posts', stats.totalPorchPosts)}
        </table>

        <h3 style="font-size: 0.875rem; font-weight: 700; color: #0f172a; margin: 1rem 0 0.5rem;">Moderation</h3>
        <table style="border-collapse: collapse;">
          ${row('Pending flags', stats.pendingFlags)}
          ${row('Expiring reminders sent', stats.expiringNotified)}
          ${row('Expired notices sent', stats.expiredNotified)}
        </table>

        ${BUTTON(`${BASE_URL}/admin`, 'Open Admin Dashboard')}
        ${FOOTER}
      ${WRAPPER_END}
    `,
  }
}

export function adminNoticeEmail(
  name: string,
  title: string,
  body: string,
  link?: string,
): { subject: string; html: string } {
  const n = esc(name), t = esc(title), b = esc(body)
  return {
    subject: t,
    html: `
      ${WRAPPER_START}
        ${HEADER}
        <p style="color: #475569; font-size: 0.875rem;">Hi ${n},</p>
        <p style="color: #475569; font-size: 0.875rem; font-weight: 600; margin-bottom: 0.5rem;">${t}</p>
        ${b ? `<p style="color: #475569; font-size: 0.875rem; margin-bottom: 1rem; white-space: pre-line;">${b}</p>` : ''}
        ${link ? BUTTON(link, 'View Details') : ''}
        ${FOOTER}
      ${WRAPPER_END}
    `,
  }
}

export function feedbackConfirmationEmail(
  name: string,
  category: string,
): { subject: string; html: string } {
  const n = esc(name), c = esc(category)
  return {
    subject: 'We received your feedback',
    html: `
      ${WRAPPER_START}
        ${HEADER}
        <p style="color: #475569; font-size: 0.875rem;">Hi ${n},</p>
        <p style="color: #475569; font-size: 0.875rem; margin-bottom: 1rem;">
          Thanks for submitting your ${c} feedback. We read every submission and appreciate you helping us improve The NYC Classifieds.
        </p>
        <p style="color: #475569; font-size: 0.875rem;">
          We'll follow up if we need more details or when we've addressed your feedback.
        </p>
        ${FOOTER}
      ${WRAPPER_END}
    `,
  }
}

export function feedbackAdminAlertEmail(
  category: string,
  message: string,
  submitterName: string,
  pageUrl: string | null,
): { subject: string; html: string } {
  const c = esc(category), m = esc(message), sn = esc(submitterName)
  return {
    subject: `New ${c} feedback from ${sn}`,
    html: `
      ${WRAPPER_START}
        ${HEADER}
        <p style="color: #475569; font-size: 0.875rem; margin-bottom: 0.5rem;">New feedback submitted.</p>
        <div style="background: #f1f5f9; border-radius: 0.75rem; padding: 1rem; margin-bottom: 1rem;">
          <p style="color: #475569; font-size: 0.875rem; margin: 0 0 0.5rem;"><strong>From:</strong> ${sn}</p>
          <p style="color: #475569; font-size: 0.875rem; margin: 0 0 0.5rem;"><strong>Category:</strong> ${c}</p>
          ${pageUrl ? `<p style="color: #475569; font-size: 0.875rem; margin: 0 0 0.5rem;"><strong>Page:</strong> ${esc(pageUrl)}</p>` : ''}
          <p style="color: #475569; font-size: 0.875rem; margin: 0;"><strong>Message:</strong> ${m}</p>
        </div>
        ${BUTTON(`${BASE_URL}/admin`, 'Review in Admin')}
        ${FOOTER}
      ${WRAPPER_END}
    `,
  }
}

export function feedbackReplyEmail(
  name: string,
  category: string,
  replyText: string,
): { subject: string; html: string } {
  const n = esc(name), c = esc(category), r = esc(replyText)
  return {
    subject: 'We replied to your feedback',
    html: `
      ${WRAPPER_START}
        ${HEADER}
        <p style="color: #475569; font-size: 0.875rem;">Hi ${n},</p>
        <p style="color: #475569; font-size: 0.875rem; margin-bottom: 1rem;">
          We've reviewed your ${c} feedback and have a response for you:
        </p>
        <div style="background: #f1f5f9; border-radius: 0.75rem; padding: 1rem; margin-bottom: 1rem;">
          <p style="color: #475569; font-size: 0.875rem; margin: 0; white-space: pre-line;">${r}</p>
        </div>
        <p style="color: #475569; font-size: 0.875rem;">
          Thanks for helping us improve The NYC Classifieds!
        </p>
        ${FOOTER}
      ${WRAPPER_END}
    `,
  }
}

export function businessProfileLiveEmail(
  name: string,
  businessName: string,
  slug: string,
  category?: string | null,
): { subject: string; html: string } {
  const n = esc(name), bn = esc(businessName)
  const catSlug = category ? slugify(category) : 'other'
  const profileUrl = `${BASE_URL}/business/${catSlug}/${esc(slug)}`
  return {
    subject: `Your business page for ${bn} is live!`,
    html: `
      ${WRAPPER_START}
        ${HEADER}
        <p style="color: #475569; font-size: 0.875rem;">Hi ${n},</p>
        <p style="color: #475569; font-size: 0.875rem; margin-bottom: 1rem;">
          Your business page for <strong>${bn}</strong> is now live on The NYC Classifieds. Share your page with customers:
        </p>
        <div style="background: #f1f5f9; border-radius: 0.75rem; padding: 1rem; margin-bottom: 1rem; text-align: center;">
          <a href="${profileUrl}" style="color: #2563eb; font-size: 0.875rem; word-break: break-all;">${profileUrl}</a>
        </div>
        ${BUTTON(profileUrl, 'View Your Page')}
        ${FOOTER}
      ${WRAPPER_END}
    `,
  }
}

export function userWarningEmail(
  name: string,
  reason: string,
  severity: string,
  warningCount: number,
): { subject: string; html: string } {
  const n = esc(name), r = esc(reason), s = esc(severity)
  const isFinal = warningCount >= 3
  const severityColor = s === 'high' ? '#dc2626' : s === 'medium' ? '#ea580c' : '#eab308'
  return {
    subject: isFinal ? 'Final warning — your account may be suspended' : 'You have received a warning',
    html: `
      ${WRAPPER_START}
        ${HEADER}
        <p style="color: #475569; font-size: 0.875rem;">Hi ${n},</p>
        ${isFinal ? `
        <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 0.75rem; padding: 1rem; margin-bottom: 1rem;">
          <p style="color: #dc2626; font-size: 0.875rem; font-weight: 600; margin: 0 0 0.5rem;">Final Warning</p>
          <p style="color: #dc2626; font-size: 0.875rem; margin: 0;">This is your ${warningCount}${warningCount === 2 ? 'nd' : warningCount === 3 ? 'rd' : 'th'} warning. Further violations will result in your account being suspended.</p>
        </div>
        ` : ''}
        <p style="color: #475569; font-size: 0.875rem; margin-bottom: 1rem;">
          You have received a warning for violating our community guidelines.
        </p>
        <div style="background: #f1f5f9; border-radius: 0.75rem; padding: 1rem; margin-bottom: 1rem;">
          <p style="color: #475569; font-size: 0.875rem; margin: 0 0 0.5rem;"><strong>Reason:</strong> ${r}</p>
          <p style="color: #475569; font-size: 0.875rem; margin: 0;"><strong>Severity:</strong> <span style="color: ${severityColor}; font-weight: 600;">${s}</span></p>
        </div>
        <p style="color: #475569; font-size: 0.875rem;">
          This is warning ${warningCount} on your account. Please review our community guidelines to avoid further action.
        </p>
        <p style="color: #475569; font-size: 0.875rem;">
          If you believe this was a mistake, reply to this email.
        </p>
        ${FOOTER}
      ${WRAPPER_END}
    `,
  }
}

export function adminLoginAlertEmail(
  name: string,
  email: string,
  timestamp: string,
): { subject: string; html: string } {
  const n = esc(name), e = esc(email), t = esc(timestamp)
  return {
    subject: `Admin login alert — ${n}`,
    html: `
      ${WRAPPER_START}
        ${HEADER}
        <p style="color: #475569; font-size: 0.875rem; margin-bottom: 0.5rem;">An admin/moderator account just logged in.</p>
        <div style="background: #f1f5f9; border-radius: 0.75rem; padding: 1rem; margin-bottom: 1rem;">
          <p style="color: #475569; font-size: 0.875rem; margin: 0 0 0.25rem;"><strong>Name:</strong> ${n}</p>
          <p style="color: #475569; font-size: 0.875rem; margin: 0 0 0.25rem;"><strong>Email:</strong> ${e}</p>
          <p style="color: #475569; font-size: 0.875rem; margin: 0;"><strong>Time:</strong> ${t}</p>
        </div>
        <p style="color: #94a3b8; font-size: 0.75rem;">If this wasn't you, secure your account immediately.</p>
        ${FOOTER}
      ${WRAPPER_END}
    `,
  }
}

export function systemErrorAlertEmail(
  context: string,
  errorMessage: string,
): { subject: string; html: string } {
  const c = esc(context), m = esc(errorMessage)
  return {
    subject: `System error: ${c}`,
    html: `
      ${WRAPPER_START}
        ${HEADER}
        <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 0.75rem; padding: 1rem; margin-bottom: 1rem;">
          <p style="color: #dc2626; font-size: 0.875rem; font-weight: 600; margin: 0 0 0.5rem;">System Error</p>
          <p style="color: #475569; font-size: 0.875rem; margin: 0 0 0.25rem;"><strong>Context:</strong> ${c}</p>
          <p style="color: #475569; font-size: 0.875rem; margin: 0; white-space: pre-wrap; word-break: break-all;"><strong>Error:</strong> ${m}</p>
        </div>
        <p style="color: #94a3b8; font-size: 0.75rem;">Timestamp: ${new Date().toISOString()}</p>
        ${BUTTON(`${BASE_URL}/admin`, 'Open Admin')}
        ${FOOTER}
      ${WRAPPER_END}
    `,
  }
}

export interface BlogPost {
  slug: string
  title: string
  date: string
  author: string
  excerpt: string
  content: string
}

export const blogPosts: BlogPost[] = [
  {
    slug: 'why-we-built-nyc-classifieds',
    title: 'Why We Built NYC Classifieds',
    date: '2026-01-15',
    author: 'The NYC Classifieds Team',
    excerpt: 'New York has 8 million stories, but the platforms people use to connect locally are broken. We built NYC Classifieds to fix that.',
    content: `New York City has 8 million people living within 302 square miles. We ride the same subways, walk the same blocks, and rely on the same bodegas — yet somehow, connecting with the person two floors down feels harder than ever.

Craigslist is full of scams. Facebook Marketplace is buried behind an algorithm that prioritizes ads over your neighbor selling a couch. Nextdoor turned into a complaint board. None of them feel like New York.

We wanted something different. Something that respects the way New Yorkers actually live — fast, real, local, and direct.

## The Gap We Saw

Every week, thousands of New Yorkers need to find an apartment, sell furniture, hire a handyman, or find a running buddy. The tools available to them are either national platforms that treat NYC like any other zip code, or they're outdated and full of spam.

We saw three problems no one was solving:

1. **Trust is broken.** You can't tell if a listing is from a real person or a bot. Geo-verification changes that — every user proves they're actually in NYC with a selfie and GPS check.

2. **Community is missing.** Buying and selling is only half the story. New Yorkers also need a place to share recommendations, warn about package thieves, organize block parties, and welcome new neighbors. That's why we built The Porch alongside our classifieds.

3. **It should be free.** Posting a listing or asking your neighborhood for a good plumber shouldn't cost anything. NYC Classifieds is free to use, and always will be.

## What Makes It Different

Every user on NYC Classifieds is geo-verified. That means when someone posts a listing in Astoria or a recommendation in Park Slope, they're actually there. No fake accounts, no out-of-state scammers, no bots.

We organized the entire platform around NYC's natural geography — five boroughs, 126 neighborhoods. You can browse your block or your borough. Everything is local by default.

And we built The Porch — a community space where neighbors share recommendations, lost-and-found posts, alerts, events, and stoop sales. It's the digital equivalent of chatting on your front stoop.

## What's Next

We're just getting started. Every day, more New Yorkers are signing up, posting listings, and building community on The Porch. We're listening to feedback and shipping improvements constantly.

If you've ever wished there was a better way to connect with your neighbors and your neighborhood, you're in the right place. Welcome to NYC Classifieds.`,
  },
  {
    slug: 'how-geo-verification-works',
    title: 'How Geo-Verification Works — And Why It Matters',
    date: '2026-01-22',
    author: 'The NYC Classifieds Team',
    excerpt: 'Every user on NYC Classifieds is verified with a selfie and GPS check. Here\'s how it works and why trust is the foundation of everything we do.',
    content: `The biggest problem with online classifieds isn't the interface or the features — it's trust. When you respond to a listing, you have no idea if the person on the other end is real, local, or even in the same state.

We decided to fix that from day one.

## The Verification Process

When you sign up for NYC Classifieds, we ask you to complete a simple verification step:

1. **Take a selfie.** Your camera opens and you snap a quick photo. This confirms you're a real person, not a bot or a stock photo.

2. **Share your location.** Your phone's GPS confirms you're physically in New York City. We check that you're within the five boroughs.

3. **You're verified.** A verification badge appears on your profile, and your posts are marked as coming from a verified NYC resident.

The entire process takes about 30 seconds. We don't store your selfie permanently — it's used for verification and then deleted. Your GPS coordinates are used only to confirm your borough and neighborhood, never shared with other users.

## Why This Matters

On other platforms, anyone with an email address can post anything. That's how you end up with:

- Apartment listings for places that don't exist
- "Local" sellers who are actually running scams from out of state
- Bots flooding every category with spam
- No way to know if the person you're messaging is real

Geo-verification eliminates all of this. When you see a verified badge on NYC Classifieds, you know:

- The person is real (not a bot)
- They're actually in NYC (not a remote scammer)
- They verified their identity (they have skin in the game)

## Privacy First

We take privacy seriously:

- **Selfies are not stored long-term.** They're used for the verification check and deleted.
- **Your exact location is never shared.** Other users see your borough and neighborhood, never your address or GPS coordinates.
- **No social media required.** You don't need to connect Facebook, Google, or any other account.
- **Your data stays yours.** We don't sell user data. Period.

## The Result

Since launching with geo-verification, we've maintained a spam rate near zero. Our users trust each other because they know everyone on the platform went through the same verification process.

It's a small step that makes a massive difference. And it's why NYC Classifieds feels different from everything else out there.`,
  },
  {
    slug: 'introducing-the-porch',
    title: 'Introducing The Porch — Your Neighborhood\'s Digital Front Stoop',
    date: '2026-01-29',
    author: 'The NYC Classifieds Team',
    excerpt: 'The Porch is where NYC neighbors share recommendations, post alerts, organize events, and build real community — neighborhood by neighborhood.',
    content: `Classifieds are great for buying and selling. But neighborhoods need more than transactions — they need conversation. That's why we built The Porch.

## What Is The Porch?

The Porch is a community space built into NYC Classifieds where neighbors can share what matters locally. Think of it as the digital version of sitting on your front stoop and chatting with the people who live around you.

Every post on The Porch is tied to a specific borough and neighborhood, so you see what's relevant to where you actually live.

## Post Types

The Porch supports several types of posts, each designed for a different kind of neighborhood conversation:

**Recommendations** — Found an amazing pizza spot? A trustworthy plumber? A daycare that actually has openings? Share it with your neighbors. These are the posts that make The Porch invaluable.

**Questions** — New to the neighborhood and need a gym? Looking for a dog-friendly restaurant? Ask your neighbors. They know things Google doesn't.

**Alerts** — Package thefts on your block? A water main break? Construction starting at 6am? Post it so your neighbors know before they walk into it.

**Lost & Found** — Lost your cat? Found a wallet? These posts get pinned and stay visible longer because every minute counts.

**Events** — Block parties, open mics, farmers markets, free yoga in the park. If it's happening in the neighborhood, it belongs on The Porch.

**Stoop Sales & Garage Sales** — The classic NYC tradition, now with a digital assist. Post your sale and reach everyone in the neighborhood.

**Volunteer** — Soup kitchen needs help? Community garden cleanup this weekend? Find and share opportunities to give back.

**Groups** — Running clubs, book clubs, poker nights, parents groups. Find your people or start something new.

**Welcome** — New to the neighborhood? Introduce yourself. Neighbors love welcoming newcomers with their best local tips.

## How It Works

1. **Browse your neighborhood.** The Porch shows posts from your borough and neighborhood by default. You can also explore other neighborhoods across the city.

2. **Post anything.** Choose a post type, write your title and body, and share it. Your post is tagged with your verified neighborhood.

3. **Reply and engage.** The best posts spark conversations. Reply to recommendations, answer questions, share your own experience.

4. **Everything is verified.** Just like classifieds, every Porch post comes from a geo-verified NYC resident. No bots, no spam, no outsiders.

## Why It Matters

New York City can feel anonymous. You might live in an apartment building with 50 other families and not know any of them. The Porch changes that by giving neighborhoods a shared space to connect.

The best local knowledge doesn't live on Google or Yelp — it lives in the heads of your neighbors. The Porch gets it out of their heads and into your feed.

Whether you've lived in your neighborhood for 30 years or 30 days, The Porch is your place to be part of it.`,
  },
  {
    slug: 'free-forever',
    title: 'Free Forever — Why We\'ll Never Charge to Post',
    date: '2026-02-05',
    author: 'The NYC Classifieds Team',
    excerpt: 'Posting on NYC Classifieds is free, and it always will be. Here\'s why we made that commitment and how we plan to sustain it.',
    content: `When we launched NYC Classifieds, we made a simple promise: it's free to post, and it always will be. No listing fees, no premium tiers, no paywalls on community features.

This isn't a limited-time offer or a growth hack. It's a core commitment.

## Why Free Matters

Classifieds platforms exist to connect people. The moment you charge for a listing, you create a barrier. And barriers mean fewer listings, which means fewer buyers, which means the platform becomes less useful for everyone.

Think about it from the perspective of the people who use classifieds the most:

- A family selling furniture before a move shouldn't have to pay $5 per listing.
- A freelancer posting their services shouldn't need a monthly subscription.
- A neighbor sharing a lost-cat alert shouldn't face a paywall.
- A restaurant hiring a line cook shouldn't pay $200 for a job post when they could barely afford to.

Free access means everyone participates. And when everyone participates, the platform is better for everyone.

## How We Sustain It

You might be wondering: if it's free, how does it work? Fair question. Here's our approach:

**Targeted local advertising.** Small, relevant ads from local businesses that are genuinely useful to our users. Not pop-ups, not tracking-heavy programmatic ads — just simple placements from NYC businesses that want to reach their neighbors.

**Optional premium features.** Down the road, we may offer optional paid features for businesses (like promoted listings or analytics). But the core experience — posting, browsing, messaging, using The Porch — will always be free for individuals.

**Low overhead.** We're a small team. We don't have a fancy office or a massive staff. We keep costs low so we can keep the platform free.

## What We Won't Do

Some things are off the table, permanently:

- **We won't charge to post a listing.** Ever. For any category.
- **We won't charge for messages.** Contacting someone about a listing or Porch post is free.
- **We won't paywall community features.** The Porch, alerts, events — all free.
- **We won't sell your data.** Your information is yours.
- **We won't shove algorithmic ads into your feed.** No engagement-bait, no dark patterns.

## A Platform for New Yorkers

NYC Classifieds exists to serve New Yorkers. Not advertisers, not investors, not some algorithm's idea of engagement. When we make decisions about the platform, we ask one question: does this make the experience better for the people who use it?

Keeping it free is the most important decision we've made. And we're sticking with it.`,
  },
  {
    slug: 'security-and-trust',
    title: 'Security and Trust on NYC Classifieds',
    date: '2026-02-10',
    author: 'The NYC Classifieds Team',
    excerpt: 'From geo-verification to moderation to flagging, here\'s how we keep NYC Classifieds safe and trustworthy for everyone.',
    content: `Trust isn't just a feature — it's the foundation of NYC Classifieds. Every design decision we make starts with the question: does this make our users safer?

Here's how we approach security and trust across the platform.

## Verification

Every user on NYC Classifieds goes through geo-verification before they can post. This means:

- A real selfie confirms you're a human, not a bot
- GPS confirms you're physically in New York City
- Your verified status is visible on every post and listing

This single step eliminates the vast majority of scams, spam, and fake accounts that plague other platforms.

## Moderation

We use a combination of automated and human moderation to keep the platform clean:

**Automated filters** catch prohibited content, spam patterns, and suspicious activity before posts go live. Our moderation system checks every title and description against known patterns.

**Community flagging** lets users report posts that violate our guidelines. Flagged content is reviewed quickly and removed if it breaks the rules.

**Account consequences** are real. Users who violate guidelines face warnings, temporary suspensions, or permanent bans depending on severity. We don't tolerate harassment, scams, or illegal activity.

## Safe Messaging

When you message someone on NYC Classifieds, your personal information stays private:

- **No phone numbers or emails are shared** unless you choose to share them.
- **Messages stay on-platform** so there's a record if something goes wrong.
- **Block and report** features are available on every conversation.

## Tips for Staying Safe

While we do everything we can on the platform side, here are some common-sense tips:

1. **Meet in public places** for in-person transactions. Coffee shops, bank lobbies, and police station parking lots are great options.
2. **Use cash or secure payment methods** like Venmo or Zelle. Never wire money or send gift cards.
3. **Trust your instincts.** If a deal seems too good to be true, it probably is.
4. **Don't share personal information** like your home address until you're comfortable.
5. **Check verification badges.** Verified users have been through our geo-verification process.

## Flagging and Reporting

See something that doesn't look right? Every post and listing has a flag button. When you flag something, our team reviews it promptly. Common reasons to flag:

- Suspected scam or fraudulent listing
- Prohibited items (illegal goods, weapons, etc.)
- Harassment or threatening language
- Spam or duplicate posts
- Misleading information

## Our Commitment

Security is never "done." We're constantly improving our verification process, moderation tools, and safety features. As the platform grows, our commitment to keeping it safe grows with it.

NYC Classifieds is built on trust. Every verified badge, every moderation action, and every safety feature exists to protect that trust. Because a platform is only as good as the community's confidence in it.`,
  },
]

export function getPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find(p => p.slug === slug)
}

export function getAllSlugs(): string[] {
  return blogPosts.map(p => p.slug)
}

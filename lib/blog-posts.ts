export interface BlogPost {
  slug: string
  title: string
  date: string
  author: string
  category: string
  tags: string[]
  excerpt: string
  content: string
}

export const BLOG_CATEGORIES = [
  'All Posts',
  'Updates',
  'Features',
  'Community',
  'Safety',
  'Guides',
  'NYC',
] as const

export type BlogCategory = (typeof BLOG_CATEGORIES)[number]

export const blogPosts: BlogPost[] = [
  {
    slug: 'what-were-building-next',
    title: 'What We\'re Building Next',
    date: '2026-02-11',
    author: 'The NYC Classifieds Team',
    category: 'Updates',
    tags: ['roadmap', 'features', 'future', 'product'],
    excerpt: 'We\'ve been heads-down building for six weeks. Here\'s a look at what\'s coming to NYC Classifieds in the weeks ahead.',
    content: `Six weeks in. The foundation is laid, the walls are up, and people are actually walking through the door. Now comes the part where we make this thing genuinely great.

We\'ve been listening to every piece of feedback that comes through, reading every flag report, watching which features get used and which ones collect dust. And we have a clear picture of where to go next.

## What\'s on the Workbench

**Photo uploads for listings.** This is the most-requested feature by a mile, and for good reason. Nobody wants to buy a couch they can\'t see. We\'re building a clean, fast image uploader that works even on a shaky subway connection. Multiple photos per listing. No stock photos allowed.

**Neighborhood-level notifications.** Right now you get notified about activity across your borough. But if you\'re in Bushwick, you probably don\'t need to hear about every stoop sale in Bay Ridge. We\'re building granular notification controls tied to your specific neighborhood.

**Direct messaging improvements.** The current messaging system works, but it\'s bare bones. We\'re adding read receipts, the ability to share listings in a conversation, and better organization so your inbox doesn\'t become a mess.

**Saved searches.** Looking for a one-bedroom in Astoria under $2,000? Set it and forget it. We\'ll ping you when something matches.

**Business dashboard.** Local shops told us they want analytics on their listings and profile views. We\'re building a simple dashboard that shows what\'s working without drowning anyone in data.

## What We\'re Not Building

Just as important as what we\'re adding is what we\'re deliberately leaving out:

- **No algorithmic feed.** Your feed shows what\'s new, not what some engagement model thinks you should see.
- **No promoted posts that look like organic content.** If something is an ad, it\'ll say so.
- **No social features for the sake of social features.** We\'re not adding stories, reels, or reactions. The Porch is for conversation, not performance.

## The Timeline

We ship fast because we\'re small. Most of these features will roll out over the next four to six weeks. Photos and saved searches are first in line.

We\'re building this in public, so you\'ll hear about it as it happens. And if there\'s something you want that isn\'t on this list, tell us. We read everything. Seriously. We\'re a small team and your feedback goes straight to the people writing the code.

This is still early. The best version of NYC Classifieds hasn\'t been built yet. But it\'s getting closer every day.`,
  },
  {
    slug: 'first-10-days-what-google-told-us',
    title: 'First 10 Days: What Google Told Us',
    date: '2026-02-09',
    author: 'The NYC Classifieds Team',
    category: 'Updates',
    tags: ['SEO', 'analytics', 'launch', 'search'],
    excerpt: 'We opened Google Search Console and actually learned something. Here\'s what the first 10 days of search data revealed about how people find us.',
    content: `We wrote a few weeks ago about our SEO strategy for a brand-new site. Now we actually have data. Ten days of it. And it\'s both humbling and encouraging.

## The Numbers, Honestly

In our first 10 days in Google Search Console, we saw impressions before we saw clicks. That\'s normal. Google has to notice you exist before it sends anyone your way. We showed up in search results a few hundred times before a single person clicked through.

That\'s not a failure. That\'s the process.

## What People Are Searching For

The queries that surfaced us were revealing. People aren\'t searching for "NYC classifieds" yet, because they don\'t know we exist. Instead, they\'re searching for problems:

- "free apartment listings NYC no broker fee"
- "sell furniture Brooklyn"
- "neighborhood community app New York"
- "classifieds without scams NYC"

That last one made us smile. That\'s literally why we built this.

## What We Learned

**Borough and neighborhood pages are our strongest assets.** Google indexed our neighborhood pages quickly because they\'re structured, specific, and content-rich. A page about classifieds in Astoria is exactly the kind of thing Google wants to serve when someone searches for classifieds in Astoria.

**The Porch content helps more than we expected.** Community posts create fresh, localized content that search engines love. Every recommendation, every question, every alert is a new page with real neighborhood-specific text. It\'s organic SEO fuel.

**Structured data is working.** We implemented schema markup from day one, and Google is recognizing it. Our listings show up with proper metadata in search results, which improves click-through rates even at low rankings.

## The Patience Game

Here\'s the honest truth about launching a new site in 2026: it takes months to build meaningful search traffic. Domain authority is earned over time. Backlinks accumulate slowly. Google needs to crawl your site dozens of times before it trusts you.

We\'re not trying to hack the algorithm. We\'re building real, useful pages for real neighborhoods with real content from verified New Yorkers. That\'s the long game, and it\'s the only one worth playing.

## What We\'re Doing About It

We\'re doubling down on what the data tells us works:

- More neighborhood-specific landing pages
- Better internal linking between related listings and Porch posts
- Faster page load times, because Google cares and so do we
- Submitting an updated sitemap weekly as new content goes live

Ten days is nothing. But ten days of data is better than guessing. And what Google is telling us is simple: keep building real content for real neighborhoods. The rest follows.`,
  },
  {
    slug: 'we-launched-now-what',
    title: 'We Launched. Now What?',
    date: '2026-02-07',
    author: 'The NYC Classifieds Team',
    category: 'Updates',
    tags: ['launch', 'reflection', 'community', 'growth'],
    excerpt: 'The launch happened. People showed up. Now comes the part nobody tells you about: what happens after day one.',
    content: `We launched. People signed up. Listings went live. Porch posts started appearing. It worked.

And then the next morning came, and we realized launching was the easy part.

## The First Users

The first people to sign up were a mix of exactly who we hoped for and people we never expected. A guy in Washington Heights posted a leather couch within 20 minutes of creating his account. A woman in Park Slope asked The Porch for a pediatrician recommendation. Someone in the Bronx listed a catering side hustle.

These aren\'t power users or tech enthusiasts. They\'re just New Yorkers who need a thing and went looking for a place to find it. That felt right.

## What Surprised Us

**Verification wasn\'t a barrier.** We worried that asking people to verify with GPS and a selfie before posting would scare them off. It didn\'t. People understood why we were asking, and most completed it in under a minute. A few even told us it made them trust the platform more.

**The Porch got more activity than classifieds at first.** We expected people to come for listings and discover community. Instead, many came for community first. Recommendations and questions outpaced for-sale posts in the first week. We should have seen that coming. People want to talk to their neighbors.

**People read the blog.** You\'re reading it now, so maybe that\'s not surprising to you. But we genuinely didn\'t expect traffic to these posts this early. Turns out, people want to know who\'s behind the platform they\'re using.

## The Hard Part

Now we\'re in the grind. The launch buzz fades. The challenge shifts from "will anyone show up?" to "will they come back?" Retention is the only metric that matters now.

We\'re focused on three things:

1. **Making sure every listing gets seen.** If someone posts a couch and nobody views it, they\'re gone. We need enough buyers for every seller.
2. **Keeping The Porch active.** A community space that goes quiet is worse than one that never existed. We\'re seeding conversations and making sure questions get answered.
3. **Shipping fast.** Every day we don\'t have photo uploads is a day someone uses The Feed\'s Garage Sale instead. Speed matters.

## The Honest Version

We\'re small, we\'re new, and we\'re up against platforms with millions of users. We don\'t have network effects yet. We don\'t have brand recognition. What we have is a better product for a specific place, built by people who live here.

That\'s either enough or it isn\'t. We think it is. But we\'ll find out the hard way, which is the only way to find out anything worth knowing.

More soon. We\'ve got work to do.`,
  },
  {
    slug: '5-scams-hitting-nyc-right-now',
    title: '5 Scams Hitting NYC Right Now',
    date: '2026-02-06',
    author: 'The NYC Classifieds Team',
    category: 'Safety',
    tags: ['scams', 'safety', 'NYC', 'fraud', 'awareness'],
    excerpt: 'Scammers never sleep, especially in a city of 8 million targets. Here are five scams actively hitting New Yorkers in 2026 and how to avoid them.',
    content: `New York has always attracted hustlers. Most of them are honest. Some of them are not. Here are five scams that are actively targeting New Yorkers right now, across every platform and medium.

## 1. The Zelle Reversal Scam

Someone buys your item and sends payment via Zelle. You get a notification that looks legitimate. They take the item. Then the payment reverses because the Zelle account was compromised or the confirmation was spoofed.

**How to protect yourself:** Never hand over an item until payment has fully cleared and appears in your actual bank balance, not just a notification. Be suspicious if a buyer insists on Zelle over other methods, especially for high-value items.

## 2. The Apartment That Doesn\'t Exist

This one has been around forever, but the 2026 version uses AI-generated photos of apartments that look completely real. The listing shows a gorgeous one-bedroom in the Village for $1,800. The "landlord" asks for a deposit or first month\'s rent before a showing.

**How to protect yourself:** Never send money before seeing an apartment in person. Reverse-image search listing photos. If the price seems too good for the neighborhood, it is. We wrote a whole post about this one if you want the deep dive.

## 3. QR Code Phishing

Fake QR codes are showing up on parking meters, restaurant tables, and even taped to subway ads. They redirect to convincing login pages that steal your credentials or payment info.

**How to protect yourself:** Don\'t scan QR codes from unknown sources, especially ones that look taped over an existing code. If a QR code takes you to a login page, close it and navigate to the site directly through your browser.

## 4. AI-Generated Fake Listings

Scammers are using AI to generate realistic product photos, detailed descriptions, and even fake seller profiles. The listing looks perfect because a machine wrote it to look perfect.

**How to protect yourself:** Ask for photos with a specific detail, like a handwritten note with today\'s date next to the item. Real sellers can do this in 30 seconds. Scammers can\'t. Also, be wary of listings where the writing is flawless but the seller can\'t answer basic questions about the item.

## 5. The Overpayment Scheme

A buyer sends you a check for more than the asking price and asks you to refund the difference. The check bounces days later. You\'re out the item and the "refund."

**How to protect yourself:** Never accept a check for more than the listed price. If someone overpays, return the entire payment and ask them to send the correct amount. Better yet, stick to cash for in-person sales.

## The Common Thread

Every one of these scams relies on urgency and trust. The scammer wants you to act fast before you think. Take your time. Verify everything. If something feels off, it probably is. No deal is worth getting robbed.`,
  },
  {
    slug: 'everything-we-do-to-keep-you-safe',
    title: 'Everything We Do to Keep You Safe',
    date: '2026-02-05',
    author: 'The NYC Classifieds Team',
    category: 'Safety',
    tags: ['safety', 'security', 'verification', 'moderation', 'privacy', 'trust'],
    excerpt: 'A comprehensive look at every safety measure built into NYC Classifieds, from verification to moderation to privacy protections.',
    content: `Safety isn\'t a feature we bolted on after launch. It\'s the reason we built this platform in the first place. Every other classifieds site treats safety as an afterthought. We treat it as the foundation.

Here is everything we do to protect you on NYC Classifieds.

## Identity Verification

**GPS verification.** Every user must confirm their physical location within New York City\'s five boroughs using their device\'s GPS. No remote scammers, no out-of-state operators.

**Selfie verification.** Every user takes a real-time selfie during signup. This confirms a real human being is creating the account, not a bot or a fake profile using stolen photos.

Together, GPS and selfie verification mean every person on NYC Classifieds has proven they\'re a real New Yorker. That alone eliminates the majority of scam vectors.

## Automated Moderation

**Pre-publication content screening.** Every listing title, description, and Porch post is scanned before it goes live. Our moderation system blocks:

- Spam and repetitive content
- Prohibited items and services
- Negativity, harassment, and hate speech
- Known scam patterns and phishing language
- Contact information in public fields where it doesn\'t belong

This isn\'t after-the-fact cleanup. Content that violates our standards never gets published in the first place.

## Community Flagging

Every post and listing has a flag button. When a user flags something, it goes into a review queue. Flagged content is evaluated and actioned quickly. The community is our first line of defense, and we take every flag seriously.

## On-Platform Messaging

**No exposed emails or phone numbers.** When you respond to a listing or message someone on The Porch, the conversation happens entirely within NYC Classifieds. Your personal contact information is never visible to other users unless you choose to share it.

This protects you from spam, phishing, and unwanted contact outside the platform.

## Block and Report

Every user profile and every conversation includes block and report options. Blocking someone prevents them from seeing your posts or contacting you. Reporting triggers a review of their account and behavior.

## Account Consequences

We enforce a clear escalation path for users who violate our guidelines:

- **First offense:** Warning with explanation of the violation
- **Repeated offenses:** Temporary suspension
- **Serious or continued violations:** Permanent ban

We don\'t issue empty warnings. Accounts that consistently break the rules get removed.

## Privacy Protections

**No behavioral tracking.** We don\'t track your browsing habits, build advertising profiles, or sell your data to third parties.

**HTTPS everywhere.** All data transmitted between your device and our servers is encrypted using HTTPS.

**Hashed passwords.** Your password is never stored in plain text. It\'s cryptographically hashed, meaning even we can\'t read it.

## The Full Picture

Verification, automated moderation, community flagging, private messaging, blocking, account enforcement, and strong privacy protections. That\'s not one feature. That\'s an entire safety architecture, designed so you can buy, sell, and connect without looking over your shoulder.`,
  },
  {
    slug: 'fake-apartment-scams-how-to-spot-them-2026',
    title: 'Fake Apartment Scams: How to Spot Them in 2026',
    date: '2026-02-04',
    author: 'The NYC Classifieds Team',
    category: 'Safety',
    tags: ['scams', 'apartments', 'housing', 'safety', 'NYC'],
    excerpt: 'NYC apartment scams have gotten smarter in 2026. AI-generated photos, cloned listings, and fake landlords are everywhere. Here\'s how to protect yourself.',
    content: `Finding an apartment in New York City is already brutal. The last thing you need is to lose a deposit to someone who doesn\'t own the place they\'re renting. But apartment scams in NYC are more sophisticated than ever, and they\'re catching smart people off guard.

## How the Scams Work Now

The old version was obvious: a too-good-to-be-true listing with stolen photos and a "landlord" who couldn\'t meet in person. The 2026 version is harder to spot.

**AI-generated apartment photos.** Scammers use image generators to create photos of apartments that look completely real but don\'t exist. The lighting is perfect, the furniture is staged, and there\'s not a single reverse-image match because the image was just created.

**Cloned legitimate listings.** A real apartment gets listed by the actual owner. A scammer copies the listing, changes the contact info, and posts it at a slightly lower price. You think you\'re talking to the owner. You\'re not.

**Fake landlord personas.** Scammers create entire fake identities with Google Voice numbers and professional email addresses. They\'ll answer your questions, schedule a showing, and then ask for a deposit to "hold" the apartment.

## Red Flags to Watch For

- **Below-market rent.** If a one-bedroom in the West Village is listed at $1,500, it\'s a scam. You know this. Trust what you know.
- **Money before keys.** Any request for a deposit, application fee, or first month\'s rent before you\'ve physically entered the apartment is a red flag. Legitimate landlords and brokers don\'t operate this way.
- **Can\'t meet in person.** The "landlord" is traveling, overseas, or otherwise unavailable to show the apartment. Every time. This is always a scam.
- **Pressure to act fast.** "Someone else is about to sign" or "I need the deposit today." Scammers manufacture urgency because they need you to act before you think.
- **Wire transfers or gift cards.** No legitimate landlord accepts payment via wire transfer, Venmo to a random account, or gift cards. Cash or a check made out to a verifiable management company. That\'s it.

## How to Protect Yourself

1. **Always see the apartment in person** before sending any money. No exceptions.
2. **Verify ownership.** Look up the building on NYC\'s ACRIS system or the Department of Buildings website. Confirm the person you\'re dealing with actually owns or manages the property.
3. **Reverse-image search listing photos.** If the photos show up on other listings with different addresses, walk away.
4. **Ask for specifics.** Request a photo of the apartment with a piece of paper showing today\'s date. Real owners can do this. Scammers cannot.
5. **Google the exact listing text.** Scammers copy and paste. If the same description appears on multiple sites, walk away.
6. **Never pay with untraceable methods.** Use a check made out to a named entity, or pay through a verified management company portal.

Take your time, verify everything, and trust your gut. If it feels wrong, it is wrong.`,
  },
  {
    slug: 'job-scams-targeting-new-yorkers-2026',
    title: 'Job Scams Targeting New Yorkers in 2026',
    date: '2026-02-03',
    author: 'The NYC Classifieds Team',
    category: 'Safety',
    tags: ['scams', 'jobs', 'employment', 'safety', 'NYC'],
    excerpt: 'Fake remote work offers, advance-fee schemes, and identity theft through phony job applications. Here\'s what to watch for in the NYC job market.',
    content: `The job market in New York is competitive, and scammers know it. They prey on people who are eager or just need a paycheck. Job scams in 2026 are more convincing than ever, hitting New Yorkers across every industry.

## The Fake Remote Work Offer

This is the most common one right now. You see a listing for a remote job that pays surprisingly well for minimal qualifications. Data entry, customer service, social media management. The "company" has a slick website. The "recruiter" is friendly and responsive.

Then they ask you to buy equipment through their vendor, or pay for training materials, or set up a direct deposit using your banking info.

**The rule is simple:** A real employer never asks you to pay for anything. Not equipment, not training, not a background check. If money flows from you to them before your first paycheck, it\'s a scam.

## The Advance Fee Scheme

You\'re "hired" after a quick interview. Before you start, you need to pay for a background check, certification, or software license. They might even send you a check to "cover expenses" and ask you to forward part of it somewhere else.

The check bounces. The money you forwarded is gone. And the job never existed.

**How to spot it:** Legitimate employers pay for their own background checks. They don\'t send you checks before you start working. And they definitely don\'t ask you to forward money to a third party.

## Identity Theft Through Applications

Some fake job listings exist solely to harvest personal information. The "application" asks for your Social Security number, bank account details, or copies of your ID. They\'re not hiring. They\'re stealing your identity.

**How to protect yourself:**

- Never provide your SSN on an initial application. Employers need it for tax purposes after you\'re hired, not before.
- Don\'t send copies of your driver\'s license or passport to someone you haven\'t met in person.
- Be suspicious of applications that ask for banking information upfront.

## Red Flags Across All Job Scams

- **Vague job descriptions.** If the listing doesn\'t explain what you\'ll be doing, it\'s probably not a real job.
- **No company name or a generic one.** "Global Enterprises LLC" with no web presence is not a real company.
- **Interviews over chat only.** Real employers want to see you, at least on video.
- **Too easy.** If you\'re "hired" after a five-minute chat with no references, something is off.
- **Pressure.** "We need an answer today." Legitimate employers give you time to decide.

## What to Do If You\'ve Been Targeted

1. Contact your bank immediately to freeze or reverse any transactions
2. Place a fraud alert on your credit reports through the three bureaus
3. File a report with the FTC at reportfraud.ftc.gov
4. Report the listing to the platform where you found it

Job hunting is stressful enough without predators in the mix. Verify every opportunity, and remember: you should never have to pay to get paid.`,
  },
  {
    slug: 'free-forever-and-we-mean-it',
    title: 'Free Forever -- And We Mean It',
    date: '2026-02-01',
    author: 'The NYC Classifieds Team',
    category: 'Updates',
    tags: ['free', 'business model', 'commitment', 'values'],
    excerpt: 'We get asked how we make money if everything is free. Fair question. Here\'s the real answer, the business model, and why charging users was never on the table.',
    content: `People ask us this all the time: "If it\'s free, what\'s the catch?"

There isn\'t one. But we understand the skepticism. The internet has trained everyone to assume that if you\'re not paying for the product, you are the product. That\'s not how we work.

## Why Free Matters

Classifieds only work when everyone participates. The moment you charge someone $5 to list a used bookshelf, you lose half your sellers. Lose half your sellers, and buyers stop coming because there\'s nothing to buy. The whole thing collapses.

The List understood this for 30 years. Posting was free, and that\'s why it worked. Then they started charging for certain categories and the ecosystem began to erode. The Feed\'s Garage Sale is technically free to list, but the algorithm buries your post unless you pay to boost it. Same result, different mechanism.

Free means everyone participates. And participation is the only thing that makes a classifieds platform worth using.

## The Actual Business Model

Here\'s how we plan to sustain NYC Classifieds without charging users:

**Local business advertising.** Small, clearly-labeled ads from NYC businesses that are relevant to the neighborhood you\'re browsing. Not pop-ups. Not tracking-based retargeting that follows you across the internet. Just a local coffee shop letting you know they exist. The kind of ad you might actually appreciate.

**Optional business tools.** Down the road, we\'ll offer paid features for businesses: promoted listings, analytics dashboards, verified business profiles with enhanced features. These are opt-in tools for commercial users. The core platform remains free for individuals.

**Keeping costs low.** We\'re a small team running lean. No downtown office. No bloated staff. Modern infrastructure means the cost of serving another user is marginal. We don\'t need to extract money from every interaction to stay alive.

## What We Will Never Do

This is the part we care about most:

- **Never charge individuals to post.** Not now, not when we have a million users, not ever.
- **Never sell user data.** Your browsing habits, your messages, your location history -- none of it is for sale.
- **Never paywall community features.** The Porch, messaging, alerts, recommendations -- always free.
- **Never use dark patterns to push paid features.** No guilt-tripping, no artificial limitations, no "upgrade to unlock" on basic functionality.

## The Principle

We think the platforms that came before us lost their way because they forgot who they were for. They started optimizing for advertisers and shareholders instead of users. Revenue became the product, and people became the resource.

We\'re building NYC Classifieds for New Yorkers. Full stop. If we can\'t figure out how to sustain that without compromising the experience, then we\'re not trying hard enough. But we can, and we will.

Free. Forever. No asterisk.`,
  },
  {
    slug: 'what-the-porch-taught-us-about-neighborhoods',
    title: 'What The Porch Taught Us About Neighborhoods',
    date: '2026-01-30',
    author: 'The NYC Classifieds Team',
    category: 'Community',
    tags: ['the porch', 'community', 'neighborhoods', 'insights', 'learnings'],
    excerpt: 'We built The Porch expecting one thing. Neighborhoods showed us something else entirely. Here\'s what actually happened when communities started using it.',
    content: `When we launched The Porch, we had theories about how people would use it. Recommendations would dominate. Lost and found would spike. Questions would trickle in.

We were partly right and mostly wrong. And what actually happened taught us more about NYC neighborhoods than any research ever could.

## Recommendations Took Off -- But Not the Way We Expected

We figured people would recommend restaurants and handymen. They do. But the recommendations that get the most engagement are the unexpected ones: a quiet corner in the park where nobody goes, the laundromat that actually folds things properly, which bodega has the best chopped cheese, the mechanic who won\'t rip you off.

New Yorkers don\'t need help finding the popular spots. They need help finding the hidden ones. The Porch became a repository of neighborhood secrets, and that\'s far more valuable than another Yelp clone.

## Questions Revealed What People Actually Need

The questions people post on The Porch paint a picture of daily life that no demographic survey captures:

- "Does anyone know a vet in Bed-Stuy that\'s open on Sundays?"
- "Is the C train still messed up at Jay Street?"
- "Who do I call about the hydrant that\'s been running for three days?"

These aren\'t the kinds of things you Google. They\'re the kinds of things you ask a neighbor. And that\'s exactly the gap The Porch fills. Hyper-local, time-sensitive, neighborhood-specific knowledge that only someone who lives there would know.

## Alerts Became the Most Urgent Post Type

We added alerts as a category almost as an afterthought. Turns out, they\'re critical. Package theft warnings, street closures, building inspections, water shutoffs, suspicious activity. People post these with genuine urgency, and their neighbors read them the same way.

Alerts turned The Porch from a nice-to-have into a need-to-have for some users. When you know your neighbors are watching out for your block, the whole thing feels different.

## What Didn\'t Work (Yet)

**Groups** are underused. Starting a group requires a critical mass of interested people, and we\'re not there yet in most neighborhoods. We\'re not worried about this one. Groups will grow as the user base grows.

**Events** are seasonal. January in NYC is not peak event season. We expect this to change dramatically when spring hits and every block has a stoop sale, a street fair, or a pop-up market.

## The Bigger Lesson

The Porch taught us that neighborhoods aren\'t just geographic boundaries. They\'re living communities with their own rhythms, needs, and personality. Bushwick\'s Porch looks nothing like the Upper East Side\'s Porch, and that\'s exactly right.

We built a tool. Neighborhoods made it theirs. That\'s the best outcome we could have hoped for.`,
  },
  {
    slug: 'security-isnt-a-feature-its-the-foundation',
    title: 'Security Isn\'t a Feature, It\'s the Foundation',
    date: '2026-01-28',
    author: 'The NYC Classifieds Team',
    category: 'Features',
    tags: ['security', 'verification', 'trust', 'architecture', 'design'],
    excerpt: 'Most platforms add safety features after something goes wrong. We built verification and trust systems before we built anything else. Here\'s why.',
    content: `When we started building NYC Classifieds, the first thing we wrote wasn\'t the listing page. It wasn\'t the search bar. It wasn\'t The Porch. It was the verification system.

That might sound backwards. Most startups build the product first and bolt on security later, usually after something bad happens and users start leaving. We did it the other way around, and it shaped everything that came after.

## The Trust Deficit

Every classifieds platform before us has a trust problem. The List became synonymous with scams. The Green App turned into a petri dish for neighborhood paranoia and thinly veiled complaints. The Feed\'s Garage Sale lets anyone with a Facebook account post anything, and their "verification" is just having a profile that\'s more than 30 days old.

The result is that people approach online classifieds with their guard up. They assume the listing might be fake, the seller might be a bot, and the whole thing might be a waste of time. That\'s not a user experience problem. That\'s a trust problem. And you can\'t solve a trust problem with better UI.

## Why Verification Comes First

We require GPS and selfie verification before a user can post a single thing. Not after their first listing. Not after someone flags them. Before they do anything at all.

This is intentional friction. We know it costs us some signups. Someone who just wants to quickly post something might bounce when they see the verification step. We accept that trade-off, because the users who complete verification are the ones we want on the platform.

Here\'s what verification gives us:

- **Every user is a real person.** Bots can\'t take selfies.
- **Every user is in NYC.** GPS doesn\'t lie about your borough.
- **Every user has skin in the game.** Verification creates accountability. If you scam someone, you can\'t just make a new account.

## How It Shapes Everything Else

When you know every user is verified, you can make different design decisions:

**Messaging can be more open** because you\'re not worried about spam bots flooding inboxes. **Community features work better** because people behave differently when they\'re not anonymous. **Moderation is more effective** because bad actors can\'t hide behind throwaway accounts.

As we wrote about on day one, verification was always the starting point. Not because we\'re paranoid, but because trust is the foundation that everything else gets built on. A classifieds platform without trust is just a prettier version of the same broken thing.

## The Unsexy Truth

Security features aren\'t exciting. Nobody tweets about how great a verification flow is. But they\'re the difference between a platform people use once and a platform people rely on.

We\'d rather be the platform you trust than the platform that looks cool. If we can be both, great. But trust comes first. Always.`,
  },
  {
    slug: 'seo-for-a-brand-new-site',
    title: 'SEO for a Brand New Site',
    date: '2026-01-26',
    author: 'The NYC Classifieds Team',
    category: 'Updates',
    tags: ['SEO', 'search', 'growth', 'technical', 'strategy'],
    excerpt: 'How do you get Google to notice you when your domain is days old and you have zero backlinks? Here\'s our honest approach to SEO from scratch.',
    content: `Here\'s a fun challenge: launch a brand-new website and convince Google to show it to anyone. Your domain authority is zero. Your backlink profile is empty. You\'re competing against sites that have been around for 20 years.

This is our reality, and we\'re not pretending it\'s easy.

## The Starting Point

When you launch a new site in 2026, Google treats you like an unknown. And rightfully so. They have no reason to trust you yet. You could be a spam farm, a phishing site, or a fly-by-night operation that\'ll be gone in a month.

The only way to change that is to prove you\'re real, you\'re useful, and you\'re here to stay. There are no shortcuts. We tried none.

## What We Actually Did

**Structured data from day one.** Every listing, every Porch post, every neighborhood page includes proper schema markup. We use JSON-LD to tell search engines exactly what type of content they\'re looking at: local business listings, community posts, geographic pages. Google doesn\'t have to guess what we are.

**Unique pages for every neighborhood.** We didn\'t create one generic page for "NYC classifieds." We built 126 neighborhood-specific pages, each with its own URL, title, description, and content. When someone in Williamsburg searches for local classifieds, we want to be the answer for Williamsburg specifically.

**Clean URL structure.** Our URLs are human-readable and hierarchical: borough, neighborhood, category. Search engines parse this structure easily, and users can tell where a link will take them before they click.

**Fast load times.** We built on Next.js with server-side rendering. Pages load fast, even on a subway connection. Google explicitly uses page speed as a ranking factor, so this isn\'t optional.

**A real sitemap.** We generate and submit an updated sitemap that includes every active listing and community post. As new content goes live, Google knows about it quickly.

## What We\'re Not Doing

- **No keyword stuffing.** We write for humans. If the content is useful, the keywords take care of themselves.
- **No link schemes.** We\'re not buying backlinks or participating in link exchanges. The links we earn will come from being genuinely useful.
- **No AI-generated SEO content.** Every page on our site serves a real purpose for real users. We\'re not spinning up thousands of thin pages to game the algorithm.

## The Honest Timeline

A new site takes three to six months to build meaningful organic traffic. That\'s just reality. Domain authority grows slowly. Trust is earned through consistent presence and real content.

We\'re in month one. Our traffic from search is minimal. But we\'re laying the groundwork correctly, so that when Google does start trusting us, the foundation is solid.

As we noted in our launch post, we\'re building for the long game. SEO is no different.`,
  },
  {
    slug: 'the-notification-problem',
    title: 'The Notification Problem',
    date: '2026-01-24',
    author: 'The NYC Classifieds Team',
    category: 'Features',
    tags: ['notifications', 'design', 'UX', 'product'],
    excerpt: 'Push notifications are a double-edged sword. Send too many and people disable them. Send too few and they forget you exist. Here\'s how we\'re threading the needle.',
    content: `Every app wants to send you notifications. Your phone is a battlefield of red badges, buzzes, and banners, all competing for a sliver of your attention. Most of them are noise.

We refuse to be noise.

## The Problem

Notifications exist because apps need to pull you back. But most apps abuse this. The Green App sends you a notification every time someone two miles away complains about a dog. The Feed sends you notifications about posts from people you haven\'t talked to in ten years. Even your banking app is now sending "tips" about credit scores you didn\'t ask about.

The result is notification fatigue. People start ignoring everything, including the notifications that actually matter.

## Our Approach

We started by asking a simple question: what would a user genuinely want to be interrupted for?

The list is shorter than you\'d think:

- **Someone messaged you about your listing.** Yes, always. This is why you\'re here.
- **Your listing got a response.** You posted something for sale, someone\'s interested. That matters.
- **Someone replied to your Porch post.** You asked a question or shared a recommendation, and a neighbor responded.
- **A safety alert in your neighborhood.** If someone posts an urgent alert on The Porch about your block, you should know.

That\'s it. Four categories of notification. Everything else can wait until you open the app.

## What We Don\'t Notify About

- New listings in categories you\'ve browsed. That\'s not a notification. That\'s advertising.
- How many people viewed your profile. Nobody needs this interruption.
- "Your neighbors are active on The Porch!" We\'re not going to guilt you into opening the app.
- Weekly digest emails you didn\'t ask for. If you want a digest, you\'ll opt into one.

## The Design Decisions

**Bundling.** If you get five replies to a Porch post in an hour, you get one notification, not five. We bundle related activity so your phone isn\'t buzzing all afternoon.

**Timing.** We don\'t send notifications between 10pm and 8am unless it\'s a safety alert. Your sleep matters more than our engagement metrics.

**Easy controls.** Every notification type can be turned on or off individually. Don\'t want Porch notifications? Turn them off. Want only messages? Done. We make this obvious, not buried in a settings maze.

**Respectful defaults.** New users get a conservative default: messages and safety alerts only. You opt into more, not out of less.

## The Metric We Care About

Most apps measure notification engagement rates. How many people tapped the notification? We measure something different: how many people disabled notifications entirely? If that number is low, we\'re doing it right. It means every notification we send is worth receiving.

We\'d rather send one notification that matters than ten that get swiped away. That restraint is a feature, even if it doesn\'t show up on a spec sheet.`,
  },
  {
    slug: 'making-it-feel-alive-from-day-one',
    title: 'Making It Feel Alive From Day One',
    date: '2026-01-22',
    author: 'The NYC Classifieds Team',
    category: 'Updates',
    tags: ['launch', 'community', 'bootstrapping', 'strategy'],
    excerpt: 'The hardest part of launching a community platform isn\'t building it. It\'s making sure it doesn\'t feel like a ghost town when the first users show up.',
    content: `Here\'s the brutal truth about launching a platform that depends on user-generated content: if someone signs up and sees an empty page, they leave. And they don\'t come back.

This is the chicken-and-egg problem every marketplace and community platform faces. You need content to attract users, and you need users to create content. On day one, you have neither.

## The Ghost Town Problem

We knew from watching other platforms fail that the first impression is everything. A classifieds site with no listings is useless. A community board with no posts feels dead. Even if the product is great, an empty platform communicates one thing: nobody\'s here.

The Feed\'s Garage Sale didn\'t have this problem because they already had billions of users when they launched their marketplace. The Green App launched market by market and seeded each one with local data before opening it up. The List grew organically in the early internet days when competition didn\'t exist.

We don\'t have any of those advantages. We\'re a new platform in 2026, launching into a crowded market. So we had to be creative.

## How We Solved It

**Early content and community building.** Before we opened the platform to the public, we spent time building out initial content for each borough. Neighborhood descriptions, local resources, category pages with real structure. When someone lands on their neighborhood page for the first time, there\'s something there.

**Porch posts that set the tone.** We seeded The Porch with genuine recommendations, local questions, and neighborhood information to establish what the space is for. These aren\'t fake posts. They\'re real content about real neighborhoods, written to show people how The Porch works and what belongs there.

**Strategic category population.** We made sure every major category had at least some content at launch. Nobody should click "Jobs" and see zero results. Even a handful of listings makes the platform feel active and usable.

**Building in public.** This blog is part of the strategy. When people can see who\'s behind the platform, read about the decisions being made, and watch the product evolve, the platform feels like it has a pulse even when the user count is small.

## What We Didn\'t Do

We didn\'t fake engagement. We didn\'t create fake user accounts to make the numbers look bigger. We didn\'t inflate listing counts with garbage content. Trust is our foundation, and manufacturing fake activity would undermine everything we\'re building.

## The Transition

The early content was the spark. Real users are the fire. Every day, more organic listings and Porch posts appear from real verified New Yorkers. The ratio of seed content to organic content shifts a little more each day.

Eventually, the seed content will be buried under thousands of real posts, and nobody will remember or care that it was ever there. That\'s the goal. Get the engine running, then let the community take the wheel.

We\'re not there yet. But the engine is running. And that\'s the hardest part.`,
  },
  {
    slug: 'business-profiles-free-for-local-shops',
    title: 'Business Profiles -- Free for Local Shops',
    date: '2026-01-20',
    author: 'The NYC Classifieds Team',
    category: 'Features',
    tags: ['business', 'local', 'features', 'shops', 'free'],
    excerpt: 'NYC runs on small businesses. We built free business profiles so your local bodega, barber shop, and pizza place can have a real presence on the platform.',
    content: `New York City has over 200,000 small businesses. The bodega on your corner. The tailor who\'s been there for 40 years. The Dominican restaurant that doesn\'t need a Michelin star because the neighborhood already knows. These businesses are the fabric of every block in every borough.

Most of them have terrible online presence. And it\'s not their fault.

## The Problem for Local Businesses

Setting up a proper online profile is a headache most small business owners don\'t have time for. Google Business Profile is confusing. Yelp is pay-to-play. Building a website costs money and maintaining it costs more. Social media requires constant content creation.

The result? The best businesses in your neighborhood are often invisible online. They survive on foot traffic and word of mouth, which works until someone new moves in and doesn\'t know they exist.

## What We Built

Business profiles on NYC Classifieds are free. Completely free. A local business can create a verified profile that includes:

- **Business name and description.** Tell people what you do and why you\'re great.
- **Location and neighborhood.** Tied to our 126-neighborhood system, so you show up where your customers are.
- **Category and services.** Whether you\'re a plumber, a restaurant, a pet groomer, or a tax preparer, you\'re findable by what you do.
- **Contact information.** Phone, address, hours. The basics that people actually need.
- **Listing integration.** Post job openings, services, and special offers directly from your business profile.

## Why Free Matters Here

A bodega in the Bronx making $800 a day cannot afford monthly listing fees on ten different platforms. A freelance electrician in Queens shouldn\'t have to choose between paying for a Yelp ad and buying materials for a job.

When we said free forever, we meant it for businesses too. The basic business profile, posting listings, and being discoverable on the platform costs nothing.

## How It Connects to The Porch

This is where it gets interesting. Business profiles are linked to The Porch at the neighborhood level. When someone on The Porch asks "does anyone know a good plumber in Flatbush?" a verified plumber in Flatbush can respond from their business profile.

That\'s word-of-mouth at scale. The recommendation comes from a real neighbor, and the business has a real profile to back it up. No advertising budget required. Just being good at what you do and being present in your neighborhood.

## What\'s Coming for Businesses

We\'re building optional paid tools for businesses that want more: analytics on profile views, promoted placement in search results, and enhanced profile features. But these are extras. The foundation is free, and the foundation is enough for most local shops.

The goal is simple. If you run a business in NYC, your neighbors should be able to find you without paying an algorithm for the privilege. That\'s what business profiles do.`,
  },
  {
    slug: 'mobile-first-because-nyc-walks',
    title: 'Mobile-First, Because NYC Walks',
    date: '2026-01-18',
    author: 'The NYC Classifieds Team',
    category: 'Updates',
    tags: ['mobile', 'design', 'UX', 'responsive', 'NYC'],
    excerpt: 'New Yorkers use their phones while walking, riding the subway, and waiting in line at the bodega. We designed every screen for that reality.',
    content: `New York is a mobile-first city whether anyone planned it that way or not. People browse apartments on the A train. They check listings while waiting for a dollar slice. They post on The Porch from a park bench in Prospect Park.

Nobody is sitting at a desktop computer to browse local classifieds. And if they are, they\'re in the minority. We designed for the majority.

## Designing for the Subway

Half of our users will have a spotty connection at best. Underground stations, tunnel dead zones, the weird stretch of the L train between First Ave and Bedford where your signal just vanishes.

So we optimized for it:

- **Fast initial load.** Server-side rendering means the page arrives with content already in place. You\'re not staring at a spinner while JavaScript bootstraps.
- **Lightweight pages.** We stripped out unnecessary scripts, oversized assets, and anything that doesn\'t serve the user directly. Every kilobyte matters when you\'re on a single bar of LTE.
- **Graceful degradation.** If your connection drops mid-browse, you don\'t lose what you were looking at. The page stays rendered. When the connection comes back, things pick up where they left off.

## One-Thumb Design

Watch any New Yorker use their phone and you\'ll notice something: they\'re using one thumb. The other hand is holding a coffee, a bag, or a subway pole. Our entire interface was designed for one-handed use.

- **Navigation at the bottom** of the screen, not the top. Your thumb can reach it without a hand-gymnastics routine.
- **Large tap targets.** Buttons and links are sized for a moving thumb on a bouncing train, not a precise mouse click.
- **Swipeable interfaces** where it makes sense. Browsing categories, navigating between listings, moving through photos when we add them.

## The Responsive Approach

We\'re not maintaining two separate designs. The same codebase renders appropriately whether you\'re on an iPhone SE or a 27-inch monitor. But the phone experience isn\'t a shrunken version of the desktop experience. It\'s the primary experience.

On mobile, we prioritize:

- **Content over chrome.** Less navigation, more listings and posts. Menus collapse. Sidebars disappear. The content is the interface.
- **Speed over visual flair.** Animations are minimal. Transitions are fast. Nothing bounces or slides that doesn\'t need to.
- **Touch over hover.** No dropdown menus that require hovering. No tooltips that only work with a mouse. Everything is tappable.

## Why This Matters

The List was built for a desktop era and never evolved. It still looks like it was designed in 2003. The Feed\'s Garage Sale is mobile-friendly, but it\'s buried inside an app that does 47 other things and drains your battery tracking your location in the background.

We built a focused mobile experience for one purpose: connecting New Yorkers with their neighborhoods. No bloat, no tracking, no battery drain. Design for the hand that\'s holding the subway pole.`,
  },
  {
    slug: 'search-that-actually-works',
    title: 'Search That Actually Works',
    date: '2026-01-16',
    author: 'The NYC Classifieds Team',
    category: 'Features',
    tags: ['search', 'features', 'neighborhoods', 'UX', 'product'],
    excerpt: 'We built search that filters by neighborhood, category, and recency because finding a couch in your borough shouldn\'t require scrolling through listings in Staten Island.',
    content: `Search on most classifieds platforms is broken. Not in the "it doesn\'t return results" way, but in the "it returns 500 results and none of them are relevant" way.

On The List, searching for "couch" in New York returns results from New Jersey, Westchester, and Connecticut mixed in with actual NYC listings. The Feed\'s Garage Sale shows you results based on what its algorithm thinks you want, which usually means promoted listings from people paying for visibility. The Green App barely has search at all.

We wanted to fix this from the ground up.

## Neighborhood-First Search

When you search on NYC Classifieds, your results are localized by default. If you\'re verified in Astoria, your search starts in Astoria. You can expand to all of Queens, all of NYC, or narrow down to a specific neighborhood. But the default is your neighborhood, because that\'s usually what you care about.

This seems obvious. It apparently wasn\'t to anyone who came before us.

## Filtering That Makes Sense

Search results can be filtered by:

- **Category.** Looking for furniture? Don\'t wade through job listings to find it.
- **Borough.** Expand or narrow your geographic scope.
- **Neighborhood.** The most granular filter. Show me what\'s available on my block, not across the river.
- **Recency.** Sort by newest first, because a listing from three weeks ago is probably sold. We default to recent because stale results waste everyone\'s time.

## How We Built It

Under the hood, search is powered by the same structured data we use for everything else. Every listing has a category, a borough, a neighborhood, and a timestamp. This isn\'t full-text search thrown at an unstructured database. It\'s filtered, categorized, and geographically scoped from the moment a listing is created.

The technical choice matters because it means search is fast. There\'s no complex query hitting an overloaded database. The filters narrow the result set before the search even runs. You get relevant results in milliseconds, even on mobile.

## Searching The Porch

Search isn\'t limited to classifieds. You can also search The Porch for community content. Looking for restaurant recommendations in your neighborhood? Search The Porch. Want to know if anyone has posted about a plumber in the last week? Search The Porch.

This turns months of community knowledge into a searchable archive. Every recommendation, every answered question, every local tip is findable.

## What\'s Next for Search

We\'re building saved searches, which we mentioned in our roadmap post. Set your criteria and get notified when something matches. This is especially useful for apartment hunters who need to jump on new listings fast.

We\'re also working on better search suggestions and autocomplete, so the platform helps you find what you\'re looking for even when you\'re not sure how to phrase it.

Search should be simple. Type what you want, see what\'s near you. That\'s it. Everything else is just getting out of the way.`,
  },
  {
    slug: 'moderation-without-censorship',
    title: 'Moderation Without Censorship',
    date: '2026-01-14',
    author: 'The NYC Classifieds Team',
    category: 'Features',
    tags: ['moderation', 'community', 'safety', 'content', 'policy'],
    excerpt: 'We block spam, scams, and harassment before they go live. But we don\'t police opinions. Here\'s how we built moderation that keeps the platform clean without silencing anyone.',
    content: `Moderation is a tightrope. Too little and the platform drowns in spam and abuse. Too much and people feel like they can\'t speak freely. Most platforms fall off one side or the other.

The List fell off the "too little" side. Moderation was essentially nonexistent, and the platform became a wasteland of scams, spam, and content nobody wanted to see. The Green App fell off the "too much" side, algorithmically suppressing posts that generated reports, even when those reports were just neighbors disagreeing with each other.

We\'re trying to stay on the wire.

## What Gets Blocked Automatically

Our automated moderation system scans every listing and Porch post before publication. It catches and blocks:

- **Spam.** Duplicate posts, keyword stuffing, promotional floods.
- **Prohibited content.** Illegal items, weapons, controlled substances, anything that violates our terms.
- **Known scam patterns.** Phrases and structures commonly used in fraud: advance-fee language, fake check schemes, phishing URLs.
- **Harassment and hate speech.** Slurs, threats, targeted abuse. These never make it to the page.
- **Contact information in public fields.** Email addresses and phone numbers in listing descriptions where they don\'t belong. This protects users from having their contact info exposed to scrapers and spammers.

This all happens before a post goes live. If the system flags something, the post doesn\'t publish. The user gets a message explaining why and can edit and resubmit.

## What Doesn\'t Get Blocked

Opinions. Recommendations you disagree with. Negative reviews of businesses. Political views. Complaints about the neighborhood. Heated but non-abusive disagreements.

The Porch is a community space, and communities have disagreements. A neighbor who thinks the new restaurant on the corner is overpriced should be able to say so. Someone who thinks street parking should be eliminated can post that take without getting silenced.

We draw the line at abuse, not at disagreement.

## Community Flagging

Every post has a flag button. When a user flags something, it enters a review queue. We look at every flag, and we consider context. A post that gets flagged because people disagree with it gets left alone. A post that gets flagged because it\'s harassing someone gets removed.

Flagging is not a super-downvote button. It\'s a safety mechanism. We educate users about this distinction because the difference matters.

## Account Consequences

Users who consistently violate guidelines face escalating consequences: warnings, temporary suspensions, and ultimately permanent bans. We don\'t enjoy banning anyone, but we\'ll do it to protect the community.

## The Balance

Perfect moderation doesn\'t exist. We\'ll make mistakes. We\'ll probably block a legitimate post by accident. We\'ll probably miss something that should have been caught. When that happens, we fix it and adjust the system.

The goal isn\'t perfection. The goal is a platform where you feel safe posting and where your voice isn\'t suppressed for saying something unpopular. That\'s the line we walk, and we take it seriously.`,
  },
  {
    slug: 'why-messaging-had-to-stay-on-platform',
    title: 'Why Messaging Had to Stay On-Platform',
    date: '2026-01-12',
    author: 'The NYC Classifieds Team',
    category: 'Safety',
    tags: ['messaging', 'safety', 'privacy', 'design', 'security'],
    excerpt: 'We made a deliberate decision: no exposed phone numbers, no visible email addresses. Every conversation happens on NYC Classifieds. Here\'s why that matters more than convenience.',
    content: `On The List, you respond to a listing by emailing a anonymized address that forwards to the poster. In theory, this protects privacy. In practice, one reply reveals your real email, and from there it\'s open season for spam, phishing, and harassment.

On The Feed\'s Garage Sale, you message through Messenger, which means you\'re handing someone your full Facebook profile, your photo, your friends list, and years of personal information. All because you wanted to ask about a used desk.

We looked at both of these approaches and decided neither was acceptable.

## The Decision

All messaging on NYC Classifieds happens on-platform. No phone numbers are exchanged. No email addresses are exposed. No external messaging apps are required. You tap "Message" on a listing, type your question, and it goes to the seller within our system.

This wasn\'t the easy choice. Building a messaging system is significant engineering work. It would have been much simpler to slap an email link on each listing and call it done. But easy and right aren\'t the same thing.

## Why It Matters for Safety

**Your contact information stays private.** Until you decide to share your phone number or email in a conversation, the other person doesn\'t have it. If someone turns out to be a creep, a scammer, or just annoying, they can\'t reach you outside the platform.

**Block and report work properly.** When messaging is on-platform, blocking someone actually blocks them. They can\'t just text you instead, or email you from a different address. Block means block.

**There\'s a record.** If something goes wrong in a transaction, the conversation history exists on our platform. This matters for dispute resolution, for reporting bad actors, and for your own peace of mind.

**Scammers are contained.** On-platform messaging means scammers can\'t redirect you to WhatsApp, Telegram, or SMS where there\'s no oversight. If someone tries to move the conversation off-platform, that itself is a red flag.

## The Trade-Off

We know on-platform messaging adds a step. Some people would rather just get a phone number and text directly. We get it. And once you\'ve established trust with someone, you\'re free to share your contact information in the conversation if you choose to.

But the default should be safe, not convenient. Convenience without safety is how platforms end up with inboxes full of scam texts and phishing emails.

## How It Works

The messaging interface is straightforward. You see your conversations in one place, organized by listing or Porch post. Each conversation shows the other user\'s verified status. You can block or report from any conversation with one tap.

We don\'t read your messages or scan them for advertising keywords. The content of your conversations is between you and the person you\'re talking to. We only access message content if a report is filed and review is necessary.

Privacy and safety aren\'t in conflict here. On-platform messaging delivers both. That\'s why we built it this way.`,
  },
  {
    slug: 'the-porch-was-the-whole-point',
    title: 'The Porch Was the Whole Point',
    date: '2026-01-10',
    author: 'The NYC Classifieds Team',
    category: 'Features',
    tags: ['the porch', 'community', 'features', 'origin', 'vision'],
    excerpt: 'We named ourselves a classifieds platform, but The Porch is what we actually set out to build. Here\'s the origin of our community feature and why classifieds alone aren\'t enough.',
    content: `People assume we started with classifieds and added community features as an afterthought. It was actually the other way around.

The original idea for NYC Classifieds wasn\'t a better version of The List. It was a neighborhood platform where New Yorkers could actually connect with the people around them. Classifieds were a feature of that vision. The Porch was the vision itself.

## Why Classifieds Alone Don\'t Work

A classifieds platform is transactional by nature. Someone lists a thing. Someone else buys it. Transaction complete. Neither person has a reason to come back until they need to buy or sell again.

That model worked when The List was the only game in town. But transactional platforms are fragile. Users come and go. There\'s no stickiness, no community, no reason to check in regularly. The moment a competitor offers a slightly better experience, everyone leaves.

We wanted to build something people come back to even when they\'re not buying or selling anything. Something that becomes part of the rhythm of their week. That\'s The Porch.

## The Stoop Metaphor

If you\'ve lived in a brownstone neighborhood, you know what happens on the front stoop. People sit out in the evening and talk to whoever walks by. It\'s where you learn that the corner store changed owners, that the park is getting new benches, that someone on the third floor is moving and selling their AC unit.

The stoop is where transactions meet conversation. Where commerce meets community. That\'s exactly what The Porch is meant to be, except it works in high-rises, walk-ups, and neighborhoods without stoops too.

## Post Types With Purpose

We didn\'t just create a generic discussion board. Every post type on The Porch serves a specific neighborhood function:

- **Recommendations** share local knowledge
- **Questions** tap into collective neighborhood wisdom
- **Alerts** keep neighbors informed about urgent situations
- **Lost & Found** connects people with missing pets and belongings
- **Events** announce what\'s happening locally
- **Stoop Sales** bridge community and commerce
- **Volunteer** opportunities strengthen the neighborhood
- **Groups** help people find their people
- **Welcome** posts introduce new neighbors

Each type has its own purpose, its own format, and its own place in the neighborhood ecosystem.

## The Connection to Classifieds

The Porch and classifieds aren\'t separate products sharing a domain. They\'re deeply connected. A Porch recommendation can link to a business listing. A stoop sale post is essentially a classifieds listing with a community wrapper. A question about where to find a service leads directly to the services category.

The community creates demand for the marketplace, and the marketplace gives the community something tangible to organize around. They make each other better.

## The Name

We considered calling the whole platform "The Porch." We landed on NYC Classifieds because it\'s clearer what we do. But in our hearts, The Porch is still the whole point. The classifieds get people in the door. The Porch is why they stay.`,
  },
  {
    slug: '12-categories-zero-fees',
    title: '12 Categories, Zero Fees',
    date: '2026-01-08',
    author: 'The NYC Classifieds Team',
    category: 'Features',
    tags: ['categories', 'classifieds', 'features', 'listings', 'free'],
    excerpt: 'We organized NYC Classifieds into 12 categories that cover everything New Yorkers actually buy, sell, and trade. Every one of them is free to post in.',
    content: `When we sat down to build the classifieds engine, the first question was: what categories do New Yorkers actually need?

The List has hundreds of categories and subcategories, many of them obsolete or so niche they\'re empty. The Feed\'s Garage Sale barely has categories at all since everything gets dumped into one algorithmic stream. Neither approach works.

We landed on 12 categories. Enough to organize everything. Few enough that nothing feels empty.

## The Categories

**Housing.** Apartments for rent, rooms, sublets, short-term stays. This is the big one. The List built its empire on housing listings, and for good reason. Finding a place to live in NYC is everyone\'s first problem.

**Jobs.** Full-time, part-time, freelance, gig work. Local businesses hiring locally.

**For Sale.** Furniture, electronics, clothing, bikes, kitchen stuff, everything you own that you no longer need.

**Services.** Plumbers, movers, tutors, photographers, dog walkers, handymen. People offering their skills to the neighborhood.

**Vehicles.** Cars, motorcycles, scooters. Yes, some New Yorkers have cars.

**Community.** Events, activities, classes, meet-ups. What\'s happening near you.

**Pets.** Adoption, rehoming, pet services. We\'re strict here: no puppy mills, no commercial breeding operations.

**Free Stuff.** The best category. Things people are giving away because they\'re moving, decluttering, or just generous.

**Wanted.** The reverse of For Sale. You need something specific and you\'re putting the word out.

**Gigs.** Short-term work, one-off jobs, tasks that need doing. Distinct from Jobs because these are temporary and informal.

**Real Estate.** Commercial spaces, retail, office. Separate from Housing because the audience is different.

**Other.** Because no category system covers everything.

## Why These 12

We studied what New Yorkers actually post on existing platforms. We looked at the most active categories on The List NYC, the most common listing types on The Feed\'s Garage Sale, and the most frequent requests on The Green App.

Then we consolidated. Some categories that are separate on other platforms we combined because the audience overlap is near-total. Others we split because the use case is genuinely different.

The goal was: a new user should be able to look at the category list and immediately know where their listing belongs. No scrolling through 50 options. No guessing which subcategory is right. Twelve clear choices.

## Zero Fees Across All 12

Every category is free to post in. No premium categories. No "featured" tiers. No per-listing charges. Whether you\'re listing a studio apartment or giving away a bookshelf, it costs you nothing.

This matters because the platforms that start charging for certain categories inevitably create a two-tier system where paid listings get visibility and free listings get buried. We don\'t do tiers. Every listing gets the same treatment.

## What\'s Not a Category

We deliberately excluded some things: personal ads, adult services, firearms, anything illegal. These aren\'t categories we\'re willing to host, and our moderation system enforces that boundary.

Twelve categories. Everything a New Yorker needs. Nothing they don\'t. And every single one is free.`,
  },
  {
    slug: 'five-boroughs-126-neighborhoods',
    title: 'Five Boroughs, 126 Neighborhoods',
    date: '2026-01-06',
    author: 'The NYC Classifieds Team',
    category: 'Features',
    tags: ['neighborhoods', 'boroughs', 'geography', 'hyperlocal', 'NYC'],
    excerpt: 'NYC isn\'t one city. It\'s 126 neighborhoods, each with its own identity. We built the entire platform around that geography because hyperlocal is the only way classifieds work.',
    content: `Ask someone in Astoria where they live and they\'ll say Astoria, not Queens. Ask someone in Bed-Stuy and they\'ll say Bed-Stuy, not Brooklyn. New Yorkers identify with their neighborhoods more than their boroughs, and infinitely more than their city.

Every decision we made about NYC Classifieds starts from this fact.

## The Geography System

We mapped all five boroughs down to the neighborhood level. 126 neighborhoods across Manhattan, Brooklyn, Queens, the Bronx, and Staten Island. Every listing, every Porch post, and every user profile is tied to a specific neighborhood.

This isn\'t just a filter. It\'s the organizing principle of the entire platform.

When you browse classifieds, you see your neighborhood first. When you visit The Porch, you see posts from your neighbors, the actual people who live around you, not someone across the city. When you search for services, you find providers in your area.

## Why Hyperlocal Matters

**Relevance.** A couch for sale in Bay Ridge is not relevant to someone in Harlem. On The List, both listings show up in the same NYC-wide search. On The Feed\'s Garage Sale, you might see a listing from the Bronx because the algorithm decided you\'d be interested. We don\'t do that. Your default view is your neighborhood because that\'s what\'s actually useful to you.

**Trust.** When you can see that a seller is in your neighborhood, the transaction feels different. They\'re not a stranger on the internet. They\'re someone who walks the same blocks you do. Hyperlocal creates a level of accountability that city-wide platforms can\'t match.

**Community.** The Porch works because it\'s tied to neighborhoods. A recommendation for a great barber in Williamsburg is valuable to people in Williamsburg. Posting it to all of Brooklyn dilutes it. Posting it to all of NYC makes it useless.

## How We Defined the Neighborhoods

Defining NYC\'s neighborhoods is contentious. Where does Bushwick end and East Williamsburg begin? Is NoMad a real neighborhood or a real estate marketing invention?

We used Census-defined neighborhood tabulation areas, community board boundaries, and the names residents actually use. When official maps and local identity disagreed, we sided with the locals. The result is 126 neighborhoods that reflect how New Yorkers think about their city, not how planners carve it up.

## Borough Pages

Each borough has its own landing page that aggregates listings and Porch activity across all its neighborhoods. This gives you a wider view when you want it, like when you\'re apartment hunting across all of Brooklyn or looking for a gig anywhere in Queens.

The hierarchy is intuitive: city, borough, neighborhood. Zoom in or zoom out depending on what you need.

## The Foundation of Everything

The neighborhood system isn\'t a feature we added. It\'s the architecture the entire platform is built on. Search, browsing, The Porch, notifications, business profiles, everything references this geography because it\'s the geography that matters.

Classifieds are local by definition. We just took "local" seriously and defined it the way New Yorkers do: by neighborhood.`,
  },
  {
    slug: 'day-1-verification-first',
    title: 'Day 1: Verification First',
    date: '2026-01-04',
    author: 'The NYC Classifieds Team',
    category: 'Updates',
    tags: ['verification', 'launch', 'security', 'trust', 'GPS', 'selfie'],
    excerpt: 'Before we built listings, search, or community features, we built verification. Here\'s why the first line of code we wrote was about proving you\'re real.',
    content: `Day one of building NYC Classifieds. The codebase is empty. The design doc is a mess of notes and sketches. We have a hundred things to build and limited time to build them.

So what do we build first?

Not the homepage. Not the listing form. Not the search bar. Not The Porch. We build verification.

## The Logic

Every problem with existing classifieds platforms traces back to one root cause: you don\'t know who you\'re dealing with. Is the seller real? Are they in NYC? Are they who they claim to be? On every other platform, the answer is "maybe, but probably not."

If we built classifieds first and added verification later, we\'d be building on a broken foundation. Every feature we added would inherit the trust deficit. Messaging would be plagued by spam. Listings would be polluted with fakes. The Porch would be overrun by bots.

So we started with verification. GPS location and selfie confirmation. Before a user can do anything on the platform, they prove two things: they\'re a real person, and they\'re in New York City.

## What We Built

**The GPS check.** When you sign up, your device shares its location. We confirm you\'re within the five boroughs. Not New Jersey. Not Westchester. Not a data center in Ohio. Actually in New York City.

**The selfie check.** You take a real-time photo confirming a human being is behind the screen, not a script auto-generating accounts. The selfie is used for verification and handled according to our privacy policy.

**The verification badge.** Once verified, every post and listing you create shows your status. Other users see at a glance that you\'ve been through the process.

## The Cost of This Decision

We knew this would cost us users. Every step of friction in a signup flow costs conversion. Some people would get to the verification step and bounce. Some would find it invasive. Some would simply not bother.

We accepted that trade-off. Here\'s why: the users we lose at the verification step are either people who don\'t care about trust, or people with something to hide. Neither group is who we\'re building for.

The users who complete verification are exactly who we want: real New Yorkers who are willing to prove it because they understand why it matters. They\'re the ones who will post legitimate listings, contribute to The Porch, and treat other users with respect.

## What It Made Possible

Starting with verification meant everything we built afterward could assume a baseline of trust. Messaging didn\'t need aggressive spam filtering because bots couldn\'t create accounts. Listings didn\'t need extensive fraud detection because every poster was a verified human in NYC. The Porch didn\'t need heavy-handed moderation because verified users behave better than anonymous ones.

Verification first wasn\'t the flashy choice. Nobody signs up for a platform because the verification flow is elegant. But it\'s the choice that made everything else work.

Day one. Line one. Trust first. Everything else follows.`,
  },
  {
    slug: 'were-building-something',
    title: 'We\'re Building Something',
    date: '2026-01-03',
    author: 'The NYC Classifieds Team',
    category: 'Updates',
    tags: ['announcement', 'launch', 'vision', 'NYC', 'platform'],
    excerpt: 'There\'s a gap in how New Yorkers connect locally. We\'re filling it with a free, geo-verified classifieds and community platform built specifically for the five boroughs.',
    content: `We\'re building a classifieds and community platform for New York City. That\'s the one-sentence version.

The longer version is that we looked at the tools available to 8 million New Yorkers for buying, selling, finding apartments, hiring help, and connecting with neighbors, and none of them are good enough.

## The Gap

New York has always been a city of word-of-mouth. You find your apartment through a friend. You find your plumber through a neighbor. You find your barber because someone at work told you about them.

The internet was supposed to make that easier. Instead, it made it worse. The platforms that exist are either overrun with scams, buried under algorithms, or so generic that they treat NYC like any other market.

There\'s no platform built specifically for New York City. One that understands the boroughs and neighborhoods. One that verifies users are actually here. One that combines classifieds with genuine community features. One that\'s free and plans to stay that way.

That\'s what we\'re building.

## What It Is

**NYC Classifieds** is a free platform for New Yorkers to post listings, find what they need, and connect with their neighborhoods. It has two core components:

**Classifieds.** Apartments, jobs, stuff for sale, services, free things, gigs. Organized by category, borough, and neighborhood. Every poster is geo-verified, which means every listing comes from a real person who\'s actually in NYC.

**The Porch.** A community space where neighbors share recommendations, ask questions, post alerts, announce events, and have the kinds of conversations that used to happen on the front stoop. Think of it as the neighborhood knowledge base that\'s always existed in people\'s heads, finally written down and shared.

## Who We Are

We\'re a small team of New Yorkers who got tired of the options. We\'re not funded by venture capital. We\'re not trying to become the next big tech platform. We\'re building a useful tool for the city we live in.

## What\'s Different

Three things separate us from everything else:

1. **Geo-verification.** Every user proves they\'re a real person in NYC with a GPS check and selfie. No bots. No scammers from out of state. No fake accounts.

2. **Neighborhood-level organization.** Everything is structured around NYC\'s actual neighborhoods, all five boroughs, 126 neighborhoods. Your experience is local by default.

3. **Free. Actually free.** No listing fees. No premium tiers for basic features. No paywalls on community features. Free to post, free to message, free to browse.

## What\'s Next

We\'re going to build this thing in public. This blog will document the process: what we\'re building, why we\'re making the decisions we\'re making, and what we learn along the way.

If you\'re a New Yorker who wants a better way to connect locally, you\'re in the right place. We\'re just getting started, and the best part is yet to come.

Stay tuned.`,
  },
  {
    slug: 'how-the-list-changed-everything-then-lost-its-way',
    title: 'How The List Changed Everything -- Then Lost Its Way',
    date: '2026-01-02',
    author: 'The NYC Classifieds Team',
    category: 'Community',
    tags: ['The List', 'history', 'classifieds', 'competition', 'decline'],
    excerpt: 'The List didn\'t just create online classifieds. It gave an entire generation a new way to find apartments, jobs, furniture, and each other. Then it stopped evolving.',
    content: `Before The List, finding an apartment in New York meant buying a newspaper, circling listings with a pen, and calling a number that might or might not be disconnected. Finding used furniture meant yard sales or knowing someone who was moving. Finding a job meant pounding pavement with a stack of resumes.

The List changed all of that overnight. And for a long time, it was genuinely great.

## The Golden Era

In the early 2000s, The List was a revelation. Free apartment listings. Free job postings. A "free stuff" section that was basically a treasure hunt. Missed connections. Gig postings for musicians, artists, and freelancers. An entire economy of exchange, all happening on a site that looked like it was designed in a text editor.

The simplicity was the feature. No accounts required. No algorithms. No tracking. You posted what you had or what you needed, and people found it. For a decade, "just check The List" was the answer to almost every practical question in NYC.

## Where It Went Wrong

The List stopped evolving. Literally. The interface hasn\'t meaningfully changed since its early days. What was charmingly minimalist in 2005 became stubbornly outdated by 2015.

But the design wasn\'t really the problem. The problems were deeper:

**Scams took over.** Without any user verification, The List became a playground for fraud. Fake apartment listings, phishing schemes, and advance-fee scams flooded every category. Responding to a listing became an exercise in risk assessment. "Is this real or am I about to get scammed?" shouldn\'t be the first question you ask about a couch.

**Moderation was nearly nonexistent.** Flagging existed, but enforcement was thin. Prohibited content would get taken down and reposted the same day.

**No trust signals.** Anyone could post anything with no verification, no accountability. You couldn\'t tell if a listing was from your neighbor or from someone in another state running a scheme.

**Mobile was an afterthought.** As smartphones became the primary way people accessed the internet, The List remained optimized for desktop browsers. Using it on a phone felt like trying to read a spreadsheet through a keyhole.

## The Impact of the Decline

As The List became unreliable, people scattered. Some went to The Feed\'s Garage Sale for buying and selling. Others tried The Green App for neighborhood connections. Some just gave up and went back to word-of-mouth.

But none of the replacements were as good as The List at its best. They each solved one piece of the puzzle while creating new problems. The Feed\'s Garage Sale has an algorithm that buries your listing unless you pay. The Green App has moderation issues of its own and no real classifieds functionality.

## The Lesson

The List proved that a free, simple, local classifieds platform is something people desperately want. It also proved that you can\'t build it once and walk away. Trust, moderation, and evolution aren\'t optional. They\'re what keep the thing alive.

We learned that lesson. We\'re building on it.`,
  },
  {
    slug: 'what-happened-to-the-platforms-that-worked',
    title: 'What Happened to the Platforms That Worked',
    date: '2026-01-01',
    author: 'The NYC Classifieds Team',
    category: 'Community',
    tags: ['origin story', 'platforms', 'history', 'NYC', 'competition'],
    excerpt: 'There was a time when The List, The Green App, and The Feed\'s Garage Sale actually worked. Here\'s what happened, and why we think there\'s room for something new.',
    content: `Every New Yorker has a story about finding something great on The List. A rent-stabilized apartment on the Upper West Side. A vintage leather jacket for $40. A gig playing bass at a Village bar that turned into a regular thing.

And every New Yorker has a story about The List burning them. The apartment that didn\'t exist. The seller who ghosted. The listing response that turned into a phishing attempt.

Those two stories explain everything about where we are now.

## When They Worked

**The List** worked because it was simple, free, and local. No accounts, no algorithms. Just people posting what they had or needed. A bulletin board for the whole city.

**The Green App** worked because it connected neighbors in a way that felt genuine. People shared recommendations, warned about break-ins, organized block parties. For a brief window, it delivered on the promise of local social networking.

**The Feed\'s Garage Sale** worked because it had reach. Billions of users already on the parent platform meant no cold-start problem. Buying and selling became as easy as posting a status update.

## What Went Wrong

Each platform declined for different reasons, but the pattern is the same: they stopped serving users and started serving themselves.

**The List stopped evolving.** The site barely changed while the internet transformed around it. Scammers exploited the lack of verification. Moderation atrophied. What was once refreshingly simple became dangerously outdated.

**The Green App got weird.** Neighborhood conversations that once felt warm became toxic. Discussion devolved into complaint threads and passive-aggressive callouts. Features kept getting added that nobody asked for while the core experience degraded.

**The Feed\'s Garage Sale became a slot machine.** The algorithm took over. Your listing might reach 500 people or 5, and you had no way to control it. Boosted posts turned a free marketplace into pay-to-play. And your classifieds experience is constantly interrupted by unrelated content and ads.

## The Common Thread

All three started with something genuine: a desire to connect people locally. All three lost their way when they prioritized growth metrics, engagement algorithms, or simply stopped caring.

The gap they left is real. New Yorkers still need to find apartments, sell furniture, hire help, and connect with neighbors. The tools available are either broken, hostile, or both.

## Why We Think There\'s Room

We\'re not delusional about the challenge. Building a new platform against entrenched competitors is hard. Building one for a city as demanding as New York is harder.

But the demand is there. People want a classifieds platform that\'s free, safe, local, and built for their city. They want community features that bring neighbors together instead of pitting them against each other.

That\'s what we\'re building. Not a replacement for any one platform, but the thing all of them should have been.

Welcome to NYC Classifieds. We have work to do.`,
  },
]

export function getPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find(p => p.slug === slug)
}

export function getAllSlugs(): string[] {
  return blogPosts.map(p => p.slug)
}

export function getPostsByCategory(category: string): BlogPost[] {
  if (category === 'All Posts') return blogPosts
  return blogPosts.filter(p => p.category === category)
}

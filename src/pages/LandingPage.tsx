import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Users,
  Wallet,
  Megaphone,
  Menu,
  X,
  Sparkles,
  Check,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RollioAnimatedLogo, RollioLogoHorizontal } from '@/components/RollioLogo';

const NAV_LINKS = [
  { label: 'Product', href: '#features' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Pricing', href: '#pricing' },
];

const FEATURES = [
  {
    icon: Search,
    title: 'Discover',
    description:
      'Find the right creators in seconds with AI-powered search across audience, engagement, and brand fit — not just follower counts.',
  },
  {
    icon: Users,
    title: 'Manage',
    description:
      'A CRM built for creators. Track conversations, contracts, and campaign status in one shared workspace your whole team can see.',
  },
  {
    icon: Wallet,
    title: 'Pay',
    description:
      'One-click global payouts. Pay every creator in their local currency without spreadsheets or wire transfers.',
  },
];

const STEPS = [
  { icon: Search, title: 'Search', description: 'Search thousands of creators by niche, audience, and engagement.' },
  { icon: Users, title: 'Manage', description: 'Move creators through your pipeline — outreach, negotiation, contract.' },
  { icon: Megaphone, title: 'Campaign', description: 'Launch and track campaign deliverables in one shared view.' },
  { icon: Wallet, title: 'Pay', description: 'Pay every creator at once, globally, with a single click.' },
];

const PRICING = [
  {
    name: 'Starter',
    price: 39,
    blurb: 'For testing the waters',
    popular: false,
    features: ['Creator search & discovery', 'Unlimited CRM contacts', 'Email support'],
  },
  {
    name: 'Growth',
    price: 129,
    blurb: 'For active creator programs',
    popular: true,
    features: ['Everything in Starter', 'Priority creator matching', 'Campaign tracking tools', 'Priority support'],
  },
  {
    name: 'Scale',
    price: 249,
    blurb: 'For high-volume programs',
    popular: false,
    features: ['Everything in Growth', 'Dedicated account manager', 'Custom integrations'],
  },
];

const CREATOR_ROWS = [
  { name: 'Maya Lin', handle: '@mayalin', initials: 'ML', color: 'bg-primary', status: 'Paid' },
  { name: 'Jordan Reyes', handle: '@jordanreyes', initials: 'JR', color: 'bg-secondary', status: 'Active' },
  { name: 'Theo Park', handle: '@theopark', initials: 'TP', color: 'bg-muted-foreground', status: 'Pending' },
];

const STATUS_CLASSES: Record<string, string> = {
  Paid: 'bg-[hsl(var(--status-paid))]/15 text-[hsl(var(--status-paid))]',
  Active: 'bg-primary/10 text-primary',
  Pending: 'bg-[hsl(var(--status-pending))]/15 text-[hsl(var(--status-pending))]',
};

const FOOTER_LINKS = {
  Product: [
    { label: 'Features', href: '#features' },
    { label: 'How it works', href: '#how-it-works' },
    { label: 'Pricing', href: '#pricing' },
  ],
  Company: [
    { label: 'About', href: '#' },
    { label: 'Careers', href: '#' },
    { label: 'Contact', href: '#' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
  ],
};

function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <RollioLogoHorizontal size={32} />

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link to="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            Log in
          </Link>
          <Button asChild size="sm">
            <Link to="/signup">Get Started</Link>
          </Button>
        </div>

        <button
          type="button"
          className="text-foreground md:hidden"
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border/60 bg-background md:hidden">
          <div className="flex flex-col gap-4 px-6 py-4">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
            <div className="flex flex-col gap-3 border-t border-border/60 pt-4">
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                Log in
              </Link>
              <Button asChild size="sm">
                <Link to="/signup" onClick={() => setOpen(false)}>
                  Get Started
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden px-6 pt-16 pb-24 md:pt-24 md:pb-32">
      <div className="mx-auto grid max-w-6xl items-center gap-16 md:grid-cols-2">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs font-medium text-muted-foreground animate-fade-up">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Influencer marketing, simplified
          </div>

          <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl animate-fade-up delay-150">
            Your creator program,
            <br /> all in one place.
          </h1>

          <p className="mt-6 max-w-lg text-lg text-muted-foreground animate-fade-up delay-250">
            Rollio brings creator discovery, relationship management, and global payouts into a single
            dashboard — so your team can scale a creator program without spreadsheets.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center animate-fade-up delay-350">
            <Button asChild size="lg" className="text-base">
              <Link to="/signup">
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="ghost" className="text-base">
              <a href="#how-it-works">See how it works</a>
            </Button>
          </div>

          <p className="mt-6 text-sm text-muted-foreground animate-fade-up delay-400">
            No spreadsheets. No wire transfers. No guesswork.
          </p>
        </div>

        <div className="relative">
          <div aria-hidden className="absolute -top-12 -right-8 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
          <div aria-hidden className="absolute -bottom-16 -left-10 h-64 w-64 rounded-full bg-secondary/10 blur-3xl" />
          <div aria-hidden className="absolute inset-0 flex items-center justify-center opacity-[0.05]">
            <RollioAnimatedLogo size={340} />
          </div>

          <div className="relative mx-auto w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-2xl animate-fade-up delay-300">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <span className="text-sm font-semibold text-foreground">Creators</span>
              <span className="text-xs text-muted-foreground">This month</span>
            </div>

            <div className="mt-4 space-y-2">
              {CREATOR_ROWS.map((row) => (
                <div
                  key={row.name}
                  className="flex items-center justify-between rounded-lg px-2 py-2 hover:bg-muted/60"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold text-white ${row.color}`}
                    >
                      {row.initials}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{row.name}</p>
                      <p className="text-xs text-muted-foreground">{row.handle}</p>
                    </div>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_CLASSES[row.status]}`}>
                    {row.status}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between rounded-xl bg-primary/10 px-4 py-3">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Wallet className="h-4 w-4 text-primary" />
                Paid out this month
              </div>
              <span className="text-sm font-semibold text-foreground">$48,200</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section id="features" className="px-6 py-20 md:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Everything your creator program needs
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            From first outreach to final payout, Rollio replaces the spreadsheets and scattered tools with one
            workspace.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {FEATURES.map((feature, i) => (
            <div
              key={feature.title}
              className={`group rounded-2xl border border-border bg-card p-8 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl animate-fade-up delay-${
                (i + 1) * 100
              }`}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-xl font-semibold text-foreground">{feature.title}</h3>
              <p className="mt-2 text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-muted/40 px-6 py-20 md:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">How it works</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            From search to payout in four steps — built for teams running creator programs at scale.
          </p>
        </div>

        <div className="relative mx-auto mt-16 max-w-5xl">
          <div aria-hidden className="absolute left-[12.5%] top-6 hidden h-0.5 w-[75%] bg-border md:block" />
          <div className="relative grid gap-8 sm:grid-cols-2 md:grid-cols-4">
            {STEPS.map((step, i) => (
              <div key={step.title} className={`text-center animate-fade-up delay-${(i + 1) * 100}`}>
                <div className="relative mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-border bg-card text-primary shadow-sm">
                  <step.icon className="h-5 w-5" />
                  <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                    {i + 1}
                  </span>
                </div>
                <h3 className="mt-4 text-base font-semibold text-foreground">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <section id="pricing" className="px-6 py-20 md:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Simple, pay-as-you-go pricing
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Buy a credit pack, use it to discover and unlock creators. No subscriptions, no seat fees.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {PRICING.map((tier) => (
            <div
              key={tier.name}
              className={`relative rounded-2xl border bg-card p-8 ${
                tier.popular ? 'border-primary shadow-xl' : 'border-border'
              }`}
            >
              {tier.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                  Most popular
                </span>
              )}

              <h3 className="text-lg font-semibold text-foreground">{tier.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{tier.blurb}</p>

              <div className="mt-6 flex items-baseline gap-2">
                <span className="text-4xl font-bold text-foreground">${tier.price}</span>
                <span className="text-sm text-muted-foreground">credit pack</span>
              </div>

              <Button asChild className="mt-6 w-full" variant={tier.popular ? 'default' : 'outline'}>
                <Link to="/signup">Get Started</Link>
              </Button>

              <ul className="mt-6 space-y-3">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="mt-10 text-center text-sm text-muted-foreground">
          Every pack includes global payouts at a flat <span className="font-semibold text-foreground">3.99%</span>{' '}
          fee per transaction — no hidden costs, no monthly minimums.
        </p>
      </div>
    </section>
  );
}

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-card px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 md:grid-cols-[2fr_1fr_1fr_1fr]">
          <div>
            <RollioLogoHorizontal size={28} />
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              The intelligence and workflow platform for discovering, managing, and paying creators — all in one
              place.
            </p>
          </div>

          {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
            <div key={heading}>
              <h4 className="text-sm font-semibold text-foreground">{heading}</h4>
              <ul className="mt-4 space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="text-sm text-muted-foreground hover:text-foreground">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <p className="text-sm text-muted-foreground">© {year} Rollio, Inc. All rights reserved.</p>
          <p className="text-sm text-muted-foreground">Built for modern creator teams.</p>
        </div>
      </div>
    </footer>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-background">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <Pricing />
      <Footer />
    </div>
  );
}

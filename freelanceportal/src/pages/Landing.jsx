import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion'
import {
  ArrowRight,
  Check,
  ChevronRight,
  Clock3,
  CreditCard,
  FileText,
  FolderOpen,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react'

const heroImage =
  'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1800&q=80'

const highlightCards = [
  {
    label: 'Portal',
    title: 'One private link for every client.',
    text: 'Proposals, approvals, files, messages, contracts, and invoices stay together from day one.',
    image:
      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Payments',
    title: 'Deposits land before work starts.',
    text: 'Send a polished invoice right after approval and keep the next step obvious.',
    image:
      'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Delivery',
    title: 'Final files arrive with context.',
    text: 'Clients can review deliverables, ask for changes, and find the latest version without chasing links.',
    image:
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Brand',
    title: 'Your studio stays in front.',
    text: 'Custom domains, client-safe pages, and consistent details make solo work feel established.',
    image:
      'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80',
  },
]

const themes = [
  { name: 'Graphite', accent: '#1d1d1f', soft: '#f5f5f7' },
  { name: 'Pacific', accent: '#0071e3', soft: '#edf6ff' },
  { name: 'Forest', accent: '#167c55', soft: '#edf8f1' },
  { name: 'Coral', accent: '#d84a3a', soft: '#fff1ed' },
]

const details = [
  {
    icon: FileText,
    title: 'Proposals that become projects',
    text: 'Scope, timeline, acceptance, and deposits move from first yes to live work without rebuilding the same details.',
  },
  {
    icon: CreditCard,
    title: 'Invoices without loose ends',
    text: 'Payment status, reminders, and receipts stay visible to you and your client.',
  },
  {
    icon: FolderOpen,
    title: 'Deliverables with a home',
    text: 'Every file sits beside the project history, so the final handoff is easy to trust.',
  },
]

const plans = [
  {
    name: 'Starter',
    monthly: 15,
    yearly: 126,
    description: 'For freelancers who want a cleaner client handoff.',
    includes: [
      'Starter includes:',
      '3 active client portals',
      'Proposals and contracts',
      'Stripe payment collection',
      '5GB file storage',
      'FreelancePortal subdomain',
    ],
  },
  {
    name: 'Pro',
    monthly: 29,
    yearly: 242,
    description: 'For freelancers running every project through one branded space.',
    includes: [
      'Everything in Starter, plus:',
      'Unlimited client portals',
      'Custom domain',
      'Automated reminders',
      '20GB file storage',
      'Analytics dashboard',
    ],
    featured: true,
  },
  {
    name: 'Studio',
    monthly: 59,
    yearly: 499,
    description: 'For busy freelancers and tiny studios with deeper client operations.',
    includes: [
      'Everything in Pro, plus:',
      'Team access',
      'Advanced templates',
      'Priority support',
      '80GB file storage',
      'Client success setup',
    ],
  },
]

function Reveal({ children, delay = 0 }) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 28, scale: 0.985 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: false, amount: 0.24, margin: '-80px' }}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

function ScrollFloat({ children, className = '', distance = 34, direction = 1 }) {
  const ref = useRef(null)
  const shouldReduceMotion = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  const yRange = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [distance * direction, 0, distance * -direction],
  )
  const y = useSpring(yRange, { stiffness: 90, damping: 24, mass: 0.35 })

  return (
    <motion.div
      ref={ref}
      className={className}
      style={shouldReduceMotion ? { position: 'relative' } : { position: 'relative', y }}
    >
      {children}
    </motion.div>
  )
}

function GlobalNav() {
  return (
    <header className="apple-global-nav">
      <Link className="apple-brand" to="/" aria-label="FreelancePortal home">
        <span className="apple-brand-mark">F</span>
        <span>FreelancePortal</span>
      </Link>
      <nav className="apple-nav-links" aria-label="Primary navigation">
        <a href="#highlights">Highlights</a>
        <a href="#closer">Details</a>
        <a href="#pricing">Pricing</a>
        <a href="#faq">FAQ</a>
      </nav>
      <div className="apple-nav-actions">
        <Link to="/login">Sign in</Link>
        <Link to="/register">Start</Link>
      </div>
    </header>
  )
}

function GlassFilter() {
  return (
    <svg className="liquid-glass-filter" aria-hidden="true">
      <defs>
        <filter
          id="container-glass"
          x="0%"
          y="0%"
          width="100%"
          height="100%"
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.05 0.05"
            numOctaves="1"
            seed="1"
            result="turbulence"
          />
          <feGaussianBlur in="turbulence" stdDeviation="2" result="blurredNoise" />
          <feDisplacementMap
            in="SourceGraphic"
            in2="blurredNoise"
            scale="58"
            xChannelSelector="R"
            yChannelSelector="B"
            result="displaced"
          />
          <feGaussianBlur in="displaced" stdDeviation="3" result="finalBlur" />
          <feComposite in="finalBlur" in2="finalBlur" operator="over" />
        </filter>
      </defs>
    </svg>
  )
}

function LiquidLink({ children, className = '', href, to }) {
  const Comp = to ? Link : 'a'
  const props = to ? { to } : { href }

  return (
    <Comp className={`liquid-glass-button ${className}`} {...props}>
      <span className="liquid-glass-shadow" />
      <span className="liquid-glass-lens" />
      <span className="liquid-glass-content">{children}</span>
    </Comp>
  )
}

function PortalPreview({ theme, motionStyle, scrollLinked = false }) {
  return (
    <motion.div
      className="portal-preview"
      initial={scrollLinked ? { opacity: 0 } : { opacity: 0, y: 42, scale: 0.98 }}
      animate={scrollLinked ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
      style={{
        ...motionStyle,
        '--preview-accent': theme.accent,
        '--preview-soft': theme.soft,
      }}
    >
      <div className="portal-browser-bar">
        <span />
        <span />
        <span />
        <p>client.freelanceportal.app</p>
      </div>

      <div className="portal-preview-grid">
        <div className="portal-main-pane">
          <div className="portal-photo-shell">
            <img src={heroImage} alt="Minimal studio desk with laptop and workspace" />
            <div className="portal-project-copy">
              <p>Brand Identity Sprint</p>
              <h3>Acme Studio</h3>
            </div>
          </div>
        </div>

        <aside className="portal-side-pane">
          <div className="portal-status">
            <span>Project health</span>
            <strong>On track</strong>
          </div>
          <div className="portal-timeline">
            {['Proposal accepted', 'Deposit paid', 'Files ready'].map((item, index) => (
              <div key={item} className="portal-timeline-row">
                <span className={index < 2 ? 'is-complete' : ''}>
                  {index < 2 && <Check size={12} />}
                </span>
                <p>{item}</p>
              </div>
            ))}
          </div>
          <div className="portal-invoice">
            <p>Next invoice</p>
            <strong>EUR1,800</strong>
            <LiquidLink className="liquid-inline" to="/register">
              Send to client <ChevronRight size={14} />
            </LiquidLink>
          </div>
        </aside>
      </div>
    </motion.div>
  )
}

function Hero({ theme }) {
  const sectionRef = useRef(null)
  const shouldReduceMotion = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  })
  const copyY = useSpring(useTransform(scrollYProgress, [0, 1], [0, -54]), {
    stiffness: 90,
    damping: 24,
    mass: 0.35,
  })
  const copyOpacity = useTransform(scrollYProgress, [0, 0.72], [1, 0.18])
  const previewY = useSpring(useTransform(scrollYProgress, [0, 1], [0, 110]), {
    stiffness: 92,
    damping: 25,
    mass: 0.35,
  })
  const previewScale = useTransform(scrollYProgress, [0, 1], [1, 0.92])
  const previewRotate = useTransform(scrollYProgress, [0, 1], [0, -2.5])

  return (
    <section id="top" className="apple-hero" ref={sectionRef}>
      <motion.div
        className="apple-hero-copy"
        style={shouldReduceMotion ? undefined : { y: copyY, opacity: copyOpacity }}
      >
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
        >
          Client work, remastered.
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.06 }}
        >
          One link.
          <br />
          Every handoff.
        </motion.h1>
        <motion.div
          className="apple-hero-actions"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.12 }}
        >
          <LiquidLink className="liquid-hero" to="/register">
            Start free <ArrowRight size={16} />
          </LiquidLink>
          <a className="apple-text-link hero-sub-link" href="#highlights">
            Watch the flow <ChevronRight size={16} />
          </a>
        </motion.div>
      </motion.div>

      <PortalPreview
        theme={theme}
        scrollLinked
        motionStyle={
          shouldReduceMotion
            ? undefined
            : {
                y: previewY,
                scale: previewScale,
                rotateX: previewRotate,
                transformPerspective: 1100,
              }
        }
      />
    </section>
  )
}

function Highlights() {
  return (
    <section id="highlights" className="apple-section apple-highlights">
      <div className="apple-section-heading">
        <p>Get the highlights.</p>
        <h2>Less admin. More signal.</h2>
      </div>

      <div className="highlight-track" aria-label="FreelancePortal highlights">
        {highlightCards.map((card, index) => (
          <ScrollFloat
            key={card.title}
            className="highlight-scroll-item"
            distance={index % 2 === 0 ? 34 : 52}
            direction={index % 2 === 0 ? 1 : -1}
          >
            <Reveal delay={index * 0.06}>
              <article className="highlight-card">
                <img src={card.image} alt="" loading="lazy" />
                <div>
                  <p>{card.label}</p>
                  <h3>{card.title}</h3>
                  <span>{card.text}</span>
                </div>
              </article>
            </Reveal>
          </ScrollFloat>
        ))}
      </div>
    </section>
  )
}

function CloserLook({ theme, setTheme }) {
  return (
    <section id="closer" className="apple-section apple-closer">
      <div className="apple-section-heading compact">
        <Reveal>
          <p>Take a closer look.</p>
          <h2>A portal that feels like your studio.</h2>
        </Reveal>
      </div>

      <div className="closer-layout">
        <ScrollFloat distance={44}>
          <Reveal>
            <PortalPreview theme={theme} />
          </Reveal>
        </ScrollFloat>

        <ScrollFloat distance={38} direction={-1}>
          <Reveal delay={0.08}>
            <div className="theme-panel">
              <p>Brand mood</p>
              <h3>{theme.name}</h3>
              <div className="theme-swatches" role="list" aria-label="Brand theme selector">
                {themes.map((item) => (
                  <button
                    key={item.name}
                    type="button"
                    className={item.name === theme.name ? 'is-active' : ''}
                    onClick={() => setTheme(item)}
                    aria-label={`Use ${item.name} theme`}
                    style={{ '--swatch': item.accent }}
                  />
                ))}
              </div>
              <div className="theme-stat-list">
                <div>
                  <strong>12 min</strong>
                  <span>from approval to deposit request</span>
                </div>
                <div>
                  <strong>4 steps</strong>
                  <span>proposal, contract, payment, delivery</span>
                </div>
              </div>
            </div>
          </Reveal>
        </ScrollFloat>
      </div>
    </section>
  )
}

function Workflow() {
  return (
    <section id="workflow" className="apple-section apple-workflow">
      <div className="workflow-copy">
        <Reveal>
          <p>Built around the real client journey.</p>
          <h2>From first yes to final file, nothing gets lost.</h2>
          <span>
            FreelancePortal keeps the decision, agreement, money, messages, and deliverables in
            the same branded space. Clients always know what to do next.
          </span>
        </Reveal>
      </div>

      <div className="workflow-grid">
        {details.map((detail, index) => (
          <ScrollFloat
            key={detail.title}
            className={index === 2 ? 'workflow-float is-wide' : 'workflow-float'}
            distance={index === 2 ? 26 : 40}
            direction={index === 1 ? -1 : 1}
          >
            <Reveal delay={index * 0.08}>
              <article
                className={[
                  'workflow-item',
                  index === 1 ? 'is-green' : '',
                  index === 2 ? 'is-wide is-coral' : '',
                ].filter(Boolean).join(' ')}
              >
                <detail.icon size={26} />
                <h3>{detail.title}</h3>
                <p>{detail.text}</p>
              </article>
            </Reveal>
          </ScrollFloat>
        ))}
      </div>
    </section>
  )
}

function Effortless() {
  return (
    <section className="apple-section apple-effortless">
      <Reveal>
        <div className="effortless-hero">
          <div>
            <p>Effortless.</p>
            <h2>With deadline-ready power.</h2>
          </div>
          <LiquidLink className="liquid-ghost" to="/register">
            Start free <ChevronRight size={16} />
          </LiquidLink>
        </div>
      </Reveal>

      <div className="effortless-grid">
        <ScrollFloat distance={30}>
          <Reveal>
            <article className="metric-tile">
              <Clock3 size={28} />
              <h3>14 days</h3>
              <p>Free trial with no card required.</p>
            </article>
          </Reveal>
        </ScrollFloat>
        <ScrollFloat distance={46} direction={-1}>
          <Reveal delay={0.06}>
            <article className="metric-tile image-tile">
              <img
                src="https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80"
                alt="Bright office with desks prepared for focused work"
                loading="lazy"
              />
              <div>
                <Sparkles size={24} />
                <h3>White-label by default</h3>
                <p>Clients see your name, your domain, and your project details.</p>
              </div>
            </article>
          </Reveal>
        </ScrollFloat>
        <ScrollFloat distance={34}>
          <Reveal delay={0.12}>
            <article className="metric-tile">
              <ShieldCheck size={28} />
              <h3>Signed PDFs</h3>
              <p>Contracts are timestamped and stored beside the project.</p>
            </article>
          </Reveal>
        </ScrollFloat>
        <ScrollFloat distance={52} direction={-1}>
          <Reveal delay={0.18}>
            <article className="metric-tile">
              <MessageSquare size={28} />
              <h3>One thread</h3>
              <p>Project messages stay attached to the work they discuss.</p>
            </article>
          </Reveal>
        </ScrollFloat>
      </div>
    </section>
  )
}

function Pricing() {
  const [isYearly, setIsYearly] = useState(false)

  return (
    <section id="pricing" className="pricing-v4-section">
      <div className="pricing-v4-bg" />
      <div className="pricing-v4-grid-bg" />

      <div className="pricing-v4-heading">
        <Reveal>
          <p>Simple pricing.</p>
          <h2>Plans that fit the way you work.</h2>
          <span>
            Start lean, then unlock more portals, automation, storage, and branded client
            workflows when your pipeline grows.
          </span>
        </Reveal>

        <div className="pricing-v4-switch" aria-label="Billing period">
          <button
            type="button"
            className={!isYearly ? 'is-active' : ''}
            onClick={() => setIsYearly(false)}
          >
            Monthly
          </button>
          <button
            type="button"
            className={isYearly ? 'is-active' : ''}
            onClick={() => setIsYearly(true)}
          >
            Yearly <small>Save 30%</small>
          </button>
        </div>
      </div>

      <div className="pricing-v4-cards">
        {plans.map((plan, index) => (
          <Reveal key={plan.name} delay={index * 0.08}>
            <article className={plan.featured ? 'pricing-v4-card is-popular' : 'pricing-v4-card'}>
              {plan.featured && <span className="pricing-v4-badge">Best value</span>}
              <div className="pricing-v4-card-head">
                <h3>{plan.name}</h3>
                <div className="pricing-v4-price">
                  <strong>EUR{isYearly ? Math.round(plan.yearly / 12) : plan.monthly}</strong>
                  <span>/month</span>
                </div>
                {isYearly && <p className="pricing-v4-billed">EUR{plan.yearly}/year, billed annually</p>}
                <p>{plan.description}</p>
              </div>

              <LiquidLink
                className={plan.featured ? 'pricing-v4-cta' : 'pricing-v4-cta liquid-ghost'}
                to="/register"
              >
                Start free
              </LiquidLink>

              <div className="pricing-v4-includes">
                <h4>{plan.includes[0]}</h4>
                <ul>
                  {plan.includes.slice(1).map((feature) => (
                    <li key={feature}>
                      <span />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

function FAQ() {
  const [openItem, setOpenItem] = useState(0)
  const items = [
    ['Do clients need an account?', 'No. Clients open a secure link and complete the next step.'],
    ['Can I use my own domain?', 'Yes. Pro includes custom domain support for a branded portal.'],
    ['What happens after the trial?', 'Choose a plan, pause, or export the project details you need.'],
  ]

  return (
    <section id="faq" className="apple-section apple-faq">
      <div className="apple-section-heading compact">
        <Reveal>
          <p>Good to know.</p>
          <h2>Made for solo freelancers.</h2>
        </Reveal>
      </div>

      <div className="faq-list">
        {items.map(([question, answer], index) => {
          const isOpen = openItem === index

          return (
            <Reveal key={question}>
              <div className={isOpen ? 'faq-item is-open' : 'faq-item'}>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpenItem(isOpen ? -1 : index)}
                >
                  <span>{question}</span>
                  <motion.span
                    className="faq-icon"
                    animate={{ rotate: isOpen ? 90 : 0 }}
                    transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <ChevronRight size={18} />
                  </motion.span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      className="faq-answer"
                      initial={{ height: 0, opacity: 0, y: -6 }}
                      animate={{ height: 'auto', opacity: 1, y: 0 }}
                      exit={{ height: 0, opacity: 0, y: -6 }}
                      transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <p>{answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Reveal>
          )
        })}
      </div>
    </section>
  )
}

function FinalCTA() {
  return (
    <section className="apple-final">
      <Reveal>
        <Zap size={34} />
        <h2>Send one link. Look ready for the next client.</h2>
        <LiquidLink to="/register">
          Start free <ArrowRight size={16} />
        </LiquidLink>
      </Reveal>
    </section>
  )
}

function Footer() {
  return (
    <footer className="apple-footer">
      <div>
        <strong>FreelancePortal</strong>
        <p>Client portals for solo freelancers.</p>
      </div>
      <nav aria-label="Footer navigation">
        <a href="#highlights">Highlights</a>
        <a href="#pricing">Pricing</a>
        <Link to="/login">Sign in</Link>
      </nav>
    </footer>
  )
}

export default function Landing() {
  const [theme, setTheme] = useState(themes[1])

  return (
    <div className="apple-landing">
      <GlassFilter />
      <GlobalNav />
      <main>
        <Hero theme={theme} />
        <Highlights />
        <CloserLook theme={theme} setTheme={setTheme} />
        <Workflow />
        <Effortless />
        <Pricing />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  )
}

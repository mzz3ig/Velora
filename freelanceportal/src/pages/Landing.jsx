import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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
  ChevronDown,
  ChevronRight,
  Clock3,
  CreditCard,
  FileText,
  FolderOpen,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Star,
  Settings,
  LayoutDashboard,
  LogOut,
  UserRound,
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { isAdminEmail } from '../lib/admin'

const heroImage =
  'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1800&q=80'

const highlightCards = [
  {
    label: 'Portal',
    title: 'One private link for every client.',
    text: 'Proposals, approvals, files, messages, contracts, and invoices stay together from day one.',
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Payments',
    title: 'Deposits land before work starts.',
    text: 'Send a polished invoice right after approval and keep the next step obvious.',
    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Delivery',
    title: 'Final files arrive with context.',
    text: 'Clients can review deliverables, ask for changes, and find the latest version without chasing links.',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Brand',
    title: 'Your studio stays in front.',
    text: 'Custom domains, client-safe pages, and consistent details make solo work feel established.',
    image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80',
  },
]

const themes = [
  { name: 'Sky', accent: '#47bfff', soft: '#f5fbff' },
  { name: 'Violet', accent: '#7e14ff', soft: '#f8f5ff' },
  { name: 'Indigo', accent: '#4f46ff', soft: '#f6f7ff' },
  { name: 'Pearl', accent: '#863bff', soft: '#ffffff' },
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
      'Velora subdomain',
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

const testimonials = [
  { name: 'Ana Ribeiro', role: 'Brand Designer, Lisbon', text: 'Clients stopped asking "where do I sign?" The portal makes everything obvious.', stars: 5 },
  { name: 'Marco Silva', role: 'Freelance Developer', text: 'I went from 4 tools to one link. Setup took 20 minutes.', stars: 5 },
  { name: 'Sofia Lopes', role: 'Copywriter & Consultant', text: 'Getting paid faster was the first thing I noticed. No more chasing invoices.', stars: 5 },
]

function Reveal({ children, delay = 0 }) {
  const shouldReduceMotion = useReducedMotion()
  return (
    <motion.div
      initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 32, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.18, margin: '-60px' }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

function ScrollFloat({ children, className = '', distance = 34, direction = 1 }) {
  const ref = useRef(null)
  const shouldReduceMotion = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const yRange = useTransform(scrollYProgress, [0, 0.5, 1], [distance * direction, 0, distance * -direction])
  const y = useSpring(yRange, { stiffness: 90, damping: 24, mass: 0.35 })
  return (
    <motion.div ref={ref} className={className} style={shouldReduceMotion ? { position: 'relative' } : { position: 'relative', y }}>
      {children}
    </motion.div>
  )
}

function GlassFilter() {
  return (
    <svg className="liquid-glass-filter" aria-hidden="true">
      <defs>
        <filter id="container-glass" x="0%" y="0%" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.05 0.05" numOctaves="1" seed="1" result="turbulence" />
          <feGaussianBlur in="turbulence" stdDeviation="2" result="blurredNoise" />
          <feDisplacementMap in="SourceGraphic" in2="blurredNoise" scale="58" xChannelSelector="R" yChannelSelector="B" result="displaced" />
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

function GlobalNav() {
  const [session, setSession] = useState(null)
  const [profileOpen, setProfileOpen] = useState(false)
  const navigate = useNavigate()
  const userEmail = session?.user?.email || ''
  const isAdmin = isAdminEmail(userEmail)
  const privatePath = isAdmin ? '/admin/overview' : '/app/dashboard'
  const settingsPath = isAdmin ? '/admin/config' : '/app/settings'
  const displayName = session?.user?.user_metadata?.first_name
    || userEmail.split('@')[0]
    || 'Account'

  useEffect(() => {
    let mounted = true

    supabase.auth.getSession().then(({ data }) => {
      if (mounted) setSession(data.session)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (mounted) setSession(nextSession)
    })

    return () => {
      mounted = false
      listener.subscription.unsubscribe()
    }
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    setProfileOpen(false)
    navigate('/')
  }

  return (
    <header className="apple-global-nav">
      <Link className="apple-brand" to="/" aria-label="Velora home">
        <img src="/velora-logo-wordmark.png" alt="Velora" style={{ width: 206, height: 54, objectFit: 'contain' }} />
      </Link>
      <nav className="apple-nav-links" aria-label="Primary navigation">
        <a href="#highlights">Product</a>
        <a href="#closer">Portal</a>
        <a href="#pricing">Pricing</a>
        <a href="#faq">FAQ</a>
      </nav>
      <div className="apple-nav-actions">
        {session ? (
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setProfileOpen(open => !open)}
              className="nav-cta"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, border: 'none', cursor: 'pointer' }}
            >
              <UserRound size={15} />
              {displayName}
              <ChevronDown size={14} />
            </button>
            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.98 }}
                  transition={{ duration: 0.18 }}
                  className="glass"
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: 'calc(100% + 10px)',
                    width: 230,
                    borderRadius: 8,
                    padding: 8,
                    zIndex: 200,
                    boxShadow: 'var(--glass-inset), var(--glass-shadow)',
                  }}
                >
                  <div style={{ padding: '9px 10px 11px', borderBottom: '1px solid var(--border-light)', marginBottom: 6 }}>
                    <div style={{ fontWeight: 800, fontSize: '0.86rem', color: 'var(--text-primary)' }}>{displayName}</div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userEmail}</div>
                  </div>
                  <Link to={settingsPath} onClick={() => setProfileOpen(false)} className="nav-dropdown-link">
                    <Settings size={14} /> Settings
                  </Link>
                  <Link to={privatePath} onClick={() => setProfileOpen(false)} className="nav-dropdown-link">
                    <LayoutDashboard size={14} /> {isAdmin ? 'Managing area' : 'Private area'}
                  </Link>
                  <button type="button" onClick={signOut} className="nav-dropdown-link nav-dropdown-button">
                    <LogOut size={14} /> Sign out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <>
            <Link to="/login" className="nav-sign-in">Sign in</Link>
            <Link to="/register" className="nav-cta">Start free →</Link>
          </>
        )}
      </div>
    </header>
  )
}

function HeroOrb() {
  return (
    <div className="hero-orb-wrap" aria-hidden="true">
      <motion.div
        className="hero-orb hero-orb-1"
        animate={{ scale: [1, 1.12, 1], opacity: [0.5, 0.7, 0.5] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="hero-orb hero-orb-2"
        animate={{ scale: [1, 1.08, 1], opacity: [0.4, 0.6, 0.4] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />
      <motion.div
        className="hero-orb hero-orb-3"
        animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
      />
    </div>
  )
}

function DottedCloud() {
  const canvasRef = useRef(null)
  const wrapRef = useRef(null)
  const shouldReduceMotion = useReducedMotion()

  useEffect(() => {
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    if (!canvas || !wrap) return undefined

    const context = canvas.getContext('2d')
    if (!context) return undefined

    let frame = 0
    let width = 0
    let height = 0
    let animationFrame = 0
    let logoWidth = 1
    let logoHeight = 1
    let isReady = false
    const pointer = { x: 0, y: 0, active: false }
    const dots = []
    const dotCount = 5200

    const random = (index) => {
      const value = Math.sin(index * 999.13) * 10000
      return value - Math.floor(value)
    }

    const buildLogoDots = (image) => {
      const sampler = document.createElement('canvas')
      const sampleContext = sampler.getContext('2d', { willReadFrequently: true })
      if (!sampleContext) return

      logoWidth = image.naturalWidth
      logoHeight = image.naturalHeight
      sampler.width = logoWidth
      sampler.height = logoHeight
      sampleContext.drawImage(image, 0, 0)

      const pixels = sampleContext.getImageData(0, 0, logoWidth, logoHeight).data
      const candidates = []

      for (let y = 0; y < logoHeight; y += 2) {
        for (let x = 0; x < logoWidth; x += 2) {
          const offset = (y * logoWidth + x) * 4
          const alpha = pixels[offset + 3]
          if (alpha > 42) {
            candidates.push({
              x,
              y,
              r: pixels[offset],
              g: pixels[offset + 1],
              b: pixels[offset + 2],
              alpha: alpha / 255,
            })
          }
        }
      }

      dots.length = 0
      for (let index = 0; index < dotCount; index += 1) {
        const source = candidates[Math.floor(random(index + 12) * candidates.length)]
        dots.push({
          x: source.x / logoWidth - 0.5,
          y: source.y / logoHeight - 0.5,
          r: source.r,
          g: source.g,
          b: source.b,
          alpha: source.alpha,
          drift: random(index + 6) * Math.PI * 2,
          size: 0.45 + random(index + 7) * 1.35,
        })
      }

      isReady = true
    }

    const resize = () => {
      const rect = wrap.getBoundingClientRect()
      const ratio = Math.min(window.devicePixelRatio || 1, 2)
      width = Math.max(1, rect.width)
      height = Math.max(1, rect.height)
      canvas.width = Math.floor(width * ratio)
      canvas.height = Math.floor(height * ratio)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
    }

    const movePointer = (event) => {
      const rect = wrap.getBoundingClientRect()
      pointer.x = event.clientX - rect.left
      pointer.y = event.clientY - rect.top
      pointer.active = true
    }

    const clearPointer = () => {
      pointer.active = false
    }

    const draw = () => {
      context.clearRect(0, 0, width, height)
      if (!isReady) {
        animationFrame = requestAnimationFrame(draw)
        return
      }

      const centerX = width / 2
      const centerY = height / 2
      const logoScale = Math.min((width * 0.86) / logoWidth, (height * 0.76) / logoHeight)
      const time = frame * 0.012

      dots.forEach((dot) => {
        const floatX = shouldReduceMotion ? 0 : Math.cos(time * 0.75 + dot.drift) * 1.7
        const floatY = shouldReduceMotion ? 0 : Math.sin(time * 0.8 + dot.drift) * 1.7
        const baseX = centerX + dot.x * logoWidth * logoScale + floatX
        const baseY = centerY + dot.y * logoHeight * logoScale + floatY
        let drawX = baseX
        let drawY = baseY

        if (pointer.active) {
          const dx = baseX - pointer.x
          const dy = baseY - pointer.y
          const distance = Math.hypot(dx, dy)
          const reach = 86

          if (distance < reach) {
            const force = (1 - distance / reach) ** 2
            const angle = Math.atan2(dy, dx)
            drawX += Math.cos(angle) * force * 34
            drawY += Math.sin(angle) * force * 34
          }
        }

        context.beginPath()
        context.fillStyle = `rgba(${dot.r}, ${dot.g}, ${dot.b}, ${0.42 + dot.alpha * 0.42})`
        context.arc(drawX, drawY, dot.size, 0, Math.PI * 2)
        context.fill()
      })

      frame += 1
      if (!shouldReduceMotion) {
        animationFrame = requestAnimationFrame(draw)
      }
    }

    resize()
    const logo = new Image()
    logo.onload = () => buildLogoDots(logo)
    logo.src = '/velora-logo.png'
    draw()

    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(wrap)
    wrap.addEventListener('pointermove', movePointer)
    wrap.addEventListener('pointerleave', clearPointer)

    return () => {
      cancelAnimationFrame(animationFrame)
      resizeObserver.disconnect()
      wrap.removeEventListener('pointermove', movePointer)
      wrap.removeEventListener('pointerleave', clearPointer)
    }
  }, [shouldReduceMotion])

  return (
    <div className="dotted-cloud-wrap" ref={wrapRef}>
      <canvas ref={canvasRef} className="dotted-cloud-canvas" aria-hidden="true" />
    </div>
  )
}

function PortalPreview({ theme, motionStyle, scrollLinked = false }) {
  return (
    <motion.div
      className="portal-preview"
      initial={scrollLinked ? { opacity: 0, y: 24 } : { opacity: 0, y: 42, scale: 0.98 }}
      animate={scrollLinked ? { opacity: 1, y: 0 } : { opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.9, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
      style={{ ...motionStyle, '--preview-accent': theme.accent, '--preview-soft': theme.soft }}
    >
      <div className="portal-browser-bar">
        <span /><span /><span />
        <p>client.velora.app</p>
      </div>
      <div className="portal-preview-grid">
        <div className="portal-main-pane">
          <div className="portal-photo-shell">
            <img src={heroImage} alt="Studio workspace" />
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
            <strong>EUR 1,800</strong>
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
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] })
  const copyY = useSpring(useTransform(scrollYProgress, [0, 1], [0, -60]), { stiffness: 90, damping: 24, mass: 0.35 })
  const copyOpacity = useTransform(scrollYProgress, [0, 0.65], [1, 0])
  const previewY = useSpring(useTransform(scrollYProgress, [0, 1], [0, 120]), { stiffness: 92, damping: 25, mass: 0.35 })
  const previewScale = useTransform(scrollYProgress, [0, 1], [1, 0.9])
  const previewRotate = useTransform(scrollYProgress, [0, 1], [0, -3])

  return (
    <section id="top" className="apple-hero" ref={sectionRef}>
      <HeroOrb />

      <motion.div
        className="apple-hero-copy"
        style={shouldReduceMotion ? undefined : { y: copyY, opacity: copyOpacity }}
      >
        <motion.div
          className="hero-badge"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="hero-badge-dot" />
          Now in public beta · 120+ freelancers
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.08 }}
        >
          One link.<br />
          <span className="hero-h1-accent">Every handoff.</span>
        </motion.h1>

        <motion.p
          className="hero-subheadline"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.16 }}
        >
          Send your client one link. They sign, pay, download files, and message you —
          all in one branded space, no account required.
        </motion.p>

        <motion.div
          className="apple-hero-actions"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.22 }}
        >
          <Link to="/register" className="hero-cta-primary">
            Start for free <ArrowRight size={16} />
          </Link>
          <a className="hero-cta-ghost" href="#highlights">
            See how it works <ChevronRight size={15} />
          </a>
        </motion.div>

        <motion.div
          className="hero-trust"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.38 }}
        >
          {['14-day free trial', 'No credit card', 'Cancel anytime'].map(t => (
            <span key={t} className="hero-trust-item">
              <Check size={12} />
              {t}
            </span>
          ))}
        </motion.div>
      </motion.div>

      <PortalPreview
        theme={theme}
        scrollLinked
        motionStyle={shouldReduceMotion ? undefined : {
          y: previewY,
          scale: previewScale,
          rotateX: previewRotate,
          transformPerspective: 1200,
        }}
      />
    </section>
  )
}

function LogoBar() {
  const logos = ['Stripe', 'Notion', 'Figma', 'Webflow', 'Linear', 'Vercel']
  return (
    <div className="logo-bar">
      <p className="logo-bar-label">Integrates with your existing stack</p>
      <div className="logo-bar-track">
        {logos.map(name => (
          <span key={name} className="logo-bar-item">{name}</span>
        ))}
      </div>
    </div>
  )
}

function Highlights() {
  return (
    <section id="highlights" className="apple-section apple-highlights">
      <div className="apple-section-heading">
        <Reveal>
          <p>Get the highlights.</p>
          <h2>Less admin.<br />More signal.</h2>
        </Reveal>
      </div>
      <div className="highlight-track" aria-label="Velora highlights">
        {highlightCards.map((card, index) => (
          <ScrollFloat key={card.title} className="highlight-scroll-item" distance={index % 2 === 0 ? 34 : 52} direction={index % 2 === 0 ? 1 : -1}>
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
        <ScrollFloat distance={14}>
          <Reveal>
            <PortalPreview theme={theme} />
          </Reveal>
        </ScrollFloat>
        <ScrollFloat distance={12} direction={-1}>
          <Reveal delay={0.08}>
            <div className="theme-panel">
              <p>Brand mood</p>
              <h3>{theme.name}</h3>
              <div className="theme-swatches" role="list" aria-label="Brand theme selector">
                {themes.map(item => (
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
            Velora keeps the decision, agreement, money, messages, and deliverables in
            the same branded space. Clients always know what to do next.
          </span>
        </Reveal>
      </div>
      <div className="workflow-grid">
        {details.map((detail, index) => (
          <ScrollFloat key={detail.title} className={index === 2 ? 'workflow-float is-wide' : 'workflow-float'} distance={index === 2 ? 26 : 40} direction={index === 1 ? -1 : 1}>
            <Reveal delay={index * 0.08}>
              <article className={['workflow-item', index === 1 ? 'is-green' : '', index === 2 ? 'is-wide is-coral' : ''].filter(Boolean).join(' ')}>
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

function Testimonials() {
  return (
    <section className="testimonials-section">
      <Reveal>
        <p className="testimonials-label">What freelancers say</p>
      </Reveal>
      <div className="testimonials-grid">
        {testimonials.map((t, i) => (
          <Reveal key={t.name} delay={i * 0.1}>
            <article className="testimonial-card">
              <div className="testimonial-stars">
                {Array.from({ length: t.stars }).map((_, si) => (
                  <Star key={si} size={13} fill="currentColor" />
                ))}
              </div>
              <p className="testimonial-text">"{t.text}"</p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">{t.name[0]}</div>
                <div>
                  <strong>{t.name}</strong>
                  <span>{t.role}</span>
                </div>
              </div>
            </article>
          </Reveal>
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
              <img src="https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80" alt="Office workspace" loading="lazy" />
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
          <span>Start lean, then unlock more portals, automation, storage, and branded client workflows when your pipeline grows.</span>
        </Reveal>
        <div className={`pricing-v4-switch ${isYearly ? 'is-yearly' : 'is-monthly'}`} aria-label="Billing period">
          <button type="button" className={!isYearly ? 'is-active' : ''} onClick={() => setIsYearly(false)}>
            <span>Monthly</span>
          </button>
          <button type="button" className={isYearly ? 'is-active' : ''} onClick={() => setIsYearly(true)}>
            <span>Yearly <small>Save 30%</small></span>
          </button>
        </div>
      </div>
      <div className="pricing-v4-cards">
        {plans.map((plan, index) => (
          <Reveal key={plan.name} delay={index * 0.08}>
            <article className={plan.featured ? 'pricing-v4-card is-popular' : 'pricing-v4-card'}>
              {plan.featured && <span className="pricing-v4-badge">Most popular</span>}
              <div className="pricing-v4-card-head">
                <h3>{plan.name}</h3>
                <div className="pricing-v4-price">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.strong
                      key={`${plan.name}-${isYearly ? 'yearly' : 'monthly'}`}
                      initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
                      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                      exit={{ opacity: 0, y: -12, filter: 'blur(4px)' }}
                      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                    >
                      €{isYearly ? Math.round(plan.yearly / 12) : plan.monthly}
                    </motion.strong>
                  </AnimatePresence>
                  <span>/month</span>
                </div>
                <div className="pricing-v4-billing-slot">
                  <AnimatePresence mode="wait" initial={false}>
                    {isYearly && (
                      <motion.p
                        className="pricing-v4-billed"
                        key={`${plan.name}-billed-yearly`}
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                      >
                        €{plan.yearly}/year, billed annually
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
                <p>{plan.description}</p>
              </div>
              <LiquidLink className={plan.featured ? 'pricing-v4-cta' : 'pricing-v4-cta liquid-ghost'} to="/register">
                Start free
              </LiquidLink>
              <div className="pricing-v4-includes">
                <h4>{plan.includes[0]}</h4>
                <ul>
                  {plan.includes.slice(1).map(feature => (
                    <li key={feature}><span />{feature}</li>
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
  const [openItem, setOpenItem] = useState(null)
  const items = [
    ['What is Velora for?', 'Velora gives freelancers one branded client portal for proposals, contracts, invoices, project files, messages, and approvals. Instead of sending clients across email threads, payment links, shared drives, and PDF attachments, every step lives behind one clean link.'],
    ['Do clients need to create an account?', 'No. Clients can open their secure portal link and complete the next step without signing up. That keeps approvals, signatures, payments, and file handoffs simple for people who only work with you occasionally.'],
    ['Can I use Velora with my own brand?', 'Yes. You can add your logo, client-facing project details, and on supported plans use a custom domain. The client experience is designed to feel like your studio, not another tool they have to learn.'],
    ['Can I collect deposits and final payments?', 'Yes. Velora is built around real freelance workflows, so you can request deposits after approval, send invoices, track payment status, and keep receipts connected to the project history.'],
    ['Does Velora replace my project management app?', 'For client-facing work, usually yes. Velora is focused on the parts clients need to see: scope, contract, invoice, files, messages, and approvals. You can still keep internal planning in your own task system if you prefer.'],
    ['What happens to files and conversations after a project ends?', 'They stay attached to the client portal, so you and your client can find the final files, signed agreement, payment history, and project messages later without digging through old email threads.'],
    ['Is it only for designers?', 'No. Velora works for freelance designers, developers, copywriters, consultants, photographers, marketers, and small studios that need a more polished way to manage client handoffs.'],
    ['What happens after the trial?', 'You can choose a plan, pause, or export the project details you need. There is no lock-in, and you do not need a credit card to start the trial.'],
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
                <button type="button" aria-expanded={isOpen} onClick={() => setOpenItem(isOpen ? -1 : index)}>
                  <span>{question}</span>
                  <motion.span className="faq-icon" animate={{ rotate: isOpen ? 90 : 0 }} transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}>
                    <ChevronRight size={18} />
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div className="faq-answer" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}>
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
      <div className="final-cta-orb" aria-hidden="true" />
      <Reveal>
        <div className="final-cta-inner">
          <h2>Send one link.<br />Look ready for your next client.</h2>
          <p>Join 120+ freelancers already running their client ops through Velora.</p>
          <div className="final-cta-cloud" aria-label="Interactive dot sphere">
            <DottedCloud />
          </div>
          <div className="final-cta-actions">
            <Link to="/register" className="hero-cta-primary">
              Start for free <ArrowRight size={16} />
            </Link>
            <Link to="/login" className="final-cta-signin">Already have an account →</Link>
          </div>
        </div>
      </Reveal>
    </section>
  )
}

function Footer() {
  return (
    <footer className="apple-footer">
      <div className="footer-brand">
        <img src="/velora-logo-wordmark.png" alt="Velora" style={{ width: 214, height: 56, objectFit: 'contain' }} />
        <p>Client portals for solo freelancers.</p>
      </div>
      <nav className="footer-links" aria-label="Footer navigation">
        <a href="#highlights">Product</a>
        <a href="#pricing">Pricing</a>
        <a href="#faq">FAQ</a>
        <Link to="/login">Sign in</Link>
        <Link to="/register">Start free</Link>
      </nav>
      <p className="footer-copy">© 2026 Velora. All rights reserved.</p>
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
        <LogoBar />
        <Highlights />
        <CloserLook theme={theme} setTheme={setTheme} />
        <Workflow />
        <Testimonials />
        <Effortless />
        <Pricing />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  )
}

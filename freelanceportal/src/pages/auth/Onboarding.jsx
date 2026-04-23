import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import VeloraLoader from '../../components/ui/VeloraLoader'

const questions = [
  {
    id: 'business_type',
    title: 'What kind of work do you do?',
    options: ['Design studio', 'Web development', 'Marketing or content', 'Consulting', 'Creative agency', 'Other'],
    otherLabel: 'Tell us what you do',
  },
  {
    id: 'primary_goal',
    title: 'What do you want Velora to help with first?',
    options: ['Client portals', 'Proposals and contracts', 'Invoices and payments', 'Files and messages', 'Everything in one place', 'Other'],
    otherLabel: 'What should Velora help with?',
  },
  {
    id: 'client_status',
    title: 'How many active clients do you have right now?',
    options: ['None yet', '1-3 clients', '4-10 clients', '11-25 clients', 'More than 25 clients'],
  },
  {
    id: 'team_size',
    title: 'How big is your team?',
    options: ['Just me', '2-3 people', '4-10 people', '11-25 people', 'More than 25 people'],
  },
  {
    id: 'biggest_challenge',
    title: 'What feels most messy in your client workflow?',
    options: ['Following up', 'Getting approvals', 'Collecting payments', 'Finding files', 'Keeping clients updated', 'Other'],
    otherLabel: 'What feels messy?',
  },
  {
    id: 'referral_source',
    title: 'Where did you hear about Velora?',
    options: ['Google', 'LinkedIn', 'X / Twitter', 'YouTube', 'Friend or colleague', 'Other'],
    otherLabel: 'Where did you find us?',
  },
]

const initialAnswers = questions.reduce((acc, question) => {
  acc[question.id] = ''
  if (question.otherLabel) acc[`${question.id}_other`] = ''
  return acc
}, {})

export default function Onboarding() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState(initialAnswers)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const currentQuestion = questions[step]
  const selected = answers[currentQuestion.id]
  const otherKey = `${currentQuestion.id}_other`
  const needsOther = selected === 'Other'
  const canContinue = Boolean(selected) && (!needsOther || answers[otherKey]?.trim().length > 1)
  const progress = useMemo(() => ((step + 1) / questions.length) * 100, [step])

  useEffect(() => {
    let mounted = true

    supabase.auth.getUser().then(({ data }) => {
      if (!mounted) return

      if (!data.user) {
        navigate('/login', { replace: true })
        return
      }

      setUser(data.user)
      setLoading(false)
    })

    return () => {
      mounted = false
    }
  }, [navigate])

  const chooseOption = (value) => {
    setError('')
    setAnswers((current) => ({
      ...current,
      [currentQuestion.id]: value,
      ...(value !== 'Other' && currentQuestion.otherLabel ? { [otherKey]: '' } : {}),
    }))
  }

  const submit = async () => {
    if (!user || !canContinue) return

    setSaving(true)
    setError('')

    const payload = {
      user_id: user.id,
      business_type: answers.business_type,
      business_type_other: answers.business_type === 'Other' ? answers.business_type_other.trim() : null,
      primary_goal: answers.primary_goal,
      primary_goal_other: answers.primary_goal === 'Other' ? answers.primary_goal_other.trim() : null,
      client_status: answers.client_status,
      team_size: answers.team_size,
      biggest_challenge: answers.biggest_challenge,
      biggest_challenge_other: answers.biggest_challenge === 'Other' ? answers.biggest_challenge_other.trim() : null,
      referral_source: answers.referral_source,
      referral_source_other: answers.referral_source === 'Other' ? answers.referral_source_other.trim() : null,
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const { error: saveError } = await supabase
      .from('user_onboarding')
      .upsert(payload, { onConflict: 'user_id' })

    setSaving(false)

    if (saveError) {
      setError(saveError.message)
      return
    }

    window.dispatchEvent(new Event('velora:onboarding-complete'))
    navigate('/app/dashboard', { replace: true })
  }

  const goNext = () => {
    if (!canContinue) return
    if (step === questions.length - 1) {
      submit()
      return
    }
    setStep((current) => current + 1)
  }

  if (loading) {
    return (
      <div className="auth-page">
        <main className="auth-panel-wrap">
          <div style={{ display: 'grid', placeItems: 'center', padding: 24 }}>
            <VeloraLoader size={16} words={['setup', 'profile', 'workspace', 'almost', 'setup']} />
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="auth-page onboarding-page">
      <main className="auth-panel-wrap onboarding-wrap">
        <div className="auth-topbar onboarding-topbar">
          <Link to="/" className="auth-brand" aria-label="Velora home">
            <img src="/velora-logo-wordmark.png" alt="Velora" className="auth-brand-wordmark" />
          </Link>
          <span className="onboarding-step-count">{step + 1} of {questions.length}</span>
        </div>

        <section className="auth-panel onboarding-panel" aria-labelledby="onboarding-title">
          <div className="onboarding-progress" aria-hidden="true">
            <span style={{ width: `${progress}%` }} />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion.id}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
              className="onboarding-question"
            >
              <p className="onboarding-kicker">Quick setup</p>
              <h1 id="onboarding-title">{currentQuestion.title}</h1>
              <div className="onboarding-options">
                {currentQuestion.options.map((option) => (
                  <button
                    key={option}
                    type="button"
                    className={`onboarding-option ${selected === option ? 'selected' : ''}`}
                    onClick={() => chooseOption(option)}
                  >
                    <span>{option}</span>
                    {selected === option && <CheckCircle2 size={18} />}
                  </button>
                ))}
              </div>

              {needsOther && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="onboarding-other"
                >
                  <label htmlFor={otherKey}>{currentQuestion.otherLabel}</label>
                  <input
                    id={otherKey}
                    className="input"
                    value={answers[otherKey]}
                    onChange={(event) => setAnswers((current) => ({ ...current, [otherKey]: event.target.value }))}
                    placeholder="Write your answer"
                    autoFocus
                  />
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>

          {error && <p className="auth-alert auth-alert-error">{error}</p>}

          <div className="onboarding-actions">
            <button
              type="button"
              className="btn-secondary onboarding-back"
              disabled={step === 0 || saving}
              onClick={() => setStep((current) => current - 1)}
            >
              <ArrowLeft size={16} /> Back
            </button>
            <button
              type="button"
              className="btn-primary onboarding-next"
              disabled={!canContinue || saving}
              onClick={goNext}
            >
              {saving ? 'Saving...' : step === questions.length - 1 ? 'Finish setup' : 'Continue'}
              <ArrowRight size={16} />
            </button>
          </div>
        </section>
      </main>
    </div>
  )
}

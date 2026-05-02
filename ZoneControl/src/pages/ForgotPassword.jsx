import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiMail, FiArrowLeft, FiSend, FiCheck } from 'react-icons/fi'
import { supabase } from '../lib/supabase'
import '../styles/auth.css'

export default function ForgotPassword() {
  const [email, setEmail]     = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent]       = useState(false)
  const [error, setError]     = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setSent(true)
    setLoading(false)
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-content">

        {/* Logo */}
        <motion.div
          className="auth-logo"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="auth-logo-icon">
            <FiMail size={22} />
          </div>
          <h1 className="auth-title">FN Tracker</h1>
          <p className="auth-subtitle">Réinitialiser le mot de passe</p>
        </motion.div>

        {/* Card */}
        <motion.div
          className="auth-card"
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.15, duration: 0.5 }}
        >
          <AnimatePresence mode="wait">
            {!sent ? (

              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <p style={{
                  color: 'var(--text-secondary)',
                  fontSize: '0.88rem',
                  marginBottom: '1.5rem',
                  lineHeight: 1.6,
                }}>
                  Saisis ton adresse email et on t'envoie un lien pour réinitialiser ton mot de passe.
                </p>

                <form onSubmit={handleSubmit}>

                  <div className="auth-field">
                    <label className="auth-label">Email</label>
                    <div className="auth-input-wrapper">
                      <FiMail className="auth-input-icon" size={15} />
                      <input
                        className="auth-input"
                        type="email"
                        placeholder="ton@email.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <AnimatePresence>
                    {error && (
                      <motion.div
                        className="auth-error"
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                      >
                        {error}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <motion.button
                    className="auth-btn"
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    {loading
                      ? <span className="auth-spinner" />
                      : <><FiSend size={15} /> Envoyer le lien</>
                    }
                  </motion.button>

                </form>
              </motion.div>

            ) : (

              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ textAlign: 'center', padding: '1rem 0' }}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, delay: 0.1 }}
                  style={{
                    width: 60, height: 60,
                    borderRadius: '50%',
                    background: 'rgba(0, 212, 100, 0.1)',
                    border: '1px solid rgba(0, 212, 100, 0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 1.2rem',
                    color: '#00d464',
                  }}
                >
                  <FiCheck size={26} />
                </motion.div>

                <h3 style={{
                  color: 'var(--text-primary)',
                  marginBottom: '0.6rem',
                  fontWeight: 700,
                  fontSize: '1rem',
                }}>
                  Email envoyé !
                </h3>

                <p style={{
                  color: 'var(--text-secondary)',
                  fontSize: '0.88rem',
                  lineHeight: 1.6,
                }}>
                  Vérifie ta boîte mail{' '}
                  <strong style={{ color: 'var(--text-primary)' }}>{email}</strong>.
                  <br />Le lien est valable <strong style={{ color: 'var(--accent-cyan)' }}>1 heure</strong>.
                </p>

                <p style={{
                  color: 'var(--text-muted)',
                  fontSize: '0.78rem',
                  marginTop: '0.8rem',
                }}>
                  Pense à vérifier tes spams.
                </p>

                <motion.button
                  className="auth-btn"
                  onClick={() => setSent(false)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  style={{ marginTop: '1.5rem' }}
                >
                  <FiMail size={15} /> Renvoyer un email
                </motion.button>

              </motion.div>
            )}
          </AnimatePresence>

          {/* Back */}
          <div className="auth-switch" style={{ marginTop: '1.2rem' }}>
            <button
              className="auth-switch-btn"
              onClick={() => navigate('/login')}
            >
              <FiArrowLeft size={13} /> Retour à la connexion
            </button>
          </div>

        </motion.div>
      </div>
    </div>
  )
}
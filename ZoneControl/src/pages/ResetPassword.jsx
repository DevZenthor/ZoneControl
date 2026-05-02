import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiLock, FiEye, FiEyeOff, FiCheck, FiSave } from 'react-icons/fi'
import { supabase } from '../lib/supabase'
import '../styles/auth.css'

export default function ResetPassword() {
  const [password, setPassword]     = useState('')
  const [confirm, setConfirm]       = useState('')
  const [showPass, setShowPass]     = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading]       = useState(false)
  const [done, setDone]             = useState(false)
  const [error, setError]           = useState('')
  const navigate = useNavigate()

  // Supabase envoie le token dans l'URL — il se gère automatiquement
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event) => {
        if (event === 'PASSWORD_RECOVERY') {
          // Session active, on peut changer le mdp
        }
      }
    )
    return () => subscription.unsubscribe()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('Le mot de passe doit faire au moins 6 caractères.')
      return
    }
    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setDone(true)
    setLoading(false)
    setTimeout(() => navigate('/'), 2500)
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
            <FiLock size={22} />
          </div>
          <h1 className="auth-title">FN Tracker</h1>
          <p className="auth-subtitle">Nouveau mot de passe</p>
        </motion.div>

        {/* Card */}
        <motion.div
          className="auth-card"
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.15, duration: 0.5 }}
        >
          <AnimatePresence mode="wait">
            {!done ? (
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <form onSubmit={handleSubmit}>

                  {/* Nouveau mdp */}
                  <div className="auth-field">
                    <label className="auth-label">Nouveau mot de passe</label>
                    <div className="auth-input-wrapper">
                      <FiLock className="auth-input-icon" size={15} />
                      <input
                        className="auth-input"
                        type={showPass ? 'text' : 'password'}
                        placeholder="•••••••• (min. 6 car.)"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        className="auth-eye-btn"
                        onClick={() => setShowPass(v => !v)}
                        tabIndex={-1}
                      >
                        {showPass ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                      </button>
                    </div>
                  </div>

                  {/* Confirmer mdp */}
                  <div className="auth-field">
                    <label className="auth-label">Confirmer le mot de passe</label>
                    <div className="auth-input-wrapper">
                      <FiLock className="auth-input-icon" size={15} />
                      <input
                        className="auth-input"
                        type={showConfirm ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={confirm}
                        onChange={e => setConfirm(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        className="auth-eye-btn"
                        onClick={() => setShowConfirm(v => !v)}
                        tabIndex={-1}
                      >
                        {showConfirm ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                      </button>
                    </div>
                  </div>

                  {/* Indicateur force mdp */}
                  {password.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      style={{ marginBottom: '1rem' }}
                    >
                      <div style={{
                        display: 'flex',
                        gap: '0.3rem',
                        marginBottom: '0.3rem',
                      }}>
                        {[1, 2, 3, 4].map(i => (
                          <div key={i} style={{
                            flex: 1,
                            height: 3,
                            borderRadius: 2,
                            background: getStrengthColor(password, i),
                            transition: 'background 0.3s',
                          }} />
                        ))}
                      </div>
                      <span style={{
                        fontSize: '0.75rem',
                        color: getStrengthLabel(password).color,
                      }}>
                        {getStrengthLabel(password).text}
                      </span>
                    </motion.div>
                  )}

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
                      : <><FiSave size={15} /> Enregistrer le mot de passe</>
                    }
                  </motion.button>

                </form>
              </motion.div>

            ) : (
              <motion.div
                key="done"
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
                <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.6rem', fontWeight: 700 }}>
                  Mot de passe mis à jour !
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                  Redirection en cours...
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

      </div>
    </div>
  )
}

// ── Helpers force mdp ──
function getPasswordStrength(password) {
  let score = 0
  if (password.length >= 6)  score++
  if (password.length >= 10) score++
  if (/[A-Z]/.test(password) && /[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  return score
}

function getStrengthColor(password, level) {
  const strength = getPasswordStrength(password)
  if (level > strength) return 'rgba(255,255,255,0.08)'
  if (strength === 1) return '#ff2d78'
  if (strength === 2) return '#ffd700'
  if (strength === 3) return '#00d4ff'
  return '#00d464'
}

function getStrengthLabel(password) {
  const s = getPasswordStrength(password)
  if (s === 1) return { text: 'Trop faible',  color: '#ff2d78' }
  if (s === 2) return { text: 'Moyen',        color: '#ffd700' }
  if (s === 3) return { text: 'Bon',          color: '#00d4ff' }
  return              { text: 'Excellent',    color: '#00d464' }
}
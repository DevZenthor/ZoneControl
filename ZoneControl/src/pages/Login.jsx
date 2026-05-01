import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiMail, FiLock, FiLogIn, FiUserPlus, FiEye, FiEyeOff } from 'react-icons/fi'
import { supabase } from '../lib/supabase'
import '../styles/auth.css'

export default function Login() {
  const [email, setEmail]         = useState('')
  const [password, setPassword]   = useState('')
  const [showPass, setShowPass]   = useState(false)
  const [error, setError]         = useState('')
  const [loading, setLoading]     = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
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
            <FiLogIn size={22} />
          </div>
          <h1 className="auth-title">FN Tracker</h1>
          <p className="auth-subtitle">Connecte-toi à ton espace</p>
        </motion.div>

        {/* Card */}
        <motion.div
          className="auth-card"
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.15, duration: 0.5 }}
        >
          <form onSubmit={handleLogin}>

            {/* Email */}
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

            {/* Password */}
            <div className="auth-field">
              <label className="auth-label">Mot de passe</label>
              <div className="auth-input-wrapper">
                <FiLock className="auth-input-icon" size={15} />
                <input
                  className="auth-input"
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                <motion.button
                  type="button"
                  className="auth-eye-btn"
                  onClick={() => setShowPass(v => !v)}
                  tabIndex={-1}
                >
                  {showPass ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                </motion.button>
              </div>
            </div>

            {/* Error */}
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

            {/* Submit */}
            <motion.button
              className="auth-btn"
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
            >
              {loading
                ? <span className="auth-spinner" />
                : <><FiLogIn size={15} /> Se connecter</>
              }
            </motion.button>

          </form>

          {/* Switch */}
          <div className="auth-switch">
            <span>Pas de compte ?</span>
            <button className="auth-switch-btn" onClick={() => navigate('/register')}>
              <FiUserPlus size={13} /> S'inscrire
            </button>
          </div>

        </motion.div>
      </div>
    </div>
  )
}
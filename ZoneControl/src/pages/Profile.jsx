import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiUser, FiMail, FiLock, FiCamera, FiSave,
  FiCheck, FiAlertCircle, FiEye, FiEyeOff
} from 'react-icons/fi'
import { supabase } from '../lib/supabase'
import '../styles/profile.css'

export default function Profile({ session }) {
  const [profile, setProfile]       = useState(null)
  const [pseudo, setPseudo]         = useState('')
  const [email, setEmail]           = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [showPass, setShowPass]     = useState(false)
  const [avatarUrl, setAvatarUrl]   = useState(null)
  const [uploading, setUploading]   = useState(false)
  const [saving, setSaving]         = useState(false)
  const [success, setSuccess]       = useState('')
  const [error, setError]           = useState('')
  const fileRef = useRef()

  useEffect(() => {
    const fetchProfile = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()
      if (data) {
        setProfile(data)
        setPseudo(data.pseudo || '')
        setAvatarUrl(data.avatar_url || null)
      }
      setEmail(session.user.email || '')
    }
    fetchProfile()
  }, [session])

  const showMessage = (type, msg) => {
    if (type === 'success') { setSuccess(msg); setError('') }
    else { setError(msg); setSuccess('') }
    setTimeout(() => { setSuccess(''); setError('') }, 3500)
  }

  // ── Upload avatar ──
  const handleAvatar = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const ext      = file.name.split('.').pop()
    const filePath = `${session.user.id}/avatar.${ext}`

    const { error: upErr } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true })

    if (upErr) { showMessage('error', upErr.message); setUploading(false); return }

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath)

    await supabase.from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', session.user.id)

    setAvatarUrl(publicUrl)
    showMessage('success', 'Photo de profil mise à jour !')
    setUploading(false)
  }

  // ── Save profile ──
  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    // Update pseudo
    const { error: profileErr } = await supabase
      .from('profiles')
      .update({ pseudo })
      .eq('id', session.user.id)

    if (profileErr) { showMessage('error', profileErr.message); setSaving(false); return }

    // Update email
    if (email !== session.user.email) {
      const { error: emailErr } = await supabase.auth.updateUser({ email })
      if (emailErr) { showMessage('error', emailErr.message); setSaving(false); return }
    }

    // Update password
    if (newPassword) {
      if (newPassword.length < 6) {
        showMessage('error', 'Mot de passe trop court (min. 6 caractères)')
        setSaving(false)
        return
      }
      const { error: passErr } = await supabase.auth.updateUser({ password: newPassword })
      if (passErr) { showMessage('error', passErr.message); setSaving(false); return }
      setNewPassword('')
    }

    showMessage('success', 'Profil sauvegardé !')
    setSaving(false)
  }

  const initials = (pseudo || email)?.[0]?.toUpperCase() || '?'

  return (
    <div className="profile-wrapper">


      <div className="container profile-content">

        {/* ── Header ── */}
        <motion.div
          className="profile-header"
          initial={{ opacity: 0, y: -24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="profile-title">Mon Profil</h1>
          <p className="profile-subtitle">Gère tes informations personnelles</p>
        </motion.div>

        <div className="profile-grid">

          {/* ── Avatar card ── */}
          <motion.div
            className="profile-card profile-avatar-card"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
          >
            <div className="profile-avatar-wrapper">
              <div className="profile-avatar">
                {avatarUrl
                  ? <img src={avatarUrl} alt="avatar" />
                  : <span className="profile-avatar-initials">{initials}</span>
                }
                {uploading && (
                  <div className="profile-avatar-overlay">
                    <div className="spinner-fn" />
                  </div>
                )}
              </div>

              <motion.button
                className="profile-avatar-btn"
                onClick={() => fileRef.current?.click()}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                disabled={uploading}
              >
                <FiCamera size={16} />
              </motion.button>

              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handleAvatar}
                style={{ display: 'none' }}
              />
            </div>

            <h3 className="profile-avatar-name">
              {pseudo || session.user.email?.split('@')[0]}
            </h3>
            <p className="profile-avatar-email">{email}</p>

            <div className="profile-avatar-badge">
              <div className="profile-badge-dot" />
              Compte actif
            </div>
          </motion.div>

          {/* ── Form card ── */}
          <motion.div
            className="profile-card profile-form-card"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <form onSubmit={handleSave}>

              {/* Pseudo */}
              <div className="profile-field">
                <label className="profile-label">
                  <FiUser size={13} /> Pseudo
                </label>
                <input
                  className="profile-input"
                  type="text"
                  value={pseudo}
                  onChange={e => setPseudo(e.target.value)}
                  placeholder="TonPseudo"
                  required
                />
              </div>

              {/* Email */}
              <div className="profile-field">
                <label className="profile-label">
                  <FiMail size={13} /> Email
                </label>
                <input
                  className="profile-input"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="ton@email.com"
                  required
                />
              </div>

              {/* Password */}
              <div className="profile-field">
                <label className="profile-label">
                  <FiLock size={13} /> Nouveau mot de passe
                </label>
                <div className="profile-input-wrapper">
                  <input
                    className="profile-input"
                    type={showPass ? 'text' : 'password'}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Laisser vide pour ne pas changer"
                    style={{ paddingRight: '2.8rem' }}
                  />
                  <button
                    type="button"
                    className="profile-eye-btn"
                    onClick={() => setShowPass(v => !v)}
                    tabIndex={-1}
                  >
                    {showPass ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                  </button>
                </div>
              </div>

              {/* Messages */}
              <AnimatePresence>
                {success && (
                  <motion.div
                    className="profile-msg profile-msg--success"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    <FiCheck size={14} /> {success}
                  </motion.div>
                )}
                {error && (
                  <motion.div
                    className="profile-msg profile-msg--error"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    <FiAlertCircle size={14} /> {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit */}
              <motion.button
                className="profile-save-btn"
                type="submit"
                disabled={saving}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
              >
                {saving
                  ? <span className="auth-spinner" />
                  : <><FiSave size={15} /> Sauvegarder</>
                }
              </motion.button>

            </form>
          </motion.div>

        </div>
      </div>
    </div>
  )
}
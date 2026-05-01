import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase'

export default function AddPlayerForm({ session, onAdded }) {
  const [form, setForm] = useState({
    pseudo: '', age: '', team: '', pr_link: '', twitter: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.from('players').insert({
      ...form,
      age: form.age ? parseInt(form.age) : null,
      user_id: session.user.id,
    })
    if (error) setError(error.message)
    else onAdded()
    setLoading(false)
  }

  const fields = [
    { key: 'pseudo',   label: 'Pseudo *',           type: 'text',   required: true, col: 6 },
    { key: 'age',      label: 'Âge',                type: 'number', col: 6 },
    { key: 'team',     label: 'Team',               type: 'text',   col: 6 },
    { key: 'twitter',  label: 'Twitter (sans @)',   type: 'text',   col: 6 },
    { key: 'pr_link',  label: 'Lien PR Tracker',    type: 'url',    col: 12 },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.97 }}
      transition={{ duration: 0.3 }}
      className="card-dark"
    >
      <h4 style={{ color: 'var(--accent-cyan)', marginBottom: '1.2rem', fontWeight: 700 }}>
        + Nouveau joueur
      </h4>

      <form onSubmit={handleSubmit}>
        <div className="row g-3">
          {fields.map(f => (
            <div key={f.key} className={`col-12 col-md-${f.col}`}>
              <label className="form-label">{f.label}</label>
              <input
                className="form-control"
                type={f.type}
                required={f.required}
                value={form[f.key]}
                onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                placeholder={f.key === 'pr_link' ? 'https://fortnitetracker.com/profile/...' : ''}
              />
            </div>
          ))}
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="alert-fn mt-3"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="btn-accent mt-3"
          type="submit"
          disabled={loading}
        >
          {loading ? 'Ajout en cours...' : 'Ajouter le joueur'}
        </motion.button>
      </form>
    </motion.div>
  )
}
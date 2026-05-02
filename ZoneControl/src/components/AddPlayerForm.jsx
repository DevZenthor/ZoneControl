import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { STATUT_COLORS } from '../lib/statut'

export default function AddPlayerForm({ session, onAdded }) {
  const [form, setForm] = useState({
    pseudo: '', age: '', team: '', pr_link: '', twitter: '', statut: 'Actif'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.from('players').insert({
      ...form,
      age: form.age ? parseInt(form.age) : null,
      user_id: session.user.id,
    })
    if (error) setError(error.message)
    else onAdded()
    setLoading(false)
  }

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

          <div className="col-12 col-md-6">
            <label className="form-label">Pseudo *</label>
            <input className="form-control" type="text" required
              value={form.pseudo}
              onChange={e => setForm({ ...form, pseudo: e.target.value })} />
          </div>

          <div className="col-12 col-md-6">
            <label className="form-label">Âge</label>
            <input className="form-control" type="number"
              value={form.age}
              onChange={e => setForm({ ...form, age: e.target.value })} />
          </div>

          <div className="col-12 col-md-6">
            <label className="form-label">Team</label>
            <input className="form-control" type="text"
              value={form.team}
              onChange={e => setForm({ ...form, team: e.target.value })} />
          </div>

          <div className="col-12 col-md-6">
            <label className="form-label">Twitter (sans @)</label>
            <input className="form-control" type="text"
              value={form.twitter}
              onChange={e => setForm({ ...form, twitter: e.target.value })} />
          </div>

          <div className="col-12 col-md-8">
            <label className="form-label">Lien PR Tracker</label>
            <input className="form-control" type="url"
              value={form.pr_link}
              placeholder="https://fortnitetracker.com/profile/..."
              onChange={e => setForm({ ...form, pr_link: e.target.value })} />
          </div>

          {/* Statut */}
          <div className="col-12 col-md-4">
            <label className="form-label">Statut</label>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {['Actif', 'Inactif', 'Free Agent'].map(s => (
                <motion.button
                  key={s}
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setForm({ ...form, statut: s })}
                  style={{
                    padding: '0.35rem 0.8rem',
                    borderRadius: 8,
                    border: `1px solid ${form.statut === s ? STATUT_COLORS[s].border : 'rgba(255,255,255,0.08)'}`,
                    background: form.statut === s ? STATUT_COLORS[s].bg : 'transparent',
                    color: form.statut === s ? STATUT_COLORS[s].color : 'var(--text-muted)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {s}
                </motion.button>
              ))}
            </div>
          </div>

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
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase'
import PlayerCard from '../components/PlayerCard'
import AddPlayerForm from '../components/AddPlayerForm'

const BG_ORBS = [
  { top: '10%', left: '5%', color: 'rgba(123,47,247,0.07)', size: 400 },
  { top: '50%', right: '5%', color: 'rgba(0,212,255,0.06)', size: 350 },
  { bottom: '10%', left: '30%', color: 'rgba(255,45,120,0.05)', size: 300 },
]

export default function Dashboard({ session }) {
  const [players, setPlayers] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  const fetchPlayers = async () => {
    const { data } = await supabase
      .from('players')
      .select('*')
      .order('created_at', { ascending: false })
    setPlayers(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchPlayers() }, [])

  const deletePlayer = async (id) => {
    if (!confirm('Supprimer ce joueur ?')) return
    await supabase.from('players').delete().eq('id', id)
    setPlayers(prev => prev.filter(p => p.id !== id))
  }

  const filtered = players.filter(p =>
    p.pseudo.toLowerCase().includes(search.toLowerCase()) ||
    (p.team && p.team.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>

      {/* Background orbs */}
      {BG_ORBS.map((orb, i) => (
        <motion.div
          key={i}
          animate={{ scale: [1, 1.1, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 6 + i * 2, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'fixed',
            top: orb.top, left: orb.left,
            right: orb.right, bottom: orb.bottom,
            width: orb.size, height: orb.size,
            background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
            borderRadius: '50%',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />
      ))}

      <div className="container py-5" style={{ position: 'relative', zIndex: 1 }}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="mb-5"
        >
          <h1 style={{
            fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
            fontWeight: 800,
            background: 'linear-gradient(135deg, #00d4ff 0%, #7b2ff7 50%, #ff2d78 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '0.4rem',
            letterSpacing: '-1px',
          }}>
            Mes Joueurs
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            {players.length} joueur{players.length > 1 ? 's' : ''} suivi{players.length > 1 ? 's' : ''}
          </p>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}
        >
          <input
            className="form-control"
            placeholder="🔍 Rechercher un joueur ou une team..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ maxWidth: 340, flex: 1 }}
          />
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className={showForm ? 'btn-ghost' : 'btn-accent'}
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? '✕ Annuler' : '+ Ajouter un joueur'}
          </motion.button>
        </motion.div>

        {/* Add form */}
        <AnimatePresence>
          {showForm && (
            <motion.div className="mb-4">
              <AddPlayerForm
                session={session}
                onAdded={() => { setShowForm(false); fetchPlayers() }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content */}
        {loading ? (
          <div className="d-flex justify-content-center py-5">
            <div className="spinner-fn" />
          </div>
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            style={{
              textAlign: 'center',
              padding: '4rem 2rem',
              background: 'var(--bg-card)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 'var(--radius-lg)',
            }}
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              style={{ fontSize: '3rem', marginBottom: '1rem' }}
            >
              🎮
            </motion.div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
              {search ? 'Aucun joueur trouvé.' : 'Aucun joueur ajouté. Commence maintenant !'}
            </p>
          </motion.div>
        ) : (
          <motion.div
            className="row g-3"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.08 } }
            }}
          >
            <AnimatePresence>
              {filtered.map(player => (
                <motion.div
                  key={player.id}
                  className="col-12 col-md-6 col-lg-4"
                  variants={{
                    hidden: { opacity: 0, y: 30, scale: 0.95 },
                    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4 } }
                  }}
                >
                  <PlayerCard
                    player={player}
                    onClick={() => navigate(`/player/${player.id}`)}
                    onDelete={() => deletePlayer(player.id)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Stats bar */}
        {players.length > 0 && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            style={{
              marginTop: '3rem',
              display: 'flex',
              gap: '1rem',
              flexWrap: 'wrap',
            }}
          >
            {[
              { label: 'Joueurs total', value: players.length },
              { label: 'Teams', value: [...new Set(players.map(p => p.team).filter(Boolean))].length },
              { label: 'Avec PR link', value: players.filter(p => p.pr_link).length },
            ].map((stat, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.05, borderColor: 'rgba(0,212,255,0.3)' }}
                className="stat-pill"
                style={{ flex: 1, minWidth: 120 }}
              >
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}
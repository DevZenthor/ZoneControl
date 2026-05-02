import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiSearch, FiPlus, FiX, FiTrash2,
  FiUsers, FiShield, FiBarChart2, FiTwitter
} from 'react-icons/fi'
import { FaTrophy, FaBirthdayCake } from 'react-icons/fa'
import { supabase } from '../lib/supabase'
import AddPlayerForm from '../components/AddPlayerForm'
import StatutBadge from '../components/StatutBadge'
import ConfirmModal from '../components/ConfirmModal'
import { STATUT_COLORS } from '../lib/statut'
import { useToastContext } from '../context/ToastContext'
import '../styles/home.css'

export default function Home({ session }) {
  const [players, setPlayers]           = useState([])
  const [loading, setLoading]           = useState(true)
  const [showForm, setShowForm]         = useState(false)
  const [search, setSearch]             = useState('')
  const [filterStatut, setFilterStatut] = useState('Tous')
  const [confirmDelete, setConfirmDelete] = useState({ open: false, playerId: null, pseudo: '' })
  const navigate = useNavigate()
  const toast = useToastContext()

  const fetchPlayers = async () => {
    const { data } = await supabase
      .from('players')
      .select('*')
      .order('created_at', { ascending: false })
    setPlayers(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchPlayers() }, [])

  const deletePlayer = async () => {
    await supabase.from('players').delete().eq('id', confirmDelete.playerId)
    setPlayers(prev => prev.filter(p => p.id !== confirmDelete.playerId))
    setConfirmDelete({ open: false, playerId: null, pseudo: '' })
    toast.success('Joueur supprimé.')
  }

  const filtered = players.filter(p => {
    const matchSearch = p.pseudo.toLowerCase().includes(search.toLowerCase()) ||
      (p.team && p.team.toLowerCase().includes(search.toLowerCase()))
    const matchStatut = filterStatut === 'Tous' || p.statut === filterStatut
    return matchSearch && matchStatut
  })

  return (
    <div className="home-wrapper">
      <div className="container home-content">

        {/* ── Header ── */}
        <motion.div
          className="home-header"
          initial={{ opacity: 0, y: -28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <h1 className="home-title">Mes Joueurs</h1>
          <p className="home-subtitle">
            {players.length} joueur{players.length !== 1 ? 's' : ''} suivi{players.length !== 1 ? 's' : ''}
          </p>
        </motion.div>

        {/* ── Controls ── */}
        <motion.div
          className="home-controls"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="home-search-wrapper">
            <FiSearch className="home-search-icon" />
            <input
              className="home-search"
              placeholder="Rechercher joueur ou team..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className={showForm ? 'btn-ghost' : 'btn-accent'}
            onClick={() => setShowForm(v => !v)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            {showForm
              ? <><FiX size={15} /> Annuler</>
              : <><FiPlus size={15} /> Ajouter un joueur</>
            }
          </motion.button>
        </motion.div>

        {/* ── Filtre statut ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}
        >
          {['Tous', 'Actif', 'Inactif', 'Free Agent'].map(s => (
            <motion.button
              key={s}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setFilterStatut(s)}
              style={{
                padding: '0.3rem 0.85rem',
                borderRadius: 20,
                border: filterStatut === s
                  ? `1px solid ${s === 'Tous' ? 'rgba(0,212,255,0.3)' : STATUT_COLORS[s]?.border}`
                  : '1px solid rgba(255,255,255,0.07)',
                background: filterStatut === s
                  ? s === 'Tous' ? 'rgba(0,212,255,0.08)' : STATUT_COLORS[s]?.bg
                  : 'transparent',
                color: filterStatut === s
                  ? s === 'Tous' ? 'var(--accent-cyan)' : STATUT_COLORS[s]?.color
                  : 'var(--text-muted)',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {s}
              {s !== 'Tous' && (
                <span style={{ marginLeft: '0.35rem', opacity: 0.65 }}>
                  {players.filter(p => (p.statut || 'Actif') === s).length}
                </span>
              )}
            </motion.button>
          ))}
        </motion.div>

        {/* ── Add form ── */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              key="form"
              className="home-form-wrapper"
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -10 }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
            >
              <AddPlayerForm
                session={session}
                onAdded={() => {
                  setShowForm(false)
                  fetchPlayers()
                  toast.success('Joueur ajouté avec succès !')
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Content ── */}
        {loading ? (
          <div className="home-loader">
            <div className="spinner-fn" />
          </div>

        ) : filtered.length === 0 ? (
          <motion.div
            className="home-empty"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <motion.div
              className="home-empty-icon"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <FiUsers size={48} style={{ color: 'var(--accent-cyan)', opacity: 0.4 }} />
            </motion.div>
            <p className="home-empty-text">
              {search || filterStatut !== 'Tous'
                ? 'Aucun joueur trouvé avec ces filtres.'
                : 'Aucun joueur encore. Ajoutes-en un !'}
            </p>
            {!search && filterStatut === 'Tous' && (
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="btn-accent"
                onClick={() => setShowForm(true)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <FiPlus size={15} /> Ajouter mon premier joueur
              </motion.button>
            )}
          </motion.div>

        ) : (
          <motion.div
            className="player-grid"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.07 } }
            }}
          >
            <AnimatePresence>
              {filtered.map(player => (
                <motion.div
                  key={player.id}
                  variants={{
                    hidden:  { opacity: 0, y: 28, scale: 0.94 },
                    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: 'easeOut' } }
                  }}
                  exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                  whileHover={{ y: -5 }}
                  onClick={() => navigate(`/player/${player.id}`)}
                >
                  <div className="player-card">
                    <div className="player-card-glow" />

                    <motion.button
                      className="player-card-delete"
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={e => {
                        e.stopPropagation()
                        setConfirmDelete({ open: true, playerId: player.id, pseudo: player.pseudo })
                      }}
                    >
                      <FiTrash2 size={14} />
                    </motion.button>

                    <div className="player-card-name">{player.pseudo}</div>

                    <div className="player-card-info">

                      {/* Statut */}
                      <div className="player-card-row">
                        <StatutBadge statut={player.statut || 'Actif'} />
                      </div>

                      {player.age && (
                        <div className="player-card-row">
                          <FaBirthdayCake size={13} style={{ color: 'var(--accent-purple)', flexShrink: 0 }} />
                          <span>{player.age} ans</span>
                        </div>
                      )}
                      {player.team && (
                        <div className="player-card-row">
                          <FaTrophy size={13} style={{ color: 'var(--accent-gold)', flexShrink: 0 }} />
                          <span className="badge-team">{player.team}</span>
                        </div>
                      )}
                      {player.twitter && (
                        <div className="player-card-row">
                          <FiTwitter size={13} style={{ color: '#1da1f2', flexShrink: 0 }} />
                          <a
                            href={`https://twitter.com/${player.twitter}`}
                            target="_blank" rel="noreferrer"
                            onClick={e => e.stopPropagation()}
                            style={{ color: '#1da1f2' }}
                          >
                            @{player.twitter}
                          </a>
                        </div>
                      )}
                      {player.pr_link && (
                        <div className="player-card-row">
                          <FiBarChart2 size={13} style={{ color: 'var(--accent-purple)', flexShrink: 0 }} />
                          <a
                            href={player.pr_link}
                            target="_blank" rel="noreferrer"
                            onClick={e => e.stopPropagation()}
                            style={{ color: 'var(--accent-purple)' }}
                          >
                            Voir PR Tracker
                          </a>
                        </div>
                      )}
                    </div>

                    <div className="player-card-bottom-bar" />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ── Stats ── */}
        {!loading && players.length > 0 && (
          <motion.div
            className="home-stats"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            {[
              { label: 'Joueurs',     value: players.length,                                                       icon: <FiUsers size={16} />    },
              { label: 'Teams',       value: [...new Set(players.map(p => p.team).filter(Boolean))].length,        icon: <FiShield size={16} />   },
              { label: 'Avec PR',     value: players.filter(p => p.pr_link).length,                               icon: <FiBarChart2 size={16} /> },
              { label: 'Free Agents', value: players.filter(p => (p.statut || 'Actif') === 'Free Agent').length,  icon: <FiUsers size={16} />    },
            ].map((stat, i) => (
              <motion.div
                key={i}
                className="home-stat-card"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
              >
                <div className="home-stat-icon">{stat.icon}</div>
                <div className="home-stat-value">{stat.value}</div>
                <div className="home-stat-label">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* ── Confirm delete joueur ── */}
        <ConfirmModal
          isOpen={confirmDelete.open}
          title={`Supprimer ${confirmDelete.pseudo} ?`}
          message="Ce joueur et toutes ses performances seront définitivement supprimés. Cette action est irréversible."
          onConfirm={deletePlayer}
          onCancel={() => setConfirmDelete({ open: false, playerId: null, pseudo: '' })}
        />

      </div>
    </div>
  )
}
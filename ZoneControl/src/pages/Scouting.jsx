import { useEffect, useState } from 'react'
import { motion, AnimatePresence, useDragControls } from 'framer-motion'
import {
  FiPlus, FiX, FiTwitter, FiBarChart2, FiSearch,
  FiTrash2, FiEdit2, FiSave, FiFileText,
  FiUser, FiFlag
} from 'react-icons/fi'
import { FaBirthdayCake } from 'react-icons/fa'
import { supabase } from '../lib/supabase'
import { useToastContext } from '../context/ToastContext'
import ConfirmModal from '../components/ConfirmModal'
import { SCOUTING_COLORS } from '../lib/statutScouting'
import '../styles/scouting.css'

const STATUTS = ['Intéressant', 'Contacté', 'Refusé']

const EMPTY_FORM = {
  pseudo: '', age: '', nationalite: '', twitter: '',
  tracker_link: '', statut: 'Intéressant', notes: '',
}

function ScoutingBadge({ statut }) {
  const c = SCOUTING_COLORS[statut] || SCOUTING_COLORS['Intéressant']
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
      padding: '0.2rem 0.65rem', borderRadius: 20,
      background: c.bg, border: `1px solid ${c.border}`,
      color: c.color, fontSize: '0.72rem', fontWeight: 700,
    }}>
      <span style={{
        width: 6, height: 6, borderRadius: '50%',
        background: c.dot, boxShadow: `0 0 6px ${c.dot}`,
        flexShrink: 0,
      }} />
      {statut}
    </span>
  )
}

export default function Scouting({ session }) {
  const toast = useToastContext()
  const dragControls = useDragControls()

  const [profiles, setProfiles]           = useState([])
  const [loading, setLoading]             = useState(true)
  const [search, setSearch]               = useState('')
  const [filterStatut, setFilterStatut]   = useState('Tous')
  const [showModal, setShowModal]         = useState(false)
  const [editId, setEditId]               = useState(null)
  const [form, setForm]                   = useState(EMPTY_FORM)
  const [saving, setSaving]               = useState(false)
  const [expandedId, setExpandedId]       = useState(null)
  const [savingNotes, setSavingNotes]     = useState(null)
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null, pseudo: '' })

  const fetchProfiles = async () => {
    const { data } = await supabase
      .from('scouting')
      .select('*')
      .order('created_at', { ascending: false })
    setProfiles(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchProfiles() }, [])

  const openAdd = () => {
    setEditId(null)
    setForm(EMPTY_FORM)
    setShowModal(true)
  }

  const openEdit = (p) => {
    setEditId(p.id)
    setForm({
      pseudo:       p.pseudo       || '',
      age:          p.age          || '',
      nationalite:  p.nationalite  || '',
      twitter:      p.twitter      || '',
      tracker_link: p.tracker_link || '',
      statut:       p.statut       || 'Intéressant',
      notes:        p.notes        || '',
    })
    setShowModal(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)

    const payload = {
      pseudo:       form.pseudo,
      age:          form.age          ? parseInt(form.age) : null,
      nationalite:  form.nationalite  || null,
      twitter:      form.twitter      || null,
      tracker_link: form.tracker_link || null,
      statut:       form.statut,
      notes:        form.notes        || '',
      user_id:      session.user.id,
    }

    if (editId) {
      const { error } = await supabase.from('scouting').update(payload).eq('id', editId)
      if (error) { toast.error(error.message); setSaving(false); return }
      toast.success('Profil modifié !')
    } else {
      const { error } = await supabase.from('scouting').insert(payload)
      if (error) { toast.error(error.message); setSaving(false); return }
      toast.success('Profil ajouté !')
    }

    setShowModal(false)
    fetchProfiles()
    setSaving(false)
  }

  const handleDelete = async () => {
    await supabase.from('scouting').delete().eq('id', confirmDelete.id)
    setProfiles(prev => prev.filter(p => p.id !== confirmDelete.id))
    setConfirmDelete({ open: false, id: null, pseudo: '' })
    toast.success('Profil supprimé.')
  }

  const handleSaveNotes = async (profile) => {
    setSavingNotes(profile.id)
    const { error } = await supabase
      .from('scouting')
      .update({ notes: profile.notes })
      .eq('id', profile.id)
    if (error) { toast.error(error.message); setSavingNotes(null); return }
    toast.success('Notes sauvegardées !')
    setSavingNotes(null)
  }

  const updateLocalNotes = (id, notes) => {
    setProfiles(prev => prev.map(p => p.id === id ? { ...p, notes } : p))
  }

  const handleStatutChange = async (id, statut) => {
    await supabase.from('scouting').update({ statut }).eq('id', id)
    setProfiles(prev => prev.map(p => p.id === id ? { ...p, statut } : p))
    toast.success(`Statut mis à jour : ${statut}`)
  }

  const filtered = profiles.filter(p => {
    const matchSearch = p.pseudo.toLowerCase().includes(search.toLowerCase()) ||
      (p.nationalite && p.nationalite.toLowerCase().includes(search.toLowerCase()))
    const matchStatut = filterStatut === 'Tous' || p.statut === filterStatut
    return matchSearch && matchStatut
  })

  return (
    <div className="scouting-wrapper">
      <div className="container scouting-content">

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="scouting-header"
        >
          <div>
            <h1 className="scouting-title">Scouting</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
              {profiles.length} profil{profiles.length !== 1 ? 's' : ''} suivi{profiles.length !== 1 ? 's' : ''}
            </p>
          </div>
          <motion.button
            className="btn-accent"
            onClick={openAdd}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <FiPlus size={15} /> Ajouter un profil
          </motion.button>
        </motion.div>

        {/* ── Controls ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="scouting-controls"
        >
          <div className="home-search-wrapper">
            <FiSearch className="home-search-icon" />
            <input
              className="home-search"
              placeholder="Rechercher pseudo ou nationalité..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {['Tous', ...STATUTS].map(s => (
              <motion.button
                key={s}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setFilterStatut(s)}
                style={{
                  padding: '0.3rem 0.85rem', borderRadius: 20,
                  border: filterStatut === s
                    ? `1px solid ${s === 'Tous' ? 'rgba(0,212,255,0.3)' : SCOUTING_COLORS[s]?.border}`
                    : '1px solid rgba(255,255,255,0.07)',
                  background: filterStatut === s
                    ? s === 'Tous' ? 'rgba(0,212,255,0.08)' : SCOUTING_COLORS[s]?.bg
                    : 'transparent',
                  color: filterStatut === s
                    ? s === 'Tous' ? 'var(--accent-cyan)' : SCOUTING_COLORS[s]?.color
                    : 'var(--text-muted)',
                  fontSize: '0.78rem', fontWeight: 600,
                  cursor: 'pointer', transition: 'all 0.2s',
                }}
              >
                {s}
                {s !== 'Tous' && (
                  <span style={{ marginLeft: '0.35rem', opacity: 0.65 }}>
                    {profiles.filter(p => p.statut === s).length}
                  </span>
                )}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* ── Modal ── */}
        <AnimatePresence>
          {showModal && (
            <>
              {/* Overlay */}
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setShowModal(false)}
                style={{
                  position: 'fixed', inset: 0,
                  background: 'rgba(0,0,0,0.7)',
                  backdropFilter: 'blur(8px)',
                  zIndex: 200,
                }}
              />

              {/* Modal */}
              <motion.div
                className="scouting-modal"
                drag
                dragControls={dragControls}
                dragMomentum={false}
                dragElastic={0}
                initial={{ opacity: 0, scale: 0.92, x: '-50%', y: '-50%' }}
                animate={{ opacity: 1, scale: 1,  x: '-50%', y: '-50%' }}
                exit={{   opacity: 0, scale: 0.92, x: '-50%', y: '-50%' }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                style={{ cursor: 'default' }}
              >

                {/* Header drag handle */}
                <div className="scouting-modal-header" onPointerDown={(e) => dragControls.start(e)}>
                  <div className="scouting-modal-drag-bar" />
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h3 className="scouting-modal-title">
                      <FiUser size={16} />
                      {editId ? 'Modifier le profil' : 'Ajouter un profil'}
                    </h3>
                    <motion.button
                      className="scouting-modal-close"
                      onClick={() => setShowModal(false)}
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <FiX size={16} />
                    </motion.button>
                  </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem', padding: '1.2rem 1.5rem 1.5rem' }}>

                  {/* Pseudo + Âge */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                    <div className="scouting-field">
                      <label className="scouting-label">Pseudo *</label>
                      <input className="scouting-input" type="text" required
                        placeholder="Pseudo du joueur"
                        value={form.pseudo}
                        onChange={e => setForm({ ...form, pseudo: e.target.value })} />
                    </div>
                    <div className="scouting-field">
                      <label className="scouting-label">Âge</label>
                      <input className="scouting-input" type="number" placeholder="17"
                        value={form.age}
                        onChange={e => setForm({ ...form, age: e.target.value })} />
                    </div>
                  </div>

                  {/* Nationalité + Twitter */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                    <div className="scouting-field">
                      <label className="scouting-label">Nationalité</label>
                      <input className="scouting-input" type="text" placeholder="Français, Belge..."
                        value={form.nationalite}
                        onChange={e => setForm({ ...form, nationalite: e.target.value })} />
                    </div>
                    <div className="scouting-field">
                      <label className="scouting-label">Twitter</label>
                      <div className="scouting-input-prefix-wrapper">
                        <span className="scouting-input-prefix">@</span>
                        <input className="scouting-input scouting-input--prefix" type="text" placeholder="pseudo"
                          value={form.twitter}
                          onChange={e => setForm({ ...form, twitter: e.target.value })} />
                      </div>
                    </div>
                  </div>

                  {/* Tracker */}
                  <div className="scouting-field">
                    <label className="scouting-label">Lien Tracker</label>
                    <input className="scouting-input" type="url"
                      placeholder="https://fortnitetracker.com/profile/..."
                      value={form.tracker_link}
                      onChange={e => setForm({ ...form, tracker_link: e.target.value })} />
                  </div>

                  {/* Statut */}
                  <div className="scouting-field">
                    <label className="scouting-label">Statut</label>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.4rem' }}>
                      {STATUTS.map(s => (
                        <motion.button key={s} type="button"
                          whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                          onClick={() => setForm({ ...form, statut: s })}
                          style={{
                            flex: 1, padding: '0.55rem 0', borderRadius: 8,
                            border: `1px solid ${form.statut === s ? SCOUTING_COLORS[s].border : 'rgba(255,255,255,0.07)'}`,
                            background: form.statut === s ? SCOUTING_COLORS[s].bg : 'rgba(255,255,255,0.02)',
                            color: form.statut === s ? SCOUTING_COLORS[s].color : 'var(--text-muted)',
                            fontSize: '0.8rem', fontWeight: 600,
                            cursor: 'pointer', transition: 'all 0.2s',
                            boxShadow: form.statut === s ? `0 0 12px ${SCOUTING_COLORS[s].dot}22` : 'none',
                          }}
                        >
                          <span style={{
                            display: 'inline-block', width: 6, height: 6,
                            borderRadius: '50%', marginRight: 6,
                            background: form.statut === s ? SCOUTING_COLORS[s].dot : 'rgba(255,255,255,0.2)',
                            verticalAlign: 'middle',
                          }} />
                          {s}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="scouting-field">
                    <label className="scouting-label">Notes</label>
                    <textarea
                      className="scouting-input scouting-textarea"
                      rows={3}
                      placeholder="Observations, points forts, contexte du joueur..."
                      value={form.notes}
                      onChange={e => setForm({ ...form, notes: e.target.value })}
                    />
                  </div>

                  {/* Submit */}
                  <motion.button
                    className="scouting-submit"
                    type="submit"
                    disabled={saving}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    {saving
                      ? <span className="auth-spinner" />
                      : <><FiSave size={15} /> Sauvegarder le profil</>
                    }
                  </motion.button>

                </form>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* ── Content ── */}
        {loading ? (
          <div className="home-loader"><div className="spinner-fn" /></div>

        ) : filtered.length === 0 ? (
          <motion.div className="compare-empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
              <FiUser size={48} style={{ color: 'var(--accent-cyan)', opacity: 0.3 }} />
            </motion.div>
            <p>{search || filterStatut !== 'Tous' ? 'Aucun profil trouvé.' : 'Aucun profil encore. Ajoutes-en un !'}</p>
          </motion.div>

        ) : (
          <motion.div
            className="scouting-grid"
            initial="hidden"
            animate="visible"
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }}
          >
            {filtered.map((profile) => (
              <motion.div
                key={profile.id}
                variants={{
                  hidden:  { opacity: 0, y: 24, scale: 0.94 },
                  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: 'easeOut' } }
                }}
              >
                <div className="scouting-card">
                  <div className="scouting-card-glow" />

                  {/* Header */}
                  <div className="scouting-card-header">
                    <div className="scouting-card-avatar">
                      {profile.pseudo[0].toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="scouting-card-name">{profile.pseudo}</div>
                      <ScoutingBadge statut={profile.statut} />
                    </div>
                    <div style={{ display: 'flex', gap: '0.3rem', flexShrink: 0 }}>
                      <motion.button className="pd-edit-perf-btn" onClick={() => openEdit(profile)}
                        whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} title="Modifier">
                        <FiEdit2 size={13} />
                      </motion.button>
                      <motion.button className="pd-delete-btn"
                        onClick={() => setConfirmDelete({ open: true, id: profile.id, pseudo: profile.pseudo })}
                        whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} title="Supprimer">
                        <FiTrash2 size={13} />
                      </motion.button>
                    </div>
                  </div>

                  {/* Infos */}
                  <div className="scouting-card-infos">
                    {profile.age && (
                      <div className="scouting-info-row">
                        <FaBirthdayCake size={13} style={{ color: 'var(--accent-purple)', flexShrink: 0 }} />
                        <span>{profile.age} ans</span>
                      </div>
                    )}
                    {profile.nationalite && (
                      <div className="scouting-info-row">
                        <FiFlag size={13} style={{ color: 'var(--accent-cyan)', flexShrink: 0 }} />
                        <span>{profile.nationalite}</span>
                      </div>
                    )}
                    {profile.twitter && (
                      <div className="scouting-info-row">
                        <FiTwitter size={13} style={{ color: '#1da1f2', flexShrink: 0 }} />
                        <a href={`https://twitter.com/${profile.twitter}`} target="_blank" rel="noreferrer"
                          style={{ color: '#1da1f2' }}>
                          @{profile.twitter}
                        </a>
                      </div>
                    )}
                    {profile.tracker_link && (
                      <div className="scouting-info-row">
                        <FiBarChart2 size={13} style={{ color: 'var(--accent-purple)', flexShrink: 0 }} />
                        <a href={profile.tracker_link} target="_blank" rel="noreferrer"
                          style={{ color: 'var(--accent-purple)' }}>
                          Voir Tracker
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Statut rapide */}
                  <div className="scouting-statut-btns">
                    {STATUTS.map(s => (
                      <motion.button key={s}
                        whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                        onClick={() => handleStatutChange(profile.id, s)}
                        style={{
                          flex: 1, padding: '0.3rem 0.4rem', borderRadius: 6,
                          fontSize: '0.7rem', fontWeight: 600,
                          border: `1px solid ${profile.statut === s ? SCOUTING_COLORS[s].border : 'rgba(255,255,255,0.06)'}`,
                          background: profile.statut === s ? SCOUTING_COLORS[s].bg : 'transparent',
                          color: profile.statut === s ? SCOUTING_COLORS[s].color : 'var(--text-muted)',
                          cursor: 'pointer', transition: 'all 0.2s',
                        }}
                      >{s}</motion.button>
                    ))}
                  </div>

                  {/* Notes toggle */}
                  <div
                    className="scouting-notes-toggle"
                    onClick={() => setExpandedId(expandedId === profile.id ? null : profile.id)}
                  >
                    <FiFileText size={12} />
                    <span>Notes</span>
                    {profile.notes && (
                      <span style={{
                        background: 'rgba(0,212,255,0.1)',
                        border: '1px solid rgba(0,212,255,0.2)',
                        color: 'var(--accent-cyan)',
                        fontSize: '0.65rem', fontWeight: 700,
                        padding: '0.05rem 0.4rem', borderRadius: 10,
                      }}>
                        {profile.notes.length} car.
                      </span>
                    )}
                    <span style={{ marginLeft: 'auto', fontSize: '0.7rem', opacity: 0.5 }}>
                      {expandedId === profile.id ? '▲' : '▼'}
                    </span>
                  </div>

                  <AnimatePresence>
                    {expandedId === profile.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        style={{ overflow: 'hidden' }}
                      >
                        <div className="scouting-notes-wrapper">
                          <textarea
                            className="pd-notes-input"
                            value={profile.notes || ''}
                            onChange={e => updateLocalNotes(profile.id, e.target.value)}
                            placeholder="Observations sur ce joueur..."
                            rows={4}
                            onKeyDown={e => {
                              if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                                e.preventDefault()
                                handleSaveNotes(profile)
                              }
                            }}
                            style={{ fontSize: '0.82rem', minHeight: 'unset' }}
                          />
                          <div className="pd-notes-footer">
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>
                              Ctrl+S pour sauvegarder
                            </span>
                            <motion.button
                              className="btn-accent"
                              onClick={() => handleSaveNotes(profile)}
                              disabled={savingNotes === profile.id}
                              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                              style={{
                                fontSize: '0.75rem', padding: '0.25rem 0.7rem',
                                display: 'flex', alignItems: 'center', gap: '0.3rem',
                              }}
                            >
                              {savingNotes === profile.id
                                ? <span className="auth-spinner" />
                                : <><FiSave size={12} /> Sauvegarder</>
                              }
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        <ConfirmModal
          isOpen={confirmDelete.open}
          title={`Supprimer ${confirmDelete.pseudo} ?`}
          message="Ce profil scouting sera définitivement supprimé."
          onConfirm={handleDelete}
          onCancel={() => setConfirmDelete({ open: false, id: null, pseudo: '' })}
        />

      </div>
    </div>
  )
}
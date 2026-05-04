import { useEffect, useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence, useDragControls } from 'framer-motion'
import {
    LineChart, Line, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Legend
} from 'recharts'
import {
    FiArrowLeft, FiPlus, FiTwitter, FiBarChart2,
    FiTrash2, FiX, FiAward, FiTarget, FiStar,
    FiCalendar, FiCheck, FiEdit2, FiSave, FiFileText
} from 'react-icons/fi'
import { FaTrophy, FaBirthdayCake } from 'react-icons/fa'
import { supabase } from '../lib/supabase'
import ConfirmModal from '../components/ConfirmModal'
import StatutBadge from '../components/StatutBadge'
import { STATUT_COLORS } from '../lib/statut'
import { useToastContext } from '../context/ToastContext'
import { SkeletonStatPill, SkeletonTable, SkeletonChart } from '../components/SkeletonCard'
import '../styles/playerdetail.css'

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
        <div className="chart-tooltip">
            <p className="chart-tooltip-label">{label}</p>
            {payload.map((p, i) => (
                <p key={i} style={{ color: p.color, fontSize: '0.82rem', margin: '2px 0' }}>
                    {p.name} : <strong>{p.value}</strong>
                </p>
            ))}
        </div>
    )
}

const PERIODS = [
    { label: '7j',     days: 7    },
    { label: '30j',    days: 30   },
    { label: '3 mois', days: 90   },
    { label: 'Tout',   days: null },
]

const EMPTY_PERF = {
    date: '', event_name: '', classement: '',
    top1_count: '', pr_win_count: '', pr_total: '', region: 'EU',
}

export default function PlayerDetail({ session }) {
    const { id } = useParams()
    const navigate = useNavigate()
    const toast = useToastContext()
    const dragControls1 = useDragControls()
    const dragControls2 = useDragControls()

    const [player, setPlayer]               = useState(null)
    const [performances, setPerformances]   = useState([])
    const [showForm, setShowForm]           = useState(false)
    const [showEdit, setShowEdit]           = useState(false)
    const [editPerfId, setEditPerfId]       = useState(null)
    const [editPerfForm, setEditPerfForm]   = useState(EMPTY_PERF)
    const [savingPerf, setSavingPerf]       = useState(false)
    const [loading, setLoading]             = useState(true)
    const [saving, setSaving]               = useState(false)
    const [savingEdit, setSavingEdit]       = useState(false)
    const [savingNotes, setSavingNotes]     = useState(false)
    const [notesSaved, setNotesSaved]       = useState(false)
    const [error, setError]                 = useState('')
    const [editPerfError, setEditPerfError] = useState('')
    const [editSuccess, setEditSuccess]     = useState(false)
    const [confirmModal, setConfirmModal]   = useState({ open: false, perfId: null })
    const [lastKnownPr, setLastKnownPr]     = useState(0)
    const [period, setPeriod]               = useState(null)
    const [notes, setNotes]                 = useState('')

    const [editForm, setEditForm] = useState({
        pseudo: '', age: '', team: '', pr_link: '', twitter: '',
        statut: 'Actif', pr_objectif: ''
    })

    const [form, setForm] = useState({
        date:         new Date().toISOString().split('T')[0],
        event_name:   '',
        classement:   '',
        top1_count:   '',
        pr_win_count: '',
        pr_total:     '',
        region:       'EU',
    })

    const REGIONS = ['EU', 'NA-East', 'NA-West', 'BR', 'OCE', 'Asia', 'ME']

    const fetchAll = async () => {
        const [{ data: p }, { data: perf }] = await Promise.all([
            supabase.from('players').select('*').eq('id', id).single(),
            supabase.from('performances').select('*').eq('player_id', id).order('date', { ascending: true }),
        ])
        setPlayer(p)
        if (p) {
            setEditForm({
                pseudo:      p.pseudo      || '',
                age:         p.age         || '',
                team:        p.team        || '',
                pr_link:     p.pr_link     || '',
                twitter:     p.twitter     || '',
                statut:      p.statut      || 'Actif',
                pr_objectif: p.pr_objectif || '',
            })
            setNotes(p.notes || '')
        }
        if (perf && perf.length > 0) {
            const last = [...perf].reverse().find(x => x.pr_total)
            const lastPrValue = last?.pr_total || 0
            setLastKnownPr(lastPrValue)
            setForm(prev => ({ ...prev, pr_total: lastPrValue ? String(lastPrValue) : '' }))
        }
        setPerformances(perf || [])
        setLoading(false)
    }

    useEffect(() => {
        if (!id) return
        fetchAll()
    }, [id])

    const filteredByPeriod = useMemo(() => {
        if (!period) return performances
        const cutoff = new Date()
        cutoff.setDate(cutoff.getDate() - period)
        return performances.filter(p => new Date(p.date) >= cutoff)
    }, [performances, period])

    const chartData = filteredByPeriod.map(p => ({
        date: p.date, classement: p.classement,
        top1: p.top1_count, pr: p.pr_total, prWin: p.pr_win_count,
    }))

    const handleEditPlayer = async (e) => {
        e.preventDefault()
        setSavingEdit(true)
        const { error } = await supabase.from('players').update({
            pseudo:      editForm.pseudo,
            age:         editForm.age         ? parseInt(editForm.age)         : null,
            team:        editForm.team        || null,
            pr_link:     editForm.pr_link     || null,
            twitter:     editForm.twitter     || null,
            statut:      editForm.statut,
            pr_objectif: editForm.pr_objectif ? parseInt(editForm.pr_objectif) : null,
        }).eq('id', id)

        if (error) { toast.error('Erreur lors de la sauvegarde.'); setSavingEdit(false); return }
        await fetchAll()
        setEditSuccess(true)
        toast.success('Joueur modifié avec succès !')
        setTimeout(() => { setEditSuccess(false); setShowEdit(false) }, 1200)
        setSavingEdit(false)
    }

    const handleAddPerf = async (e) => {
        e.preventDefault()
        setSaving(true)
        setError('')
        const { error } = await supabase.from('performances').insert({
            player_id:    id,
            date:         form.date,
            event_name:   form.event_name   || null,
            classement:   form.classement   ? parseInt(form.classement)   : null,
            top1_count:   form.top1_count   ? parseInt(form.top1_count)   : 0,
            pr_win_count: form.pr_win_count ? parseInt(form.pr_win_count) : 0,
            pr_total:     form.pr_total     ? parseInt(form.pr_total)     : null,
            region:       form.region,
        })
        if (error) { setError(error.message); toast.error(error.message); setSaving(false); return }
        const newLastPr = form.pr_total ? parseInt(form.pr_total) : lastKnownPr
        setLastKnownPr(newLastPr)
        setForm({
            date: new Date().toISOString().split('T')[0],
            event_name: '', classement: '', top1_count: '',
            pr_win_count: '', pr_total: String(newLastPr), region: 'EU',
        })
        setShowForm(false)
        toast.success('Performance enregistrée !')
        fetchAll()
        setSaving(false)
    }

    const openEditPerf = (perf) => {
        setEditPerfId(perf.id)
        setEditPerfForm({
            date:         perf.date         || '',
            event_name:   perf.event_name   || '',
            classement:   perf.classement   || '',
            top1_count:   perf.top1_count   || '',
            pr_win_count: perf.pr_win_count || '',
            pr_total:     perf.pr_total     || '',
            region:       perf.region       || 'EU',
        })
        setEditPerfError('')
    }

    const handleEditPerf = async (e) => {
        e.preventDefault()
        setSavingPerf(true)
        setEditPerfError('')
        const { error } = await supabase.from('performances').update({
            date:         editPerfForm.date,
            event_name:   editPerfForm.event_name   || null,
            classement:   editPerfForm.classement   ? parseInt(editPerfForm.classement)   : null,
            top1_count:   editPerfForm.top1_count   ? parseInt(editPerfForm.top1_count)   : 0,
            pr_win_count: editPerfForm.pr_win_count ? parseInt(editPerfForm.pr_win_count) : 0,
            pr_total:     editPerfForm.pr_total     ? parseInt(editPerfForm.pr_total)     : null,
            region:       editPerfForm.region,
        }).eq('id', editPerfId)

        if (error) { setEditPerfError(error.message); toast.error(error.message); setSavingPerf(false); return }
        toast.success('Performance modifiée !')
        setEditPerfId(null)
        fetchAll()
        setSavingPerf(false)
    }

    const deletePerf = async () => {
        await supabase.from('performances').delete().eq('id', confirmModal.perfId)
        setPerformances(prev => prev.filter(p => p.id !== confirmModal.perfId))
        setConfirmModal({ open: false, perfId: null })
        toast.success('Performance supprimée.')
    }

    const handleSaveNotes = async () => {
        setSavingNotes(true)
        const { error } = await supabase.from('players').update({ notes }).eq('id', id)
        if (error) { toast.error('Erreur lors de la sauvegarde.'); setSavingNotes(false); return }
        setNotesSaved(true)
        toast.success('Notes sauvegardées !')
        setTimeout(() => setNotesSaved(false), 2000)
        setSavingNotes(false)
    }

    const totalTop1   = performances.reduce((s, p) => s + (p.top1_count || 0), 0)
    const totalPrWins = performances.reduce((s, p) => s + (p.pr_win_count || 0), 0)
    const bestRank    = performances.length ? Math.min(...performances.map(p => p.classement).filter(Boolean)) : '-'
    const lastPr      = [...performances].reverse().find(p => p.pr_total)?.pr_total || '-'

    if (loading) return (
        <div className="container" style={{ padding: '2rem 0 5rem' }}>
            <motion.div animate={{ opacity: [0.4, 0.8, 0.4] }} transition={{ duration: 1.5, repeat: Infinity }}
                style={{ width: 80, height: 14, borderRadius: 4, background: 'rgba(255,255,255,0.05)', marginBottom: '1.5rem' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <motion.div animate={{ opacity: [0.4, 0.8, 0.4] }} transition={{ duration: 1.5, repeat: Infinity }}
                    style={{ width: 64, height: 64, borderRadius: 16, background: 'rgba(255,255,255,0.06)', flexShrink: 0 }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                    <motion.div animate={{ opacity: [0.4, 0.8, 0.4] }} transition={{ duration: 1.5, repeat: Infinity }}
                        style={{ width: '40%', height: 26, borderRadius: 6, background: 'rgba(255,255,255,0.07)' }} />
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {Array(3).fill(0).map((_, i) => (
                            <motion.div key={i} animate={{ opacity: [0.4, 0.8, 0.4] }} transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
                                style={{ width: 70, height: 22, borderRadius: 20, background: 'rgba(255,255,255,0.05)' }} />
                        ))}
                    </div>
                </div>
            </div>
            <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
                {Array(5).fill(0).map((_, i) => <SkeletonStatPill key={i} />)}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                <SkeletonChart /><SkeletonChart />
            </div>
            <SkeletonTable />
        </div>
    )

    if (!player) return (
        <div style={{ padding: '2rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
            Joueur introuvable.
        </div>
    )

    return (
        <div className="pd-wrapper">
            <div className="container pd-content">

                {/* ── Back ── */}
                <motion.button className="pd-back" onClick={() => navigate('/')}
                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                    whileHover={{ x: -4 }} whileTap={{ scale: 0.95 }}>
                    <FiArrowLeft size={16} /> Retour
                </motion.button>

                {/* ── Header ── */}
                <motion.div className="pd-header" initial={{ opacity: 0, y: -24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5 }}>
                    <div className="pd-header-left">
                        <div className="pd-avatar">{player.pseudo?.[0]?.toUpperCase()}</div>
                        <div>
                            <h1 className="pd-name">{player.pseudo}</h1>
                            <div className="pd-tags">
                                <StatutBadge statut={player.statut || 'Actif'} />
                                {player.team && <span className="badge-team"><FaTrophy size={11} /> {player.team}</span>}
                                {player.age && <span className="pd-tag-neutral"><FaBirthdayCake size={11} /> {player.age} ans</span>}
                            </div>
                        </div>
                    </div>
                    <div className="pd-header-right">
                        <motion.button className="pd-edit-btn" onClick={() => setShowEdit(true)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <FiEdit2 size={14} /> Modifier le joueur
                        </motion.button>
                        <div className="pd-header-links">
                            {player.twitter && (
                                <motion.a href={`https://twitter.com/${player.twitter}`} target="_blank" rel="noreferrer"
                                    className="pd-link pd-link--twitter" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    <FiTwitter size={14} /> @{player.twitter}
                                </motion.a>
                            )}
                            {player.pr_link && (
                                <motion.a href={player.pr_link} target="_blank" rel="noreferrer"
                                    className="pd-link pd-link--pr" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    <FiBarChart2 size={14} /> PR Tracker
                                </motion.a>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* ── Edit Player Modal ── */}
                <AnimatePresence>
                    {showEdit && (
                        <>
                            <motion.div className="pd-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowEdit(false)} />
                            <motion.div
                                className="pd-modal"
                                drag
                                dragControls={dragControls1}
                                dragMomentum={false}
                                dragElastic={0}
                                initial={{ opacity: 0, scale: 0.92, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.92, y: 20 }}
                                transition={{ duration: 0.25, ease: 'easeOut' }}
                                style={{ cursor: 'default' }}
                            >
                                <div className="pd-modal-header" onPointerDown={(e) => dragControls1.start(e)}>
                                    <h3 className="pd-modal-title"><FiEdit2 size={16} /> Modifier le joueur</h3>
                                    <motion.button className="pd-modal-close" onClick={() => setShowEdit(false)}
                                        whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }}>
                                        <FiX size={16} />
                                    </motion.button>
                                </div>
                                <form onSubmit={handleEditPlayer}>
                                    <div className="row g-3">
                                        <div className="col-12 col-md-6">
                                            <label className="pd-label">Pseudo *</label>
                                            <input className="pd-input" type="text" value={editForm.pseudo} required onChange={e => setEditForm({ ...editForm, pseudo: e.target.value })} />
                                        </div>
                                        <div className="col-12 col-md-6">
                                            <label className="pd-label">Âge</label>
                                            <input className="pd-input" type="number" value={editForm.age} placeholder="ex: 18" onChange={e => setEditForm({ ...editForm, age: e.target.value })} />
                                        </div>
                                        <div className="col-12 col-md-6">
                                            <label className="pd-label">Team</label>
                                            <input className="pd-input" type="text" value={editForm.team} placeholder="Nom de la team" onChange={e => setEditForm({ ...editForm, team: e.target.value })} />
                                        </div>
                                        <div className="col-12 col-md-6">
                                            <label className="pd-label">Twitter (sans @)</label>
                                            <input className="pd-input" type="text" value={editForm.twitter} placeholder="pseudo" onChange={e => setEditForm({ ...editForm, twitter: e.target.value })} />
                                        </div>
                                        <div className="col-12 col-md-6">
                                            <label className="pd-label">Lien PR Tracker</label>
                                            <input className="pd-input" type="url" value={editForm.pr_link} placeholder="https://fortnitetracker.com/profile/..." onChange={e => setEditForm({ ...editForm, pr_link: e.target.value })} />
                                        </div>
                                        <div className="col-12 col-md-6">
                                            <label className="pd-label">Objectif PR</label>
                                            <input className="pd-input" type="number" min="0" value={editForm.pr_objectif} placeholder="ex: 5000" onChange={e => setEditForm({ ...editForm, pr_objectif: e.target.value })} />
                                        </div>
                                        <div className="col-12">
                                            <label className="pd-label">Statut</label>
                                            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                                                {['Actif', 'Inactif', 'Free Agent'].map(s => (
                                                    <motion.button key={s} type="button" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                                        onClick={() => setEditForm({ ...editForm, statut: s })}
                                                        style={{
                                                            padding: '0.4rem 0.9rem', borderRadius: 8,
                                                            border: `1px solid ${editForm.statut === s ? STATUT_COLORS[s].border : 'rgba(255,255,255,0.08)'}`,
                                                            background: editForm.statut === s ? STATUT_COLORS[s].bg : 'transparent',
                                                            color: editForm.statut === s ? STATUT_COLORS[s].color : 'var(--text-muted)',
                                                            fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                                                        }}
                                                    >{s}</motion.button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <motion.button className="btn-accent mt-3" type="submit" disabled={savingEdit}
                                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                                        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                        {savingEdit ? <span className="auth-spinner" /> : editSuccess ? <><FiCheck size={15} /> Sauvegardé !</> : <><FiSave size={15} /> Sauvegarder</>}
                                    </motion.button>
                                </form>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>

                {/* ── Edit Performance Modal ── */}
                <AnimatePresence>
                    {editPerfId && (
                        <>
                            <motion.div className="pd-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEditPerfId(null)} />
                            <motion.div
                                className="pd-modal"
                                drag
                                dragControls={dragControls2}
                                dragMomentum={false}
                                dragElastic={0}
                                style={{ maxWidth: 600, cursor: 'default' }}
                                initial={{ opacity: 0, scale: 0.92, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.92, y: 20 }}
                                transition={{ duration: 0.25, ease: 'easeOut' }}
                            >
                                <div className="pd-modal-header" onPointerDown={(e) => dragControls2.start(e)}>
                                    <h3 className="pd-modal-title"><FiEdit2 size={16} /> Modifier la performance</h3>
                                    <motion.button className="pd-modal-close" onClick={() => setEditPerfId(null)}
                                        whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }}>
                                        <FiX size={16} />
                                    </motion.button>
                                </div>
                                <form onSubmit={handleEditPerf}>
                                    <div className="row g-3">
                                        <div className="col-12 col-md-4">
                                            <label className="pd-label">Date</label>
                                            <input className="pd-input" type="date" value={editPerfForm.date} onChange={e => setEditPerfForm({ ...editPerfForm, date: e.target.value })} required />
                                        </div>
                                        <div className="col-12 col-md-4">
                                            <label className="pd-label">Nom de l'event</label>
                                            <input className="pd-input" type="text" placeholder="Cash Cup, FNCS..." value={editPerfForm.event_name} onChange={e => setEditPerfForm({ ...editPerfForm, event_name: e.target.value })} />
                                        </div>
                                        <div className="col-12 col-md-4">
                                            <label className="pd-label">Région</label>
                                            <select className="pd-input" value={editPerfForm.region} onChange={e => setEditPerfForm({ ...editPerfForm, region: e.target.value })}>
                                                {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                                            </select>
                                        </div>
                                        <div className="col-6 col-md-3">
                                            <label className="pd-label">Classement</label>
                                            <input className="pd-input" type="number" min="1" placeholder="ex: 12" value={editPerfForm.classement} onChange={e => setEditPerfForm({ ...editPerfForm, classement: e.target.value })} />
                                        </div>
                                        <div className="col-6 col-md-3">
                                            <label className="pd-label">Top 1</label>
                                            <input className="pd-input" type="number" min="0" placeholder="0" value={editPerfForm.top1_count} onChange={e => setEditPerfForm({ ...editPerfForm, top1_count: e.target.value })} />
                                        </div>
                                        <div className="col-6 col-md-3">
                                            <label className="pd-label">PR Wins</label>
                                            <input className="pd-input" type="number" min="0" placeholder="0" value={editPerfForm.pr_win_count} onChange={e => setEditPerfForm({ ...editPerfForm, pr_win_count: e.target.value })} />
                                        </div>
                                        <div className="col-6 col-md-3">
                                            <label className="pd-label">PR Total</label>
                                            <input className="pd-input" type="number" min="0" placeholder="ex: 4200" value={editPerfForm.pr_total} onChange={e => setEditPerfForm({ ...editPerfForm, pr_total: e.target.value })} />
                                        </div>
                                    </div>
                                    {editPerfError && <div className="alert-fn mt-3">{editPerfError}</div>}
                                    <motion.button className="btn-accent mt-3" type="submit" disabled={savingPerf}
                                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                                        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                        {savingPerf ? <span className="auth-spinner" /> : <><FiSave size={15} /> Sauvegarder la performance</>}
                                    </motion.button>
                                </form>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>

                {/* ── Stats ── */}
                <motion.div className="pd-stats" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }}>
                    {[
                        { label: 'Tournois',            value: performances.length, icon: <FiCalendar size={18} />,  color: 'cyan'   },
                        { label: 'Top 1 total',         value: totalTop1,           icon: <FiStar size={18} />,      color: 'gold'   },
                        { label: 'PR Wins',             value: totalPrWins,         icon: <FiTarget size={18} />,    color: 'purple' },
                        { label: 'Meilleur classement', value: bestRank,            icon: <FiAward size={18} />,     color: 'pink'   },
                        { label: 'PR actuel',           value: lastPr,              icon: <FiBarChart2 size={18} />, color: 'cyan'   },
                    ].map((s, i) => (
                        <motion.div key={i} className={`pd-stat pd-stat--${s.color}`}
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 + i * 0.07 }} whileHover={{ scale: 1.05, y: -3 }}>
                            <div className="pd-stat-icon">{s.icon}</div>
                            <div className="pd-stat-value">{s.value}</div>
                            <div className="pd-stat-label">{s.label}</div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* ── Objectif PR ── */}
                {player.pr_objectif && (
                    <motion.div className="pd-objectif" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28, duration: 0.5 }}>
                        {(() => {
                            const current   = typeof lastPr === 'number' ? lastPr : 0
                            const target    = player.pr_objectif
                            const pct       = Math.min((current / target) * 100, 100)
                            const done      = current >= target
                            const remaining = Math.max(target - current, 0)
                            return (
                                <>
                                    <div className="pd-objectif-header">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <FiTarget size={15} style={{ color: done ? '#00d464' : 'var(--accent-purple)' }} />
                                            <span className="pd-objectif-title">Objectif PR</span>
                                            {done && (
                                                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400 }}
                                                    style={{ background: 'rgba(0,212,100,0.1)', border: '1px solid rgba(0,212,100,0.3)', color: '#00d464', padding: '0.15rem 0.6rem', borderRadius: 20, fontSize: '0.72rem', fontWeight: 700 }}>
                                                    ✓ Atteint !
                                                </motion.span>
                                            )}
                                        </div>
                                        <div className="pd-objectif-values">
                                            <span style={{ color: done ? '#00d464' : 'var(--accent-cyan)', fontWeight: 700 }}>{current.toLocaleString()}</span>
                                            <span style={{ color: 'var(--text-muted)' }}>/</span>
                                            <span style={{ color: 'var(--text-secondary)' }}>{target.toLocaleString()} PR</span>
                                        </div>
                                    </div>
                                    <div className="pd-objectif-bar-bg">
                                        <motion.div className="pd-objectif-bar-fill"
                                            initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                                            transition={{ duration: 1, ease: 'easeOut', delay: 0.4 }}
                                            style={{ background: done ? 'linear-gradient(90deg, #00d464, #00d4ff)' : 'linear-gradient(90deg, var(--accent-purple), var(--accent-cyan))' }}
                                        />
                                    </div>
                                    <div className="pd-objectif-footer">
                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{pct.toFixed(1)}% complété</span>
                                        {!done && <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{remaining.toLocaleString()} PR restants</span>}
                                    </div>
                                </>
                            )
                        })()}
                    </motion.div>
                )}

                {/* ── Charts ── */}
                {performances.length >= 2 && (
                    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.5 }}>
                        <div className="pd-period-bar">
                            <span className="pd-period-label"><FiCalendar size={13} /> Période</span>
                            <div className="pd-period-btns">
                                {PERIODS.map(p => (
                                    <motion.button key={p.label} className={`pd-period-btn ${period === p.days ? 'pd-period-btn--active' : ''}`}
                                        onClick={() => setPeriod(p.days)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                        {p.label}
                                        {period === p.days && <motion.div className="pd-period-indicator" layoutId="period-indicator" transition={{ type: 'spring', stiffness: 400, damping: 30 }} />}
                                    </motion.button>
                                ))}
                            </div>
                            {filteredByPeriod.length !== performances.length && (
                                <span className="pd-period-count">{filteredByPeriod.length} résultat{filteredByPeriod.length > 1 ? 's' : ''}</span>
                            )}
                        </div>

                        {filteredByPeriod.length < 2 ? (
                            <motion.div className="pd-empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginBottom: '2rem' }}>
                                <FiBarChart2 size={30} style={{ color: 'var(--accent-cyan)', opacity: 0.3, marginBottom: '0.6rem' }} />
                                <p>Pas assez de données pour cette période.</p>
                            </motion.div>
                        ) : (
                            <div className="pd-charts">
                                <div className="pd-chart-card">
                                    <h3 className="pd-chart-title"><FiBarChart2 size={15} /> Évolution du classement</h3>
                                    <ResponsiveContainer width="100%" height={220}>
                                        <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                                            <XAxis dataKey="date" tick={{ fill: '#8888aa', fontSize: 11 }} tickLine={false} />
                                            <YAxis reversed tick={{ fill: '#8888aa', fontSize: 11 }} tickLine={false} axisLine={false} />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Line type="monotone" dataKey="classement" name="Classement" stroke="#00d4ff" strokeWidth={2.5} dot={{ fill: '#00d4ff', r: 4, strokeWidth: 0 }} activeDot={{ r: 6, fill: '#00d4ff' }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                                {chartData.some(d => d.pr) && (
                                    <div className="pd-chart-card">
                                        <h3 className="pd-chart-title"><FiStar size={15} /> Évolution PR</h3>
                                        <ResponsiveContainer width="100%" height={220}>
                                            <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                                                <XAxis dataKey="date" tick={{ fill: '#8888aa', fontSize: 11 }} tickLine={false} />
                                                <YAxis tick={{ fill: '#8888aa', fontSize: 11 }} tickLine={false} axisLine={false} />
                                                <Tooltip content={<CustomTooltip />} />
                                                <Line type="monotone" dataKey="pr" name="PR Total" stroke="#7b2ff7" strokeWidth={2.5} dot={{ fill: '#7b2ff7', r: 4, strokeWidth: 0 }} activeDot={{ r: 6, fill: '#7b2ff7' }} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                )}
                                <div className="pd-chart-card pd-chart-card--full">
                                    <h3 className="pd-chart-title"><FiAward size={15} /> Top 1 & PR Wins par tournoi</h3>
                                    <ResponsiveContainer width="100%" height={220}>
                                        <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                                            <XAxis dataKey="date" tick={{ fill: '#8888aa', fontSize: 11 }} tickLine={false} />
                                            <YAxis tick={{ fill: '#8888aa', fontSize: 11 }} tickLine={false} axisLine={false} />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Legend wrapperStyle={{ fontSize: '0.8rem', color: '#8888aa' }} />
                                            <Bar dataKey="top1" name="Top 1" fill="#ffd700" radius={[4, 4, 0, 0]} />
                                            <Bar dataKey="prWin" name="PR Wins" fill="#7b2ff7" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}

                {/* ── Performances ── */}
                <motion.div className="pd-section" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.5 }}>
                    <div className="pd-section-header">
                        <h2 className="pd-section-title">Performances</h2>
                        <motion.button className={showForm ? 'btn-ghost' : 'btn-accent'} onClick={() => setShowForm(v => !v)}
                            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
                            {showForm ? <><FiX size={14} /> Annuler</> : <><FiPlus size={14} /> Ajouter</>}
                        </motion.button>
                    </div>

                    <AnimatePresence>
                        {showForm && (
                            <motion.div key="perf-form" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }} style={{ overflow: 'hidden', marginBottom: '1.5rem' }}>
                                <div className="pd-form-card">
                                    <form onSubmit={handleAddPerf}>
                                        <div className="row g-3">
                                            <div className="col-12 col-md-4">
                                                <label className="pd-label">Date</label>
                                                <input className="pd-input" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required />
                                            </div>
                                            <div className="col-12 col-md-4">
                                                <label className="pd-label">Nom de l'event</label>
                                                <input className="pd-input" type="text" placeholder="Cash Cup, FNCS..." value={form.event_name} onChange={e => setForm({ ...form, event_name: e.target.value })} />
                                            </div>
                                            <div className="col-12 col-md-4">
                                                <label className="pd-label">Région</label>
                                                <select className="pd-input" value={form.region} onChange={e => setForm({ ...form, region: e.target.value })}>
                                                    {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                                                </select>
                                            </div>
                                            <div className="col-6 col-md-3">
                                                <label className="pd-label">Classement</label>
                                                <input className="pd-input" type="number" min="1" placeholder="ex: 12" value={form.classement} onChange={e => setForm({ ...form, classement: e.target.value })} />
                                            </div>
                                            <div className="col-6 col-md-3">
                                                <label className="pd-label">Top 1</label>
                                                <input className="pd-input" type="number" min="0" placeholder="0" value={form.top1_count} onChange={e => setForm({ ...form, top1_count: e.target.value })} />
                                            </div>
                                            <div className="col-6 col-md-3">
                                                <label className="pd-label">PR Wins</label>
                                                <input className="pd-input" type="number" min="0" placeholder="0" value={form.pr_win_count}
                                                    onChange={e => {
                                                        const wins = parseInt(e.target.value) || 0
                                                        setForm({ ...form, pr_win_count: e.target.value, pr_total: String(lastKnownPr + wins) })
                                                    }} />
                                            </div>
                                            <div className="col-6 col-md-3">
                                                <label className="pd-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                    PR Total
                                                    {form.pr_win_count && parseInt(form.pr_win_count) > 0 && (
                                                        <span style={{ color: 'var(--accent-cyan)', fontSize: '0.68rem', fontWeight: 500, background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: '4px', padding: '0.05rem 0.4rem' }}>
                                                            {lastKnownPr} + {form.pr_win_count}
                                                        </span>
                                                    )}
                                                </label>
                                                <input className="pd-input" type="number" min="0" placeholder="ex: 4200" value={form.pr_total} onChange={e => setForm({ ...form, pr_total: e.target.value })} />
                                            </div>
                                        </div>
                                        {error && <div className="alert-fn mt-3">{error}</div>}
                                        <motion.button className="btn-accent mt-3" type="submit" disabled={saving}
                                            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                                            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                            {saving ? <span className="auth-spinner" /> : <><FiCheck size={15} /> Enregistrer</>}
                                        </motion.button>
                                    </form>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {performances.length === 0 ? (
                        <motion.div className="pd-empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <FiBarChart2 size={36} style={{ color: 'var(--accent-cyan)', opacity: 0.3, marginBottom: '0.8rem' }} />
                            <p>Aucune performance enregistrée.</p>
                            <p style={{ fontSize: '0.82rem', marginTop: '0.3rem' }}>Ajoute la première !</p>
                        </motion.div>
                    ) : (
                        <motion.div className="pd-table-wrapper" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
                            <table className="pd-table">
                                <thead>
                                    <tr>
                                        <th>Date</th><th>Event</th><th>Région</th><th>Classement</th>
                                        <th>Top 1</th><th>PR Wins</th><th>PR Total</th><th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <AnimatePresence>
                                        {[...performances].reverse().map((perf, i) => (
                                            <motion.tr key={perf.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ delay: i * 0.04 }}>
                                                <td>{perf.date}</td>
                                                <td style={{ color: 'var(--text-secondary)' }}>{perf.event_name || '—'}</td>
                                                <td>{perf.region && <span className="pd-region-badge">{perf.region}</span>}</td>
                                                <td>{perf.classement ? <span className="pd-rank">#{perf.classement}</span> : '—'}</td>
                                                <td>{perf.top1_count > 0 ? <span className="pd-top1">{perf.top1_count} ★</span> : <span style={{ color: 'var(--text-muted)' }}>0</span>}</td>
                                                <td>{perf.pr_win_count > 0 ? <span style={{ color: 'var(--accent-purple)', fontWeight: 600 }}>{perf.pr_win_count}</span> : <span style={{ color: 'var(--text-muted)' }}>0</span>}</td>
                                                <td>{perf.pr_total ? <span style={{ color: 'var(--accent-cyan)', fontWeight: 700 }}>{perf.pr_total.toLocaleString()}</span> : '—'}</td>
                                                <td>
                                                    <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                                                        <motion.button className="pd-edit-perf-btn" onClick={() => openEditPerf(perf)} whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} title="Modifier">
                                                            <FiEdit2 size={13} />
                                                        </motion.button>
                                                        <motion.button className="pd-delete-btn" onClick={() => setConfirmModal({ open: true, perfId: perf.id })} whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} title="Supprimer">
                                                            <FiTrash2 size={13} />
                                                        </motion.button>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </AnimatePresence>
                                </tbody>
                            </table>
                        </motion.div>
                    )}
                </motion.div>

                {/* ── Notes privées ── */}
                <motion.div className="pd-section" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45, duration: 0.5 }}>
                    <div className="pd-section-header">
                        <h2 className="pd-section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FiFileText size={18} /> Notes privées
                        </h2>
                        <motion.button className={notesSaved ? 'btn-ghost' : 'btn-accent'} onClick={handleSaveNotes} disabled={savingNotes}
                            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
                            {savingNotes ? <span className="auth-spinner" /> : notesSaved ? <><FiCheck size={14} /> Sauvegardé !</> : <><FiSave size={14} /> Sauvegarder</>}
                        </motion.button>
                    </div>
                    <div className="pd-notes-wrapper">
                        <textarea className="pd-notes-input" value={notes} onChange={e => setNotes(e.target.value)}
                            placeholder="Observations, points à améliorer, stratégies, remarques sur le joueur..." rows={6}
                            onKeyDown={e => { if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); handleSaveNotes() } }}
                        />
                        <div className="pd-notes-footer">
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>{notes.length} caractères</span>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>Ctrl+S pour sauvegarder</span>
                        </div>
                    </div>
                </motion.div>

                <ConfirmModal
                    isOpen={confirmModal.open}
                    title="Supprimer la performance ?"
                    message="Cette performance sera définitivement supprimée. Tu ne pourras pas la récupérer."
                    onConfirm={deletePerf}
                    onCancel={() => setConfirmModal({ open: false, perfId: null })}
                />

            </div>
        </div>
    )
}
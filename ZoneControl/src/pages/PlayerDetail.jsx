import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
    LineChart, Line, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Legend
} from 'recharts'
import {
    FiArrowLeft, FiPlus, FiTwitter, FiBarChart2,
    FiTrash2, FiX, FiAward, FiTarget, FiStar,
    FiCalendar, FiCheck, FiEdit2, FiSave, FiAlertTriangle
} from 'react-icons/fi'
import { FaTrophy, FaBirthdayCake } from 'react-icons/fa'
import { supabase } from '../lib/supabase'
import ConfirmModal from '../components/ConfirmModal'
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

export default function PlayerDetail({ session }) {
    const { id } = useParams()
    const navigate = useNavigate()

    const [player, setPlayer]             = useState(null)
    const [performances, setPerformances] = useState([])
    const [showForm, setShowForm]         = useState(false)
    const [showEdit, setShowEdit]         = useState(false)
    const [loading, setLoading]           = useState(true)
    const [saving, setSaving]             = useState(false)
    const [savingEdit, setSavingEdit]     = useState(false)
    const [error, setError]               = useState('')
    const [editSuccess, setEditSuccess]   = useState(false)
    const [confirmModal, setConfirmModal] = useState({ open: false, perfId: null })

    const [editForm, setEditForm] = useState({
        pseudo: '', age: '', team: '', pr_link: '', twitter: ''
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
                pseudo:  p.pseudo  || '',
                age:     p.age     || '',
                team:    p.team    || '',
                pr_link: p.pr_link || '',
                twitter: p.twitter || '',
            })
        }
        setPerformances(perf || [])
        setLoading(false)
    }

    useEffect(() => {
        if (!id) return
        fetchAll()
    }, [id])

    const handleEditPlayer = async (e) => {
        e.preventDefault()
        setSavingEdit(true)
        const { error } = await supabase.from('players').update({
            pseudo:  editForm.pseudo,
            age:     editForm.age ? parseInt(editForm.age) : null,
            team:    editForm.team    || null,
            pr_link: editForm.pr_link || null,
            twitter: editForm.twitter || null,
        }).eq('id', id)

        if (error) { setSavingEdit(false); return }
        await fetchAll()
        setEditSuccess(true)
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
        if (error) { setError(error.message); setSaving(false); return }
        setForm({
            date: new Date().toISOString().split('T')[0],
            event_name: '', classement: '', top1_count: '',
            pr_win_count: '', pr_total: '', region: 'EU',
        })
        setShowForm(false)
        fetchAll()
        setSaving(false)
    }

    const deletePerf = async () => {
        await supabase.from('performances').delete().eq('id', confirmModal.perfId)
        setPerformances(prev => prev.filter(p => p.id !== confirmModal.perfId))
        setConfirmModal({ open: false, perfId: null })
    }

    const totalTop1   = performances.reduce((s, p) => s + (p.top1_count || 0), 0)
    const totalPrWins = performances.reduce((s, p) => s + (p.pr_win_count || 0), 0)
    const bestRank    = performances.length
        ? Math.min(...performances.map(p => p.classement).filter(Boolean))
        : '-'
    const lastPr = [...performances].reverse().find(p => p.pr_total)?.pr_total || '-'

    const chartData = performances.map(p => ({
        date:       p.date,
        classement: p.classement,
        top1:       p.top1_count,
        pr:         p.pr_total,
        prWin:      p.pr_win_count,
    }))

    if (loading) return (
        <div style={{ height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="spinner-fn" />
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
                <motion.button
                    className="pd-back"
                    onClick={() => navigate('/')}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    whileHover={{ x: -4 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <FiArrowLeft size={16} /> Retour
                </motion.button>

                {/* ── Header ── */}
                <motion.div
                    className="pd-header"
                    initial={{ opacity: 0, y: -24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.5 }}
                >
                    <div className="pd-header-left">
                        <div className="pd-avatar">
                            {player.pseudo?.[0]?.toUpperCase()}
                        </div>
                        <div>
                            <h1 className="pd-name">{player.pseudo}</h1>
                            <div className="pd-tags">
                                {player.team && (
                                    <span className="badge-team">
                                        <FaTrophy size={11} /> {player.team}
                                    </span>
                                )}
                                {player.age && (
                                    <span className="pd-tag-neutral">
                                        <FaBirthdayCake size={11} /> {player.age} ans
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="pd-header-right">
                        <motion.button
                            className="pd-edit-btn"
                            onClick={() => setShowEdit(true)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <FiEdit2 size={14} /> Modifier le joueur
                        </motion.button>

                        <div className="pd-header-links">
                            {player.twitter && (
                                <motion.a
                                    href={`https://twitter.com/${player.twitter}`}
                                    target="_blank" rel="noreferrer"
                                    className="pd-link pd-link--twitter"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <FiTwitter size={14} /> @{player.twitter}
                                </motion.a>
                            )}
                            {player.pr_link && (
                                <motion.a
                                    href={player.pr_link}
                                    target="_blank" rel="noreferrer"
                                    className="pd-link pd-link--pr"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <FiBarChart2 size={14} /> PR Tracker
                                </motion.a>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* ── Edit Modal ── */}
                <AnimatePresence>
                    {showEdit && (
                        <>
                            <motion.div
                                className="pd-modal-overlay"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setShowEdit(false)}
                            />
                            <motion.div
                                className="pd-modal"
                                initial={{ opacity: 0, scale: 0.92, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.92, y: 20 }}
                                transition={{ duration: 0.25, ease: 'easeOut' }}
                            >
                                <div className="pd-modal-header">
                                    <h3 className="pd-modal-title">
                                        <FiEdit2 size={16} /> Modifier le joueur
                                    </h3>
                                    <motion.button
                                        className="pd-modal-close"
                                        onClick={() => setShowEdit(false)}
                                        whileHover={{ scale: 1.1, rotate: 90 }}
                                        whileTap={{ scale: 0.9 }}
                                    >
                                        <FiX size={16} />
                                    </motion.button>
                                </div>

                                <form onSubmit={handleEditPlayer}>
                                    <div className="row g-3">
                                        <div className="col-12 col-md-6">
                                            <label className="pd-label">Pseudo *</label>
                                            <input className="pd-input" type="text"
                                                value={editForm.pseudo} required
                                                onChange={e => setEditForm({ ...editForm, pseudo: e.target.value })} />
                                        </div>
                                        <div className="col-12 col-md-6">
                                            <label className="pd-label">Âge</label>
                                            <input className="pd-input" type="number"
                                                value={editForm.age} placeholder="ex: 18"
                                                onChange={e => setEditForm({ ...editForm, age: e.target.value })} />
                                        </div>
                                        <div className="col-12 col-md-6">
                                            <label className="pd-label">Team</label>
                                            <input className="pd-input" type="text"
                                                value={editForm.team} placeholder="Nom de la team"
                                                onChange={e => setEditForm({ ...editForm, team: e.target.value })} />
                                        </div>
                                        <div className="col-12 col-md-6">
                                            <label className="pd-label">Twitter (sans @)</label>
                                            <input className="pd-input" type="text"
                                                value={editForm.twitter} placeholder="pseudo"
                                                onChange={e => setEditForm({ ...editForm, twitter: e.target.value })} />
                                        </div>
                                        <div className="col-12">
                                            <label className="pd-label">Lien PR Tracker</label>
                                            <input className="pd-input" type="url"
                                                value={editForm.pr_link}
                                                placeholder="https://fortnitetracker.com/profile/..."
                                                onChange={e => setEditForm({ ...editForm, pr_link: e.target.value })} />
                                        </div>
                                    </div>

                                    <motion.button
                                        className="btn-accent mt-3"
                                        type="submit"
                                        disabled={savingEdit}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.97 }}
                                        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                    >
                                        {savingEdit
                                            ? <span className="auth-spinner" />
                                            : editSuccess
                                                ? <><FiCheck size={15} /> Sauvegardé !</>
                                                : <><FiSave size={15} /> Sauvegarder</>
                                        }
                                    </motion.button>
                                </form>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>

                {/* ── Stats ── */}
                <motion.div
                    className="pd-stats"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                >
                    {[
                        { label: 'Tournois',            value: performances.length, icon: <FiCalendar size={18} />,  color: 'cyan'   },
                        { label: 'Top 1 total',         value: totalTop1,           icon: <FiStar size={18} />,      color: 'gold'   },
                        { label: 'PR Wins',             value: totalPrWins,         icon: <FiTarget size={18} />,    color: 'purple' },
                        { label: 'Meilleur classement', value: bestRank,            icon: <FiAward size={18} />,     color: 'pink'   },
                        { label: 'PR actuel',           value: lastPr,              icon: <FiBarChart2 size={18} />, color: 'cyan'   },
                    ].map((s, i) => (
                        <motion.div
                            key={i}
                            className={`pd-stat pd-stat--${s.color}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 + i * 0.07 }}
                            whileHover={{ scale: 1.05, y: -3 }}
                        >
                            <div className="pd-stat-icon">{s.icon}</div>
                            <div className="pd-stat-value">{s.value}</div>
                            <div className="pd-stat-label">{s.label}</div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* ── Charts ── */}
                {performances.length >= 2 && (
                    <motion.div
                        className="pd-charts"
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.35, duration: 0.5 }}
                    >
                        <div className="pd-chart-card">
                            <h3 className="pd-chart-title">
                                <FiBarChart2 size={15} /> Évolution du classement
                            </h3>
                            <ResponsiveContainer width="100%" height={220}>
                                <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                                    <XAxis dataKey="date" tick={{ fill: '#8888aa', fontSize: 11 }} tickLine={false} />
                                    <YAxis reversed tick={{ fill: '#8888aa', fontSize: 11 }} tickLine={false} axisLine={false} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Line type="monotone" dataKey="classement" name="Classement"
                                        stroke="#00d4ff" strokeWidth={2.5}
                                        dot={{ fill: '#00d4ff', r: 4, strokeWidth: 0 }}
                                        activeDot={{ r: 6, fill: '#00d4ff' }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        {chartData.some(d => d.pr) && (
                            <div className="pd-chart-card">
                                <h3 className="pd-chart-title">
                                    <FiStar size={15} /> Évolution PR
                                </h3>
                                <ResponsiveContainer width="100%" height={220}>
                                    <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                                        <XAxis dataKey="date" tick={{ fill: '#8888aa', fontSize: 11 }} tickLine={false} />
                                        <YAxis tick={{ fill: '#8888aa', fontSize: 11 }} tickLine={false} axisLine={false} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Line type="monotone" dataKey="pr" name="PR Total"
                                            stroke="#7b2ff7" strokeWidth={2.5}
                                            dot={{ fill: '#7b2ff7', r: 4, strokeWidth: 0 }}
                                            activeDot={{ r: 6, fill: '#7b2ff7' }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        )}

                        <div className="pd-chart-card pd-chart-card--full">
                            <h3 className="pd-chart-title">
                                <FiAward size={15} /> Top 1 & PR Wins par tournoi
                            </h3>
                            <ResponsiveContainer width="100%" height={220}>
                                <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                                    <XAxis dataKey="date" tick={{ fill: '#8888aa', fontSize: 11 }} tickLine={false} />
                                    <YAxis tick={{ fill: '#8888aa', fontSize: 11 }} tickLine={false} axisLine={false} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend wrapperStyle={{ fontSize: '0.8rem', color: '#8888aa' }} />
                                    <Bar dataKey="top1"  name="Top 1"   fill="#ffd700" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="prWin" name="PR Wins" fill="#7b2ff7" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>
                )}

                {/* ── Performances ── */}
                <motion.div
                    className="pd-section"
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                >
                    <div className="pd-section-header">
                        <h2 className="pd-section-title">Performances</h2>
                        <motion.button
                            className={showForm ? 'btn-ghost' : 'btn-accent'}
                            onClick={() => setShowForm(v => !v)}
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.96 }}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}
                        >
                            {showForm
                                ? <><FiX size={14} /> Annuler</>
                                : <><FiPlus size={14} /> Ajouter</>
                            }
                        </motion.button>
                    </div>

                    <AnimatePresence>
                        {showForm && (
                            <motion.div
                                key="perf-form"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                                style={{ overflow: 'hidden', marginBottom: '1.5rem' }}
                            >
                                <div className="pd-form-card">
                                    <form onSubmit={handleAddPerf}>
                                        <div className="row g-3">
                                            <div className="col-12 col-md-4">
                                                <label className="pd-label">Date</label>
                                                <input className="pd-input" type="date"
                                                    value={form.date}
                                                    onChange={e => setForm({ ...form, date: e.target.value })} required />
                                            </div>
                                            <div className="col-12 col-md-4">
                                                <label className="pd-label">Nom de l'event</label>
                                                <input className="pd-input" type="text"
                                                    placeholder="Cash Cup, FNCS..."
                                                    value={form.event_name}
                                                    onChange={e => setForm({ ...form, event_name: e.target.value })} />
                                            </div>
                                            <div className="col-12 col-md-4">
                                                <label className="pd-label">Région</label>
                                                <select className="pd-input" value={form.region}
                                                    onChange={e => setForm({ ...form, region: e.target.value })}>
                                                    {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                                                </select>
                                            </div>
                                            <div className="col-6 col-md-3">
                                                <label className="pd-label">Classement</label>
                                                <input className="pd-input" type="number" min="1"
                                                    placeholder="ex: 12" value={form.classement}
                                                    onChange={e => setForm({ ...form, classement: e.target.value })} />
                                            </div>
                                            <div className="col-6 col-md-3">
                                                <label className="pd-label">Top 1</label>
                                                <input className="pd-input" type="number" min="0"
                                                    placeholder="0" value={form.top1_count}
                                                    onChange={e => setForm({ ...form, top1_count: e.target.value })} />
                                            </div>
                                            <div className="col-6 col-md-3">
                                                <label className="pd-label">PR Wins</label>
                                                <input className="pd-input" type="number" min="0"
                                                    placeholder="0" value={form.pr_win_count}
                                                    onChange={e => setForm({ ...form, pr_win_count: e.target.value })} />
                                            </div>
                                            <div className="col-6 col-md-3">
                                                <label className="pd-label">PR Total</label>
                                                <input className="pd-input" type="number" min="0"
                                                    placeholder="ex: 4200" value={form.pr_total}
                                                    onChange={e => setForm({ ...form, pr_total: e.target.value })} />
                                            </div>
                                        </div>

                                        {error && <div className="alert-fn mt-3">{error}</div>}

                                        <motion.button
                                            className="btn-accent mt-3"
                                            type="submit" disabled={saving}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.97 }}
                                            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                                        >
                                            {saving
                                                ? <span className="auth-spinner" />
                                                : <><FiCheck size={15} /> Enregistrer</>
                                            }
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
                                        <th>Date</th>
                                        <th>Event</th>
                                        <th>Région</th>
                                        <th>Classement</th>
                                        <th>Top 1</th>
                                        <th>PR Wins</th>
                                        <th>PR Total</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <AnimatePresence>
                                        {[...performances].reverse().map((perf, i) => (
                                            <motion.tr
                                                key={perf.id}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: 10 }}
                                                transition={{ delay: i * 0.04 }}
                                            >
                                                <td>{perf.date}</td>
                                                <td style={{ color: 'var(--text-secondary)' }}>{perf.event_name || '—'}</td>
                                                <td>{perf.region && <span className="pd-region-badge">{perf.region}</span>}</td>
                                                <td>{perf.classement ? <span className="pd-rank">#{perf.classement}</span> : '—'}</td>
                                                <td>
                                                    {perf.top1_count > 0
                                                        ? <span className="pd-top1">{perf.top1_count} ★</span>
                                                        : <span style={{ color: 'var(--text-muted)' }}>0</span>}
                                                </td>
                                                <td>
                                                    {perf.pr_win_count > 0
                                                        ? <span style={{ color: 'var(--accent-purple)', fontWeight: 600 }}>{perf.pr_win_count}</span>
                                                        : <span style={{ color: 'var(--text-muted)' }}>0</span>}
                                                </td>
                                                <td>
                                                    {perf.pr_total
                                                        ? <span style={{ color: 'var(--accent-cyan)', fontWeight: 700 }}>{perf.pr_total.toLocaleString()}</span>
                                                        : '—'}
                                                </td>
                                                <td>
                                                    <motion.button
                                                        className="pd-delete-btn"
                                                        onClick={() => setConfirmModal({ open: true, perfId: perf.id })}
                                                        whileHover={{ scale: 1.15 }}
                                                        whileTap={{ scale: 0.9 }}
                                                    >
                                                        <FiTrash2 size={13} />
                                                    </motion.button>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </AnimatePresence>
                                </tbody>
                            </table>
                        </motion.div>
                    )}
                </motion.div>

                {/* ── Confirm Modal ── */}
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
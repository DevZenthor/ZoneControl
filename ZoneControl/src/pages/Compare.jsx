import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
    LineChart, Line, RadarChart, Radar, PolarGrid,
    PolarAngleAxis, ResponsiveContainer, Tooltip,
    Legend, XAxis, YAxis, CartesianGrid
} from 'recharts'
import {
    FiArrowLeft, FiUsers, FiBarChart2, FiStar,
    FiTarget, FiAward, FiCalendar, FiX
} from 'react-icons/fi'
import { FaTrophy } from 'react-icons/fa'
import { supabase } from '../lib/supabase'
import StatutBadge from '../components/StatutBadge'
import { useToastContext } from '../context/ToastContext'
import '../styles/compare.css'

const COLORS = {
    p1: '#00d4ff',
    p2: '#ff2d78',
}

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

export default function Compare({ session }) {
    const navigate = useNavigate()
    const toast = useToastContext()

    const [players, setPlayers]           = useState([])
    const [player1, setPlayer1]           = useState(null)
    const [player2, setPlayer2]           = useState(null)
    const [perfs1, setPerfs1]             = useState([])
    const [perfs2, setPerfs2]             = useState([])
    const [loading, setLoading]           = useState(true)
    const [loadingPerfs, setLoadingPerfs] = useState(false)
    const [search1, setSearch1]           = useState('')
    const [search2, setSearch2]           = useState('')
    const [open1, setOpen1]               = useState(false)
    const [open2, setOpen2]               = useState(false)

    // Fetch tous les joueurs
    useEffect(() => {
        const fetchPlayers = async () => {
            const { data } = await supabase
                .from('players')
                .select('*')
                .order('pseudo', { ascending: true })
            setPlayers(data || [])
            setLoading(false)
        }
        fetchPlayers()
    }, [])

    // Fetch perfs quand joueur sélectionné
    const fetchPerfs = async (playerId, setter) => {
        const { data } = await supabase
            .from('performances')
            .select('*')
            .eq('player_id', playerId)
            .order('date', { ascending: true })
        setter(data || [])
    }

    useEffect(() => {
        if (player1) fetchPerfs(player1.id, setPerfs1)
        else setPerfs1([])
    }, [player1])

    useEffect(() => {
        if (player2) fetchPerfs(player2.id, setPerfs2)
        else setPerfs2([])
    }, [player2])

    // ── Stats calculées ──
    const stats1 = useMemo(() => calcStats(perfs1), [perfs1])
    const stats2 = useMemo(() => calcStats(perfs2), [perfs2])

    // ── Données graphique PR ──
    const prChartData = useMemo(() => {
        const allDates = [...new Set([
            ...perfs1.filter(p => p.pr_total).map(p => p.date),
            ...perfs2.filter(p => p.pr_total).map(p => p.date),
        ])].sort()

        return allDates.map(date => ({
            date,
            [player1?.pseudo || 'Joueur 1']: perfs1.find(p => p.date === date)?.pr_total || null,
            [player2?.pseudo || 'Joueur 2']: perfs2.find(p => p.date === date)?.pr_total || null,
        }))
    }, [perfs1, perfs2, player1, player2])

    // ── Données radar ──
    const radarData = useMemo(() => {
        if (!player1 || !player2) return []
        const max = (a, b) => Math.max(a, b) || 1
        return [
            {
                stat: 'Tournois',
                [player1.pseudo]: stats1.tournois,
                [player2.pseudo]: stats2.tournois,
                fullMark: max(stats1.tournois, stats2.tournois),
            },
            {
                stat: 'Top 1',
                [player1.pseudo]: stats1.top1,
                [player2.pseudo]: stats2.top1,
                fullMark: max(stats1.top1, stats2.top1),
            },
            {
                stat: 'PR Wins',
                [player1.pseudo]: stats1.prWins,
                [player2.pseudo]: stats2.prWins,
                fullMark: max(stats1.prWins, stats2.prWins),
            },
            {
                stat: 'PR actuel',
                [player1.pseudo]: stats1.lastPr,
                [player2.pseudo]: stats2.lastPr,
                fullMark: max(stats1.lastPr, stats2.lastPr),
            },
            {
                stat: 'Meilleur rang',
                [player1.pseudo]: stats1.bestRank ? 1000 - stats1.bestRank : 0,
                [player2.pseudo]: stats2.bestRank ? 1000 - stats2.bestRank : 0,
                fullMark: 1000,
            },
        ]
    }, [stats1, stats2, player1, player2])

    const filtered1 = players.filter(p =>
        p.pseudo.toLowerCase().includes(search1.toLowerCase()) && p.id !== player2?.id
    )
    const filtered2 = players.filter(p =>
        p.pseudo.toLowerCase().includes(search2.toLowerCase()) && p.id !== player1?.id
    )

    if (loading) return (
        <div style={{ height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="spinner-fn" />
        </div>
    )

    return (
        <div className="compare-wrapper">
            <div className="container compare-content">

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
                    initial={{ opacity: 0, y: -24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    style={{ marginBottom: '2.5rem' }}
                >
                    <h1 className="compare-title">Comparaison</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
                        Compare les stats de 2 joueurs
                    </p>
                </motion.div>

                {/* ── Sélecteurs ── */}
                <motion.div
                    className="compare-selectors"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15, duration: 0.5 }}
                >
                    {/* Joueur 1 */}
                    <div className="compare-selector">
                        <div className="compare-selector-label" style={{ color: COLORS.p1 }}>
                            <FiUsers size={14} /> Joueur 1
                        </div>

                        {player1 ? (
                            <motion.div
                                className="compare-selected-card"
                                style={{ borderColor: COLORS.p1 + '44' }}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                            >
                                <div className="compare-selected-avatar" style={{ background: `linear-gradient(135deg, ${COLORS.p1}, #7b2ff7)` }}>
                                    {player1.pseudo[0].toUpperCase()}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>{player1.pseudo}</div>
                                    <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.3rem', flexWrap: 'wrap' }}>
                                        <StatutBadge statut={player1.statut || 'Actif'} />
                                        {player1.team && <span className="badge-team"><FaTrophy size={10} /> {player1.team}</span>}
                                    </div>
                                </div>
                                <motion.button
                                    onClick={() => setPlayer1(null)}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}
                                >
                                    <FiX size={16} />
                                </motion.button>
                            </motion.div>
                        ) : (
                            <div className="compare-search-wrapper">
                                <input
                                    className="compare-search"
                                    placeholder="Rechercher un joueur..."
                                    value={search1}
                                    onChange={e => { setSearch1(e.target.value); setOpen1(true) }}
                                    onFocus={() => setOpen1(true)}
                                    onBlur={() => setTimeout(() => setOpen1(false), 150)}
                                    style={{ borderColor: COLORS.p1 + '44' }}
                                />
                                <AnimatePresence>
                                    {open1 && filtered1.length > 0 && (
                                        <motion.div
                                            className="compare-dropdown"
                                            initial={{ opacity: 0, y: -8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -8 }}
                                            transition={{ duration: 0.15 }}
                                        >
                                            {filtered1.slice(0, 6).map(p => (
                                                <div
                                                    key={p.id}
                                                    className="compare-dropdown-item"
                                                    onMouseDown={() => { setPlayer1(p); setSearch1(''); setOpen1(false) }}
                                                >
                                                    <div className="compare-dropdown-avatar" style={{ background: `linear-gradient(135deg, ${COLORS.p1}, #7b2ff7)` }}>
                                                        {p.pseudo[0].toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{p.pseudo}</div>
                                                        {p.team && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.team}</div>}
                                                    </div>
                                                </div>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>

                    {/* VS */}
                    <motion.div
                        className="compare-vs"
                        animate={{ scale: player1 && player2 ? [1, 1.15, 1] : 1 }}
                        transition={{ duration: 0.4 }}
                    >
                        VS
                    </motion.div>

                    {/* Joueur 2 */}
                    <div className="compare-selector">
                        <div className="compare-selector-label" style={{ color: COLORS.p2 }}>
                            <FiUsers size={14} /> Joueur 2
                        </div>

                        {player2 ? (
                            <motion.div
                                className="compare-selected-card"
                                style={{ borderColor: COLORS.p2 + '44' }}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                            >
                                <div className="compare-selected-avatar" style={{ background: `linear-gradient(135deg, ${COLORS.p2}, #ff8c00)` }}>
                                    {player2.pseudo[0].toUpperCase()}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>{player2.pseudo}</div>
                                    <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.3rem', flexWrap: 'wrap' }}>
                                        <StatutBadge statut={player2.statut || 'Actif'} />
                                        {player2.team && <span className="badge-team"><FaTrophy size={10} /> {player2.team}</span>}
                                    </div>
                                </div>
                                <motion.button
                                    onClick={() => setPlayer2(null)}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}
                                >
                                    <FiX size={16} />
                                </motion.button>
                            </motion.div>
                        ) : (
                            <div className="compare-search-wrapper">
                                <input
                                    className="compare-search"
                                    placeholder="Rechercher un joueur..."
                                    value={search2}
                                    onChange={e => { setSearch2(e.target.value); setOpen2(true) }}
                                    onFocus={() => setOpen2(true)}
                                    onBlur={() => setTimeout(() => setOpen2(false), 150)}
                                    style={{ borderColor: COLORS.p2 + '44' }}
                                />
                                <AnimatePresence>
                                    {open2 && filtered2.length > 0 && (
                                        <motion.div
                                            className="compare-dropdown"
                                            initial={{ opacity: 0, y: -8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -8 }}
                                            transition={{ duration: 0.15 }}
                                        >
                                            {filtered2.slice(0, 6).map(p => (
                                                <div
                                                    key={p.id}
                                                    className="compare-dropdown-item"
                                                    onMouseDown={() => { setPlayer2(p); setSearch2(''); setOpen2(false) }}
                                                >
                                                    <div className="compare-dropdown-avatar" style={{ background: `linear-gradient(135deg, ${COLORS.p2}, #ff8c00)` }}>
                                                        {p.pseudo[0].toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{p.pseudo}</div>
                                                        {p.team && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.team}</div>}
                                                    </div>
                                                </div>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* ── Empty state ── */}
                {(!player1 || !player2) && (
                    <motion.div
                        className="compare-empty"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        <motion.div
                            animate={{ y: [0, -8, 0] }}
                            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                        >
                            <FiUsers size={48} style={{ color: 'var(--accent-cyan)', opacity: 0.3 }} />
                        </motion.div>
                        <p>Sélectionne 2 joueurs pour comparer leurs stats</p>
                    </motion.div>
                )}

                {/* ── Comparaison ── */}
                <AnimatePresence>
                    {player1 && player2 && (
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5 }}
                        >

                            {/* ── Stats face à face ── */}
                            <div className="compare-stats-grid">
                                {[
                                    { label: 'Tournois',            icon: <FiCalendar size={15} />,  v1: stats1.tournois, v2: stats2.tournois, higher: true  },
                                    { label: 'Top 1 total',         icon: <FiStar size={15} />,      v1: stats1.top1,     v2: stats2.top1,     higher: true  },
                                    { label: 'PR Wins',             icon: <FiTarget size={15} />,    v1: stats1.prWins,   v2: stats2.prWins,   higher: true  },
                                    { label: 'PR actuel',           icon: <FiBarChart2 size={15} />, v1: stats1.lastPr,   v2: stats2.lastPr,   higher: true  },
                                    { label: 'Meilleur classement', icon: <FiAward size={15} />,     v1: stats1.bestRank || '—', v2: stats2.bestRank || '—', higher: false },
                                ].map((s, i) => {
                                    const v1 = typeof s.v1 === 'number' ? s.v1 : 0
                                    const v2 = typeof s.v2 === 'number' ? s.v2 : 0
                                    const win1 = s.higher ? v1 > v2 : (v1 !== 0 && (v2 === 0 || v1 < v2))
                                    const win2 = s.higher ? v2 > v1 : (v2 !== 0 && (v1 === 0 || v2 < v1))

                                    return (
                                        <motion.div
                                            key={i}
                                            className="compare-stat-row"
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.07 }}
                                        >
                                            {/* Valeur joueur 1 */}
                                            <div className={`compare-stat-val ${win1 ? 'compare-stat-win' : ''}`}
                                                style={{ color: win1 ? COLORS.p1 : 'var(--text-secondary)' }}>
                                                {win1 && <span className="compare-crown">👑</span>}
                                                {s.v1?.toLocaleString?.() ?? s.v1}
                                            </div>

                                            {/* Label */}
                                            <div className="compare-stat-label">
                                                <span className="compare-stat-icon">{s.icon}</span>
                                                {s.label}
                                            </div>

                                            {/* Valeur joueur 2 */}
                                            <div className={`compare-stat-val compare-stat-val--right ${win2 ? 'compare-stat-win' : ''}`}
                                                style={{ color: win2 ? COLORS.p2 : 'var(--text-secondary)' }}>
                                                {s.v2?.toLocaleString?.() ?? s.v2}
                                                {win2 && <span className="compare-crown">👑</span>}
                                            </div>
                                        </motion.div>
                                    )
                                })}
                            </div>

                            {/* ── Barre de victoires ── */}
                            <motion.div
                                className="compare-win-bar-wrapper"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                            >
                                {(() => {
                                    const wins1 = [
                                        stats1.tournois > stats2.tournois,
                                        stats1.top1 > stats2.top1,
                                        stats1.prWins > stats2.prWins,
                                        stats1.lastPr > stats2.lastPr,
                                        stats1.bestRank && (!stats2.bestRank || stats1.bestRank < stats2.bestRank),
                                    ].filter(Boolean).length

                                    const wins2 = 5 - wins1
                                    const pct1 = (wins1 / 5) * 100

                                    return (
                                        <>
                                            <div className="compare-win-bar-labels">
                                                <span style={{ color: COLORS.p1, fontWeight: 700 }}>
                                                    {player1.pseudo} — {wins1} victoire{wins1 > 1 ? 's' : ''}
                                                </span>
                                                <span style={{ color: COLORS.p2, fontWeight: 700 }}>
                                                    {wins2} victoire{wins2 > 1 ? 's' : ''} — {player2.pseudo}
                                                </span>
                                            </div>
                                            <div className="compare-win-bar">
                                                <motion.div
                                                    className="compare-win-bar-fill"
                                                    initial={{ width: '50%' }}
                                                    animate={{ width: `${pct1}%` }}
                                                    transition={{ duration: 0.8, ease: 'easeOut', delay: 0.5 }}
                                                    style={{ background: `linear-gradient(90deg, ${COLORS.p1}, #7b2ff7)` }}
                                                />
                                            </div>
                                        </>
                                    )
                                })()}
                            </motion.div>

                            {/* ── Graphique PR ── */}
                            {prChartData.length >= 2 && (
                                <motion.div
                                    className="compare-chart-card"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                >
                                    <h3 className="pd-chart-title">
                                        <FiBarChart2 size={15} /> Évolution PR
                                    </h3>
                                    <ResponsiveContainer width="100%" height={240}>
                                        <LineChart data={prChartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                                            <XAxis dataKey="date" tick={{ fill: '#8888aa', fontSize: 11 }} tickLine={false} />
                                            <YAxis tick={{ fill: '#8888aa', fontSize: 11 }} tickLine={false} axisLine={false} />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Legend wrapperStyle={{ fontSize: '0.8rem', color: '#8888aa' }} />
                                            <Line type="monotone" dataKey={player1.pseudo} stroke={COLORS.p1}
                                                strokeWidth={2.5} dot={{ fill: COLORS.p1, r: 4, strokeWidth: 0 }}
                                                activeDot={{ r: 6 }} connectNulls />
                                            <Line type="monotone" dataKey={player2.pseudo} stroke={COLORS.p2}
                                                strokeWidth={2.5} dot={{ fill: COLORS.p2, r: 4, strokeWidth: 0 }}
                                                activeDot={{ r: 6 }} connectNulls />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </motion.div>
                            )}

                            {/* ── Radar ── */}
                            {radarData.length > 0 && (
                                <motion.div
                                    className="compare-chart-card"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.6 }}
                                >
                                    <h3 className="pd-chart-title">
                                        <FiStar size={15} /> Profil global
                                    </h3>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <RadarChart data={radarData}>
                                            <PolarGrid stroke="rgba(255,255,255,0.06)" />
                                            <PolarAngleAxis dataKey="stat" tick={{ fill: '#8888aa', fontSize: 11 }} />
                                            <Radar name={player1.pseudo} dataKey={player1.pseudo}
                                                stroke={COLORS.p1} fill={COLORS.p1} fillOpacity={0.15}
                                                strokeWidth={2} />
                                            <Radar name={player2.pseudo} dataKey={player2.pseudo}
                                                stroke={COLORS.p2} fill={COLORS.p2} fillOpacity={0.15}
                                                strokeWidth={2} />
                                            <Legend wrapperStyle={{ fontSize: '0.8rem', color: '#8888aa' }} />
                                            <Tooltip content={<CustomTooltip />} />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                </motion.div>
                            )}

                        </motion.div>
                    )}
                </AnimatePresence>

            </div>
        </div>
    )
}

// ── Helper stats ──
function calcStats(perfs) {
    return {
        tournois: perfs.length,
        top1:     perfs.reduce((s, p) => s + (p.top1_count || 0), 0),
        prWins:   perfs.reduce((s, p) => s + (p.pr_win_count || 0), 0),
        lastPr:   [...perfs].reverse().find(p => p.pr_total)?.pr_total || 0,
        bestRank: perfs.length
            ? Math.min(...perfs.map(p => p.classement).filter(Boolean))
            : null,
    }
}
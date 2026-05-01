import { motion } from 'framer-motion'

export default function PlayerCard({ player, onClick, onDelete }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, y: -10 }}
      whileHover={{
        y: -6,
        boxShadow: '0 0 30px rgba(0, 212, 255, 0.2), 0 0 60px rgba(123, 47, 247, 0.1)',
        borderColor: 'rgba(0, 212, 255, 0.35)',
      }}
      transition={{ duration: 0.25 }}
      onClick={onClick}
      style={{
        background: 'var(--bg-card)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 'var(--radius-md)',
        padding: '1.4rem',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        height: '100%',
      }}
    >
      {/* Glow bg */}
      <div style={{
        position: 'absolute', top: -40, right: -40,
        width: 120, height: 120,
        background: 'radial-gradient(circle, rgba(123,47,247,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Delete btn */}
      <motion.button
        whileHover={{ scale: 1.2, color: '#ff4444' }}
        whileTap={{ scale: 0.9 }}
        onClick={e => { e.stopPropagation(); onDelete() }}
        style={{
          position: 'absolute', top: 12, right: 12,
          background: 'none', border: 'none',
          color: 'var(--text-muted)', cursor: 'pointer',
          fontSize: '1rem', lineHeight: 1,
          transition: 'color 0.2s',
        }}
      >✕</motion.button>

      {/* Pseudo */}
      <h3 style={{
        fontSize: '1.1rem',
        fontWeight: 700,
        marginBottom: '0.75rem',
        background: 'linear-gradient(135deg, #00d4ff, #7b2ff7)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        paddingRight: '1.5rem',
      }}>
        {player.pseudo}
      </h3>

      {/* Infos */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
        {player.age && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem' }}>
            <span>🎂</span>
            <span style={{ color: 'var(--text-secondary)' }}>{player.age} ans</span>
          </div>
        )}
        {player.team && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>🏆</span>
            <span className="badge-team">{player.team}</span>
          </div>
        )}
        {player.twitter && (
          <motion.a
            whileHover={{ x: 3 }}
            href={`https://twitter.com/${player.twitter}`}
            target="_blank"
            rel="noreferrer"
            onClick={e => e.stopPropagation()}
            style={{ color: '#1da1f2', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <span>🐦</span> @{player.twitter}
          </motion.a>
        )}
        {player.pr_link && (
          <motion.a
            whileHover={{ x: 3 }}
            href={player.pr_link}
            target="_blank"
            rel="noreferrer"
            onClick={e => e.stopPropagation()}
            style={{ color: 'var(--accent-purple)', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <span>📊</span> Voir PR Tracker
          </motion.a>
        )}
      </div>

      {/* Bottom line */}
      <motion.div
        initial={{ scaleX: 0 }}
        whileHover={{ scaleX: 1 }}
        transition={{ duration: 0.3 }}
        style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          height: '2px',
          background: 'linear-gradient(90deg, var(--accent-cyan), var(--accent-purple))',
          transformOrigin: 'left',
        }}
      />
    </motion.div>
  )
}
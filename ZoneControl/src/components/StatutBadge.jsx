import { STATUT_COLORS } from '../lib/statut'

export default function StatutBadge({ statut }) {
  if (!statut) return null
  const colors = STATUT_COLORS[statut] || STATUT_COLORS['Inactif']

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.35rem',
      padding: '0.2rem 0.65rem',
      borderRadius: 20,
      background: colors.bg,
      border: `1px solid ${colors.border}`,
      color: colors.color,
      fontSize: '0.72rem',
      fontWeight: 700,
      letterSpacing: '0.3px',
    }}>
      <span style={{
        width: 6,
        height: 6,
        borderRadius: '50%',
        background: colors.dot,
        boxShadow: `0 0 6px ${colors.dot}`,
        animation: statut === 'Actif' ? 'pulse-dot 2s ease-in-out infinite' : 'none',
        flexShrink: 0,
      }} />
      {statut}
    </span>
  )
}
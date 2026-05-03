import { motion } from 'framer-motion'

function Shimmer({ width = '100%', height = 16, radius = 6, style = {} }) {
  return (
    <motion.div
      animate={{ opacity: [0.4, 0.8, 0.4] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      style={{
        width,
        height,
        borderRadius: radius,
        background: 'linear-gradient(90deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 100%)',
        backgroundSize: '200% 100%',
        ...style,
      }}
    />
  )
}

export function SkeletonPlayerCard() {
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 12,
      padding: '1.4rem',
      height: '100%',
    }}>
      {/* Pseudo */}
      <Shimmer width="60%" height={18} radius={6} style={{ marginBottom: '1rem' }} />

      {/* Infos */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <Shimmer width="40%" height={14} />
        <Shimmer width="55%" height={14} />
        <Shimmer width="45%" height={14} />
      </div>
    </div>
  )
}

export function SkeletonStatPill() {
  return (
    <div style={{
      flex: 1,
      minWidth: 110,
      background: 'rgba(0,212,255,0.04)',
      border: '1px solid rgba(0,212,255,0.1)',
      borderRadius: 12,
      padding: '1rem',
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '0.5rem',
    }}>
      <Shimmer width={20} height={20} radius={4} />
      <Shimmer width="50%" height={22} radius={6} />
      <Shimmer width="70%" height={10} radius={4} />
    </div>
  )
}

export function SkeletonTable() {
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 12,
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr) 40px',
        padding: '0.75rem 1rem',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        background: 'rgba(0,0,0,0.2)',
        gap: '1rem',
      }}>
        {Array(7).fill(0).map((_, i) => (
          <Shimmer key={i} height={10} radius={4} />
        ))}
        <div />
      </div>

      {/* Rows */}
      {Array(4).fill(0).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.08 }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr) 40px',
            padding: '0.85rem 1rem',
            borderBottom: i < 3 ? '1px solid rgba(255,255,255,0.03)' : 'none',
            gap: '1rem',
            alignItems: 'center',
          }}
        >
          {Array(7).fill(0).map((_, j) => (
            <Shimmer key={j} width={`${50 + Math.random() * 40}%`} height={12} radius={4} />
          ))}
          <div style={{ display: 'flex', gap: '0.3rem' }}>
            <Shimmer width={24} height={24} radius={4} />
            <Shimmer width={24} height={24} radius={4} />
          </div>
        </motion.div>
      ))}
    </div>
  )
}

export function SkeletonChart() {
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 12,
      padding: '1.2rem',
    }}>
      <Shimmer width="35%" height={12} radius={4} style={{ marginBottom: '1.2rem' }} />
      <Shimmer width="100%" height={220} radius={8} />
    </div>
  )
}

export function SkeletonProfileCard() {
  return (
    <div style={{
      background: 'rgba(19,19,31,0.85)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 16,
      padding: '2rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '0.8rem',
    }}>
      <Shimmer width={110} height={110} radius={55} />
      <Shimmer width="60%" height={18} radius={6} />
      <Shimmer width="80%" height={12} radius={4} />
      <Shimmer width={100} height={26} radius={20} />
    </div>
  )
}
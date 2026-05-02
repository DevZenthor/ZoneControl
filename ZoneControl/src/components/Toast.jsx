import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiCheck, FiAlertCircle, FiInfo, FiX } from 'react-icons/fi'

const ICONS = {
  success: <FiCheck size={16} />,
  error:   <FiAlertCircle size={16} />,
  info:    <FiInfo size={16} />,
}

const COLORS = {
  success: { bg: 'rgba(0,212,100,0.1)',  border: 'rgba(0,212,100,0.25)',  color: '#00d464' },
  error:   { bg: 'rgba(255,45,120,0.1)', border: 'rgba(255,45,120,0.25)', color: '#ff6b9d' },
  info:    { bg: 'rgba(0,212,255,0.1)',  border: 'rgba(0,212,255,0.25)',  color: '#00d4ff' },
}

export function Toast({ toasts, removeToast }) {
  return (
    <div style={{
      position: 'fixed',
      bottom: '1.5rem',
      right: '1.5rem',
      zIndex: 999,
      display: 'flex',
      flexDirection: 'column',
      gap: '0.6rem',
      pointerEvents: 'none',
    }}>
      <AnimatePresence>
        {toasts.map(toast => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 60, scale: 0.92 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 60, scale: 0.92 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            style={{
              pointerEvents: 'all',
              display: 'flex',
              alignItems: 'center',
              gap: '0.7rem',
              padding: '0.75rem 1rem',
              background: COLORS[toast.type].bg,
              border: `1px solid ${COLORS[toast.type].border}`,
              borderRadius: 10,
              backdropFilter: 'blur(12px)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
              minWidth: 260,
              maxWidth: 360,
              color: COLORS[toast.type].color,
            }}
          >
            {/* Icon */}
            <div style={{ flexShrink: 0 }}>
              {ICONS[toast.type]}
            </div>

            {/* Message */}
            <span style={{
              flex: 1,
              fontSize: '0.875rem',
              fontWeight: 500,
              color: 'var(--text-primary)',
              lineHeight: 1.4,
            }}>
              {toast.message}
            </span>

            {/* Progress bar */}
            <motion.div
              initial={{ scaleX: 1 }}
              animate={{ scaleX: 0 }}
              transition={{ duration: toast.duration / 1000, ease: 'linear' }}
              style={{
                position: 'absolute',
                bottom: 0, left: 0,
                height: 2,
                width: '100%',
                background: COLORS[toast.type].color,
                transformOrigin: 'left',
                borderRadius: '0 0 10px 10px',
                opacity: 0.6,
              }}
            />

            {/* Close */}
            <motion.button
              onClick={() => removeToast(toast.id)}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: 2,
                display: 'flex',
                alignItems: 'center',
                flexShrink: 0,
              }}
            >
              <FiX size={14} />
            </motion.button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
import { motion, AnimatePresence } from 'framer-motion'
import { FiAlertTriangle, FiTrash2, FiX } from 'react-icons/fi'

export default function ConfirmModal({ isOpen, onConfirm, onCancel, title, message }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(0,0,0,0.65)',
              backdropFilter: 'blur(6px)',
              zIndex: 300,
            }}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.88, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: 20 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            style={{
              position: 'fixed',
              top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '90%', maxWidth: 400,
              background: 'rgba(19, 19, 31, 0.98)',
              border: '1px solid rgba(255, 45, 120, 0.2)',
              borderRadius: 16,
              padding: '1.8rem',
              zIndex: 301,
              boxShadow: '0 25px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,45,120,0.08)',
            }}
          >
            {/* Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 300 }}
              style={{
                width: 52, height: 52,
                borderRadius: 14,
                background: 'rgba(255, 45, 120, 0.1)',
                border: '1px solid rgba(255, 45, 120, 0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 1.2rem',
                color: 'var(--accent-pink)',
              }}
            >
              <FiAlertTriangle size={22} />
            </motion.div>

            {/* Title */}
            <h3 style={{
              textAlign: 'center',
              fontSize: '1rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              marginBottom: '0.5rem',
            }}>
              {title || 'Confirmer la suppression'}
            </h3>

            {/* Message */}
            <p style={{
              textAlign: 'center',
              fontSize: '0.875rem',
              color: 'var(--text-secondary)',
              marginBottom: '1.5rem',
              lineHeight: 1.5,
            }}>
              {message || 'Cette action est irréversible.'}
            </p>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '0.7rem' }}>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={onCancel}
                style={{
                  flex: 1,
                  padding: '0.65rem',
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 8,
                  color: 'var(--text-secondary)',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                  transition: 'all 0.2s',
                }}
              >
                <FiX size={14} /> Annuler
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.03, boxShadow: '0 0 20px rgba(255,45,120,0.3)' }}
                whileTap={{ scale: 0.97 }}
                onClick={onConfirm}
                style={{
                  flex: 1,
                  padding: '0.65rem',
                  background: 'linear-gradient(135deg, #ff2d78, #ff6b9d)',
                  border: 'none',
                  borderRadius: 8,
                  color: 'white',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                }}
              >
                <FiTrash2 size={14} /> Supprimer
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
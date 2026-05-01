import { useEffect, useState } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase } from './lib/supabase'
import Navbar from './components/Navbar'
import AnimatedRoutes from './components/AnimatedRoutes'
import AnimatedBackground from './components/AnimatedBackground'

export default function App() {
  const [session, setSession] = useState(undefined)

  useEffect(() => {
    // Récupère la session existante
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session ?? null)
    })

    // Écoute les changements d'auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth event:', event, session) // debug
        setSession(session ?? null)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // Chargement
  if (session === undefined) return (
    <div style={{
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: '1.2rem',
      background: 'var(--bg-primary)',
    }}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        style={{
          width: 44, height: 44,
          border: '3px solid rgba(0,212,255,0.1)',
          borderTopColor: 'var(--accent-cyan)',
          borderRightColor: 'var(--accent-purple)',
          borderRadius: '50%',
        }}
      />
      <motion.span
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}
      >
        Chargement...
      </motion.span>
    </div>
  )

  return (
    <BrowserRouter>
      <AnimatedBackground />
      {session && <Navbar session={session} />}
      <AnimatedRoutes session={session} />
    </BrowserRouter>
  )
}
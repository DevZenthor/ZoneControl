import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiHome, FiUser, FiLogOut, FiMenu, FiX, FiZap
} from 'react-icons/fi'
import { supabase } from '../lib/supabase'
import '../styles/navbar.css'

export default function Navbar({ session }) {
  const navigate  = useNavigate()
  const location  = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [profile, setProfile]   = useState(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const fetchProfile = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('pseudo, avatar_url')
        .eq('id', session.user.id)
        .single()
      if (data) setProfile(data)
    }
    fetchProfile()
  }, [session])

  const logout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const links = [
    { path: '/',        label: 'Home',   icon: <FiHome size={16} /> },
    { path: '/profile', label: 'Profil', icon: <FiUser size={16} /> },
  ]

  const isActive = (path) => location.pathname === path

  return (
    <>
      <motion.nav
        className={`navbar-fn ${scrolled ? 'navbar-fn--scrolled' : ''}`}
        initial={{ y: -70, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div className="navbar-inner">

          {/* ── Logo ── */}
          <motion.div
            className="navbar-logo"
            onClick={() => navigate('/')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
          >
            <div className="navbar-logo-icon">
              <FiZap size={16} />
            </div>
            <span className="navbar-logo-text">ZoneControl</span>
          </motion.div>

          {/* ── Links desktop ── */}
          <div className="navbar-links">
            {links.map(link => (
              <motion.button
                key={link.path}
                className={`navbar-link ${isActive(link.path) ? 'navbar-link--active' : ''}`}
                onClick={() => navigate(link.path)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {link.icon}
                {link.label}
                {isActive(link.path) && (
                  <motion.div
                    className="navbar-link-indicator"
                    layoutId="indicator"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </motion.button>
            ))}
          </div>

          {/* ── Right ── */}
          <div className="navbar-right">

            {/* Avatar + pseudo */}
            <motion.div
              className="navbar-profile"
              onClick={() => navigate('/profile')}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <div className="navbar-avatar">
                {profile?.avatar_url
                  ? <img src={profile.avatar_url} alt="avatar" />
                  : <span>{(profile?.pseudo || session.user.email)?.[0]?.toUpperCase()}</span>
                }
              </div>
              <span className="navbar-pseudo">
                {profile?.pseudo || session.user.email?.split('@')[0]}
              </span>
            </motion.div>

            {/* Logout */}
            <motion.button
              className="navbar-logout"
              onClick={logout}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Déconnexion"
            >
              <FiLogOut size={16} />
            </motion.button>

            {/* Mobile menu toggle */}
            <motion.button
              className="navbar-burger"
              onClick={() => setMenuOpen(v => !v)}
              whileTap={{ scale: 0.9 }}
            >
              {menuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
            </motion.button>

          </div>
        </div>
      </motion.nav>

      {/* ── Mobile menu ── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="navbar-mobile"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25 }}
          >
            {links.map(link => (
              <motion.button
                key={link.path}
                className={`navbar-mobile-link ${isActive(link.path) ? 'navbar-mobile-link--active' : ''}`}
                onClick={() => { navigate(link.path); setMenuOpen(false) }}
                whileHover={{ x: 4 }}
              >
                {link.icon}
                {link.label}
              </motion.button>
            ))}

            <div className="navbar-mobile-divider" />

            <motion.button
              className="navbar-mobile-logout"
              onClick={logout}
              whileHover={{ x: 4 }}
            >
              <FiLogOut size={16} />
              Déconnexion
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
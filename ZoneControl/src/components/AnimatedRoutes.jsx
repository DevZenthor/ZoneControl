import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Home from '../pages/Home'
import Login from '../pages/Login'
import Register from '../pages/Register'
import Profile from '../pages/Profile'
import PlayerDetail from '../pages/PlayerDetail'
import ForgotPassword from '../pages/ForgotPassword'
import ResetPassword from '../pages/ResetPassword'
import Compare from '../pages/Compare'

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
  exit:    { opacity: 0, y: -10, transition: { duration: 0.2 } },
}

function PageWrapper({ children }) {
  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
      {children}
    </motion.div>
  )
}

export default function AnimatedRoutes({ session }) {
  const location = useLocation()
  const isAuth   = session !== null

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>

        {/* ── Home ── */}
        <Route path="/" element={
          isAuth
            ? <PageWrapper><Home session={session} /></PageWrapper>
            : <Navigate to="/login" replace />
        } />

        {/* ── Auth ── */}
        <Route path="/login" element={
          isAuth
            ? <Navigate to="/" replace />
            : <PageWrapper><Login /></PageWrapper>
        } />

        <Route path="/register" element={
          isAuth
            ? <Navigate to="/" replace />
            : <PageWrapper><Register /></PageWrapper>
        } />

        <Route path="/forgot-password" element={
          <PageWrapper><ForgotPassword /></PageWrapper>
        } />

        <Route path="/reset-password" element={
          <PageWrapper><ResetPassword /></PageWrapper>
        } />

        {/* ── App ── */}
        <Route path="/player/:id" element={
          isAuth
            ? <PageWrapper><PlayerDetail session={session} /></PageWrapper>
            : <Navigate to="/login" replace />
        } />

        <Route path="/profile" element={
          isAuth
            ? <PageWrapper><Profile session={session} /></PageWrapper>
            : <Navigate to="/login" replace />
        } />

        <Route path="/compare" element={
          isAuth
            ? <PageWrapper><Compare session={session} /></PageWrapper>
            : <Navigate to="/login" replace />
        } />

        {/* ── Fallback ── */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </AnimatePresence>
  )
}
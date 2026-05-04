import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'

// ── Lazy pages ──
const Home = lazy(() => import('../pages/Home'))
const Login = lazy(() => import('../pages/Login'))
const Register = lazy(() => import('../pages/Register'))
const Profile = lazy(() => import('../pages/Profile'))
const PlayerDetail = lazy(() => import('../pages/PlayerDetail'))
const ForgotPassword = lazy(() => import('../pages/ForgotPassword'))
const ResetPassword = lazy(() => import('../pages/ResetPassword'))
const Compare = lazy(() => import('../pages/Compare'))
const NotFound = lazy(() => import('../pages/NotFound'))
const Scouting = lazy(() => import('../pages/Scouting'))

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
}

function PageLoader() {
  return (
    <div style={{
      height: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div className="spinner-fn" />
    </div>
  )
}

function PageWrapper({ children }) {
  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <Suspense fallback={<PageLoader />}>
        {children}
      </Suspense>
    </motion.div>
  )
}

export default function AnimatedRoutes({ session }) {
  const location = useLocation()
  const isAuth = session !== null

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>

        <Route path="/" element={
          isAuth
            ? <PageWrapper><Home session={session} /></PageWrapper>
            : <Navigate to="/login" replace />
        } />

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

        <Route path="/scouting" element={
          isAuth
            ? <PageWrapper><Scouting session={session} /></PageWrapper>
            : <Navigate to="/login" replace />
        } />

        {/* 404 */}
        <Route path="*" element={
          <PageWrapper><NotFound /></PageWrapper>
        } />

      </Routes>
    </AnimatePresence>
  )
}
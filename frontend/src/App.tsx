import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { AuthProvider, useAuthContext } from './contexts/AuthContext'
import LoginForm from './components/Auth/LoginForm'
import OTPVerification from './components/Common/OTPVerification'
import MainLayout from './components/Layout/MainLayout'

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/*" element={<AppContent />} />
      </Routes>
    </AuthProvider>
  )
}

function AppContent() {
  const { token, user, loading, error, loginUser, verifyOTP, logout, setError } = useAuthContext()
  const [loginStep, setLoginStep] = useState<'login' | 'otp'>('login')
  const [username, setUsername] = useState('')

  const handleLogin = async (username: string, password: string) => {
    try {
      const u = await loginUser(username, password)
      setUsername(u)
      setLoginStep('otp')
    } catch (err) {}
  }

  const handleOtpVerification = async (otp: string) => {
    await verifyOTP(username, otp)
  }

  const handleBackToLogin = () => {
    setLoginStep('login')
    setUsername('')
    setError('')
  }

  if (!token) {
    if (loginStep === 'otp') {
      return (
        <OTPVerification
          username={username}
          onVerify={handleOtpVerification}
          onBack={handleBackToLogin}
          isLoading={loading}
          error={error}
        />
      )
    }

    return <LoginForm onSubmit={handleLogin} loading={loading} error={error} />
  }

  return <MainLayout userInfo={user} onLogout={logout} />
}

export default App

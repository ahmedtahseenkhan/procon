import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { me, login, verifyOtp } from '../services/auth'

export function useAuth() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'))
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    if (token) {
      me(token).then(setUser).catch(() => logout())
    }
  }, [token])

  const loginUser = async (username: string, password: string) => {
    setLoading(true)
    setError('')
    try {
      await login(username, password)
      return username
    } catch (err) {
      setError('Invalid username or password')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const verifyOTP = async (username: string, otp: string) => {
    setLoading(true)
    setError('')
    try {
      const res = await verifyOtp(username, otp)
      localStorage.setItem('token', res.token)
      setToken(res.token)
      navigate('/dashboard')
    } catch (err) {
      setError('Invalid OTP. Please try again.')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
    navigate('/')
  }

  return {
    token,
    user,
    loading,
    error,
    loginUser,
    verifyOTP,
    logout,
    setError,
  }
}

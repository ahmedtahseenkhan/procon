const base = import.meta.env.VITE_API_BASE_URL || ''

export async function login(username: string, password: string) {
  const r = await fetch(`${base}/api/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) })
  if (!r.ok) throw new Error('login_failed')
  return r.json()
}

export async function verifyOtp(username: string, otp: string) {
  const r = await fetch(`${base}/api/auth/verify-otp`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, otp }) })
  if (!r.ok) throw new Error('otp_verification_failed')
  return r.json()
}

export async function me(token: string) {
  const r = await fetch(`${base}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
  if (!r.ok) throw new Error('me_failed')
  return r.json()
}

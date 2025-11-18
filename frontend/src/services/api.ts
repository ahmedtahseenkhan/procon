const base = import.meta.env.VITE_API_BASE_URL || ''
function authHeader() {
  const t = localStorage.getItem('token')
  return t ? { Authorization: `Bearer ${t}` } : {}
}
export async function getDevices() {
  const r = await fetch(`${base}/api/devices`, { headers: { ...authHeader() } })
  if (!r.ok) throw new Error('error')
  return r.json()
}
export async function getEvents() {
  const r = await fetch(`${base}/api/events`, { headers: { ...authHeader() } })
  if (!r.ok) throw new Error('error')
  return r.json()
}

export async function getUsers() {
  const response = await fetch(`${base}/api/users`, { headers: authHeader() })
  if (!response.ok) throw new Error('Failed to fetch users')
  return response.json()
}

export async function createUser(userData: any) {
  const response = await fetch(`${base}/api/users`, {
    method: 'POST',
    headers: { ...authHeader(), 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  })
  if (!response.ok) throw new Error('Failed to create user')
  return response.json()
}

export async function updateUser(userId: string, userData: any) {
  const response = await fetch(`${base}/api/users/${userId}`, {
    method: 'PUT',
    headers: { ...authHeader(), 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  })
  if (!response.ok) throw new Error('Failed to update user')
  return response.json()
}

export async function deleteUser(userId: string) {
  const response = await fetch(`${base}/api/users/${userId}`, {
    method: 'DELETE',
    headers: authHeader()
  })
  if (!response.ok) throw new Error('Failed to delete user')
  return response.json()
}

import { BASE_URL } from "../config"

export async function loginUser(username, password) {
  try {
    const res = await fetch(`${BASE_URL}/api/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    })

    if (!res.ok) {
      throw new Error('登录请求失败')
    }

    const data = await res.json()
    return data
  } catch (error) {
    console.error('loginUser error:', error)
    throw error
  }
}
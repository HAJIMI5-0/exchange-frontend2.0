// import { BASE_URL } from "../config"
import client from "./client";

export async function loginUser(username, password) {
  try {
    const res = await fetch(`/api/login`, {
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
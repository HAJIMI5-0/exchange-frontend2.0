const API_BASE_URL = 'http://10.30.4.139:8080' // 后端地址

export async function fetchProfileApi(username) {
  const res = await fetch(
    `${API_BASE_URL}/api/profile?username=${encodeURIComponent(username)}`
  )

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.message || '获取个人信息失败')
  }

  return data
}

export async function uploadAvatarApi(file) {
  const formData = new FormData()
  formData.append('file', file)

  const res = await fetch(`${API_BASE_URL}/api/upload`, {
    method: 'POST',
    body: formData
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.message || '头像上传失败')
  }

  return data.url
}

export async function updateProfileApi(profile) {
  const res = await fetch(`${API_BASE_URL}/api/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(profile)
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.message || '保存失败')
  }

  return data
}

export async function translateText(content, targetLang) {
  if (!content) return ''

  if (!targetLang) {
    return content
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/translate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: content,
        targetLang: targetLang
      })
    })

    if (!res.ok) {
      throw new Error('翻译接口请求失败')
    }

    const result = await res.text()

    try {
      const data = JSON.parse(result)

      return (
        data.translatedText ||
        data.text ||
        data.result ||
        data.data ||
        content
      )
    } catch {
      return result || content
    }
  } catch (err) {
    console.error('翻译失败:', err)
    return content
  }
}
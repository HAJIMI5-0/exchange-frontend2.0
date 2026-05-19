const API_BASE_URL = 'http://10.30.4.139:8080' // 后端接口基础地址

// 请求匹配用户
export const fetchMatchUsers = async ({
  haveSkill,
  wantSkill,
  timeSlot,
  learnLevel,
  limit = 5
}) => {
  const params = new URLSearchParams()

  if (haveSkill) {
    params.append('haveSkill', haveSkill.toLowerCase())
  }

  if (wantSkill) {
    params.append('wantSkill', wantSkill.toLowerCase())
  }

  if (timeSlot) {
    params.append('timeSlot', timeSlot)
  }

  if (learnLevel) {
    params.append('learnLevel', learnLevel)
  }

  params.append('limit', String(limit))

  const res = await fetch(`${API_BASE_URL}/api/match?${params.toString()}`)

  if (!res.ok) {
    throw new Error('后端匹配接口请求失败')
  }

  return await res.json()
}

// 创建一对一聊天室
export const createDirectChatRoom = async ({ senderUsername, receiverUsername }) => {
  const res = await fetch(`${API_BASE_URL}/api/chat/direct`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      senderUsername,
      receiverUsername
    })
  })

  const data = await res.json()

  return {
    ok: res.ok,
    status: res.status,
    data
  }
}
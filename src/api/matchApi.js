import client from './client' // 后端接口连接文件

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

  // 后端接收的是 skillWantLevel，不是 learnLevel
  if (learnLevel) {
    params.append('skillWantLevel', learnLevel)
  }

  params.append('limit', String(limit))

  // 防止接口缓存
  params.append('_t', Date.now().toString())

  const res = await client.get(`/api/match?${params.toString()}`)

  const data = res.data

  console.log('匹配接口原始返回:', data)

  if (Array.isArray(data)) {
    return data
  }

  if (Array.isArray(data.data)) {
    return data.data
  }

  if (Array.isArray(data.users)) {
    return data.users
  }

  return []
}

// 获取匹配用户详情 + 匹配历史记录
export const fetchMatchProfile = async (userId) => {
  const res = await client.get(`/api/match/profile/${userId}`, {
    params: {
      _t: Date.now()
    }
  })

  const data = res.data

  console.log('匹配用户详情接口返回:', data)

  return data
}

// 创建一对一聊天室
export const createDirectChatRoom = async ({ senderUsername, receiverUsername }) => {
  const res = await client.post('/api/chat/direct', {
    senderUsername,
    receiverUsername
  })

  return {
    ok: res.status >= 200 && res.status < 300,
    status: res.status,
    data: res.data
  }
}
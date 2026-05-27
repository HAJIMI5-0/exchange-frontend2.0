import client from "./client"; // 后端接口连接文件

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

  const res = await client.get(`/api/match?${params.toString()}`)

  const data = res.data

  console.log('匹配接口原始返回:', data)

  // 如果后端直接返回数组
  if (Array.isArray(data)) {
    return data
  }

  // 如果后端返回 { data: [...] }
  if (Array.isArray(data.data)) {
    return data.data
  }

  // 如果后端返回 { users: [...] }
  if (Array.isArray(data.users)) {
    return data.users
  }

  return []
}

// 创建一对一聊天室
export const createDirectChatRoom = async ({ senderUsername, receiverUsername }) => {
  const res = await client.post("/api/chat/direct", {
    senderUsername,
    receiverUsername
  })

  return {
    ok: res.status >= 200 && res.status < 300,
    status: res.status,
    data: res.data
  }
}
const BASE_URL = 'http://10.30.4.139:8080' // 后端服务器地址

// ================= 原始版本（保留，不删除） =================
// export async function translateText(text, targetLang) {
//   const res = await fetch(`${BASE_URL}/api/translate`, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json'
//     },
//     body: JSON.stringify({
//       text: text,
//       targetLang: targetLang
//     })
//   })

//   if (!res.ok) {
//     throw new Error('翻译失败')
//   }

//   return await res.text()
// }


// ================= 新版本（带调试 + 不会崩） =================
export async function translateText(text, targetLang) {

  console.log('发送给后端:', {
    text,
    targetLang
  }) // 打印发送内容（方便调试）

  try {
    const res = await fetch(`${BASE_URL}/api/translate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: text,
        targetLang: targetLang
      })
    })

    // 打印状态码
    console.log('返回状态:', res.status)

    if (!res.ok) {
      throw new Error(`翻译失败，状态码: ${res.status}`)
    }

    const result = await res.text()

    console.log('翻译结果:', result) // 打印翻译结果

    return result
  } catch (err) {
    console.error('翻译接口错误:', err)

    // 出错时直接返回原文（避免页面崩）
    return text
  }
}
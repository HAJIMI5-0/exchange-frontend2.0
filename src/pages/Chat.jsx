import { useEffect, useMemo, useRef, useState } from 'react' // 从 React 导入需要使用的 Hook，包括副作用、缓存、DOM引用、状态管理
import client from '../api/client' // 引入统一 axios 请求客户端

const AI_PREFIX = '🤖 AI 학습 도움' // 定义 AI 消息前缀，用来区分普通聊天消息和 AI 自动生成消息
const TIME_GAP = 300000 // 定义消息时间分组间隔，单位毫秒，这里是 5 分钟

function Chat({ text }) { // 定义聊天组件，接收父组件传来的 text 多语言文本对象
  const currentUser = useMemo(() => { // 使用 useMemo 缓存当前登录用户信息，避免重复解析 localStorage
    try { // 尝试读取本地缓存
      return JSON.parse(localStorage.getItem('loginUser') || '{}') // 从 localStorage 获取 loginUser，没有则返回空对象字符串再解析
    } catch { // 如果 JSON 解析失败
      return {} // 返回空对象避免程序报错
    }
  }, []) // 空依赖数组，只在组件首次渲染时执行一次

  const currentUsername = currentUser?.username || '' // 获取当前用户名，如果不存在则使用空字符串
  const currentLang = localStorage.getItem('lang') || 'ko' // 获取当前选择的语言，如果没有则默认韩语

  const [rooms, setRooms] = useState([]) // 保存聊天室列表数据
  const [selectedRoom, setSelectedRoom] = useState(null) // 保存当前选中的聊天室
  const [messages, setMessages] = useState([]) // 保存当前聊天室的消息列表
  const [newMessage, setNewMessage] = useState('') // 保存输入框中正在输入的新消息
  const [isAiLoading, setIsAiLoading] = useState(false) // 标记 AI 是否正在生成回复
  const [translatedMessages, setTranslatedMessages] = useState({}) // 保存已经翻译过的消息，key 为消息 id
  const [aiError, setAiError] = useState('') // 保存 AI 错误提示文本

  const messagesEndRef = useRef(null) // 创建 DOM 引用，用于滚动到底部定位最后一条消息

  const scrollToBottom = () => // 定义滚动到底部函数
    requestAnimationFrame(() => // 等浏览器下一帧渲染完成后执行
      messagesEndRef.current?.scrollIntoView({
        behavior: 'smooth'
      })
    )

  const detectLanguage = (text) => { // 定义简单语言检测函数，根据字符判断文本属于哪种语言
    if (!text) return 'en'
    if (/[\uac00-\ud7af]/.test(text)) return 'ko'
    if (/[\u4e00-\u9fff]/.test(text)) return 'zh'
    if (/[\u3040-\u30ff]/.test(text)) return 'ja'
    if (/[\u0600-\u06FF]/.test(text)) return 'ar'
    return 'en'
  }

  const translateText = async (content) => { // 定义翻译函数，将文本翻译成当前用户选择的语言
    if (!content || detectLanguage(content) === currentLang) return null

    try {
      const res = await client.post('/api/translate', {
        text: content,
        targetLang: currentLang
      })

      const data = res.data

      if (typeof data === 'string') {
        return data.trim() && data !== content
          ? data
          : null
      }

      const translated =
        data.translatedText ||
        data.text ||
        data.result ||
        data.data ||
        null

      return translated &&
        translated.trim() &&
        translated !== content
        ? translated
        : null

    } catch {
      return null
    }
  }

  const formatWeChatTime = (timeStr) => { // 定义时间格式化函数，模仿微信聊天时间显示格式
    if (!timeStr) return ''

    try {
      const date = new Date(timeStr)

      if (isNaN(date.getTime())) return ''

      const now = new Date()
      let hours = date.getHours()
      const minutes = String(date.getMinutes()).padStart(2, '0')
      const ampm = hours >= 12 ? '오후' : '오전'

      hours = hours % 12 || 12

      const time = `${ampm} ${hours}:${minutes}`

      if (date.toDateString() === now.toDateString()) {
        return `오늘 ${time}`
      }

      const yesterday = new Date(now)
      yesterday.setDate(now.getDate() - 1)

      if (date.toDateString() === yesterday.toDateString()) {
        return `어제 ${time}`
      }

      if (date.getFullYear() === now.getFullYear()) {
        return `${date.getMonth() + 1}월 ${date.getDate()}일 ${time}`
      }

      return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 ${time}`
    } catch {
      return ''
    }
  }

  const fetchRooms = async () => { // 定义获取聊天室列表函数
    try {
      const res = await client.get('/api/chat/rooms', {
        params: {
          username: currentUsername
        }
      })

      const data = res.data

      if (!Array.isArray(data)) {
        setRooms([])
        return
      }

      setRooms(data)

      if (!selectedRoom && data.length) {
        setSelectedRoom(data[0])
        scrollToBottom()
        return
      }

      if (
        selectedRoom &&
        !data.find(room => room.roomId === selectedRoom.roomId) &&
        data.length
      ) {
        setSelectedRoom(data[0])
        scrollToBottom()
      }

    } catch {
      setRooms([])
    }
  }

  const fetchMessages = async (scroll = false) => { // 定义获取聊天消息函数
    if (!selectedRoom) return

    try {
      const res = await client.get('/api/chat/messages', {
        params: {
          me: currentUsername,
          partner: selectedRoom.partnerUsername
        }
      })

      const data = res.data

      if (!Array.isArray(data)) return

      setMessages(prev => {
        if (
          prev.length === data.length &&
          prev[prev.length - 1]?.id === data[data.length - 1]?.id
        ) {
          return prev
        }

        return data
      })

      if (scroll) {
        scrollToBottom()
      }

    } catch {}
  }

  const autoTranslateMessages = async () => { // 定义自动翻译消息函数
    const cache = {}

    for (const msg of messages) {
      if (msg.content?.startsWith(AI_PREFIX)) continue

      if (translatedMessages[msg.id]) {
        cache[msg.id] = translatedMessages[msg.id]
        continue
      }

      const translated = await translateText(msg.content)

      if (translated) {
        cache[msg.id] = translated
      }
    }

    setTranslatedMessages(cache)
  }
    const handleSendMessage = async () => { // 定义发送普通聊天消息函数
    if (!newMessage.trim() || !selectedRoom) return // 如果输入为空或没有选中聊天室则不发送

    try {
      const res = await client.post('/api/chat/send', {
        senderUsername: currentUsername, // 当前发送者用户名
        receiverUsername: selectedRoom.partnerUsername, // 当前聊天对象用户名
        content: newMessage // 输入框里的消息内容
      })

      const data = res.data

      if (!data.success) {
        alert(data.message)
        return
      }

      setNewMessage('') // 清空输入框内容
      setAiError('') // 清空 AI 错误提示
      fetchMessages(true) // 重新获取消息
      fetchRooms() // 更新聊天室列表

    } catch (err) {
      console.error('发送消息失败:', err)
    }
  }

  const handleAiSuggest = async () => { // 定义 AI 辅助回复函数
    if (!selectedRoom) return

    setIsAiLoading(true) // AI loading 开启
    setAiError('') // 清空旧错误

    try {
      const context = messages
        .slice(-8) // 只保留最近 8 条消息
        .map(msg => `${msg.senderUsername}: ${msg.content}`)
        .join('\n')

      const question =
        newMessage.trim() ||
        messages[messages.length - 1]?.content ||
        '최근 채팅 내용에서 이해하기 어려운 지식 포인트를 설명해주세요.'

      const res = await client.post('/api/chat/ai-help', {
        message: question,
        partner: selectedRoom.partnerUsername,
        context
      })

      const data = res.data

      if (!data.success) {
        setAiError('AI 학습 도움 생성에 실패했습니다.')
        return
      }

      const translated = await translateText(data.answer)

      const aiMessage = `${AI_PREFIX}\n${
        translated
          ? `${data.answer}\n🌐 ${translated}`
          : data.answer
      }`

      const sendRes = await client.post('/api/chat/send', {
        senderUsername: currentUsername,
        receiverUsername: selectedRoom.partnerUsername,
        content: aiMessage
      })

      const sendData = sendRes.data

      if (!sendData.success) {
        setAiError('AI 메시지 저장에 실패했습니다.')
        return
      }

      setNewMessage('')
      fetchMessages(true)
      fetchRooms()
      scrollToBottom()

    } catch (err) {
      console.error('AI 요청失败:', err)
      setAiError('AI 서버 연결에 실패했습니다.')
    } finally {
      setIsAiLoading(false)
    }
  }

  useEffect(() => { // 当前用户变化时加载聊天室
    if (currentUsername) {
      fetchRooms()
    }
  }, [currentUsername])

  useEffect(() => { // 当前聊天室变化时加载消息并轮询
    if (!selectedRoom || !currentUsername) return

    fetchMessages(true)

    const interval = setInterval(
      () => fetchMessages(false),
      2000
    )

    return () => clearInterval(interval)
  }, [selectedRoom, currentUsername])

  useEffect(() => { // 自动翻译消息
    if (!messages.length) {
      setTranslatedMessages({})
      return
    }

    autoTranslateMessages()
  }, [messages, currentLang])

  if (!currentUsername) { // 未登录状态
    return (
      <div style={{ color: 'white', padding: '40px' }}>
        먼저 로그인해 주세요.
      </div>
    )
  }

  if (!rooms.length) { // 没有聊天室
    return (
      <div style={{ color: 'white', padding: '40px' }}>
        매칭된 채팅방이 없습니다.
      </div>
    )
  }

  return (
    <div className="chat-page">
      <div className="chat-sidebar">
        <div className="chat-sidebar-top">
          <h2 className="chat-title">{text.chat}</h2>

          <input
            type="text"
            placeholder="채팅 검색..."
            className="chat-search"
          />
        </div>

        <div className="chat-user-list">
          {rooms.map(room => (
            <div
              key={room.roomId}
              className={`chat-user-card ${
                selectedRoom?.roomId === room.roomId
                  ? 'active-chat'
                  : ''
              }`}
              onClick={() => {
                setSelectedRoom(room)
                setAiError('')
                scrollToBottom()
              }}
            >
              <div className="chat-avatar">
                {room.partnerName?.charAt(0)}
              </div>

              <div className="chat-user-info">
                <h4>{room.partnerName}</h4>
                <p>{room.lastMessage || '새로운 대화를 시작하세요'}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="chat-main">
        <div className="chat-header">
          <div className="chat-header-info">
            <h3>{selectedRoom?.partnerName}</h3>
            <span>온라인</span>
          </div>
        </div>

        <div className="chat-messages">
                    {messages.map((msg, index) => {
            const isMe = msg.senderUsername === currentUsername // 判断是否自己发送
            const isAi = msg.content?.startsWith(AI_PREFIX) // 判断是否 AI 消息

            let showTimeBubble = index === 0
            let hideAvatar = false

            if (index > 0) {
              const prev = messages[index - 1]
              const nowTime = new Date(msg.createdAt || msg.time)
              const prevTime = new Date(prev.createdAt || prev.time)

              if (!isNaN(nowTime) && !isNaN(prevTime)) {
                showTimeBubble = nowTime - prevTime > TIME_GAP
              }
            }

            if (index < messages.length - 1) {
              const next = messages[index + 1]
              const nowTime = new Date(msg.createdAt || msg.time)
              const nextTime = new Date(next.createdAt || next.time)

              if (
                next.senderUsername === msg.senderUsername &&
                nextTime - nowTime <= TIME_GAP &&
                !next.content?.startsWith(AI_PREFIX)
              ) {
                hideAvatar = true
              }
            }

            return (
              <div
                key={msg.id || index}
                style={{ display: 'contents' }}
              >
                {showTimeBubble && (
                  <div className="chat-time-bubble">
                    {formatWeChatTime(
                      msg.createdAt || msg.time
                    )}
                  </div>
                )}

                {isAi ? (
                  <div className="ai-suggestion-box">
                    <div className="ai-suggest-title">
                      {AI_PREFIX}
                    </div>

                    <div className="ai-suggest-content">
                      {msg.content.replace(
                        `${AI_PREFIX}\n`,
                        ''
                      )}
                    </div>
                  </div>
                ) : (
                  <div
                    className={`message-row ${
                      isMe
                        ? 'row-sent'
                        : 'row-received'
                    } ${
                      hideAvatar
                        ? 'avatar-hidden'
                        : ''
                    }`}
                  >
                    {!isMe && (
                      <div className="message-avatar">
                        {!hideAvatar &&
                          selectedRoom?.partnerName?.charAt(0)}
                      </div>
                    )}

                    <div
                      className={`message ${
                        isMe
                          ? 'sent'
                          : 'received'
                      }`}
                    >
                      <div className="message-text">
                        {msg.content}
                      </div>

                      {translatedMessages[msg.id] && (
                        <div className="translated-message">
                          {translatedMessages[msg.id]}
                        </div>
                      )}
                    </div>

                    {isMe && (
                      <>
                        <div className="message-avatar">
                          {!hideAvatar &&
                            currentUsername?.charAt(0)}
                        </div>

                        <span
                          className={`msg-status ${
                            msg.isRead
                              ? 'status-read'
                              : 'status-unread'
                          }`}
                        >
                          {msg.isRead ? '읽음' : '1'}
                        </span>
                      </>
                    )}
                  </div>
                )}
              </div>
            )
          })}

          {isAiLoading && (
            <div className="message-row row-received">
              <div className="message-avatar">✨</div>

              <div className="message received ai-typing-bubble">
                <div className="typing-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}

          {aiError && (
            <div className="ai-suggestion-box">
              <div className="ai-suggest-title">
                {AI_PREFIX}
              </div>

              <div className="ai-suggest-content">
                {aiError}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-area">
          <button className="plus-btn">
            +
          </button>

          <input
            type="text"
            className="chat-input"
            value={newMessage}
            onChange={(e) =>
              setNewMessage(e.target.value)
            }
            onKeyDown={(e) =>
              e.key === 'Enter' &&
              handleSendMessage()
            }
            placeholder="메시지를 입력하세요..."
          />

          <button
            className="ai-btn"
            onClick={handleAiSuggest}
            disabled={isAiLoading}
          >
            {isAiLoading ? '...' : '✨ AI'}
          </button>

          <button
            className="send-btn"
            onClick={handleSendMessage}
          >
            보내기
          </button>
        </div>

      </div>
    </div>
  )
}

export default Chat
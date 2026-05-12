import { useEffect, useRef, useState } from 'react'

const API_BASE = 'http://10.30.4.139:8080'

function Chat({ text }) {
  const currentUser = JSON.parse(
    localStorage.getItem('loginUser')
  )

  const currentUsername = currentUser?.username || ''

  const [rooms, setRooms] = useState([])
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [isAiLoading, setIsAiLoading] = useState(false)
  const [aiSuggestion, setAiSuggestion] = useState('')
  const [translatedMessages, setTranslatedMessages] = useState({})

  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({
        behavior: 'smooth'
      })
    }, 100)
  }

  // 当前页面语言
  const getCurrentLang = () => {
    return localStorage.getItem('lang') || 'ko'
  }

  // 检测消息语言
  const detectLanguage = (text) => {
    if (!text) return 'en'

    if (/[\uac00-\ud7af]/.test(text)) return 'ko'
    if (/[\u4e00-\u9fff]/.test(text)) return 'zh'
    if (/[\u3040-\u30ff]/.test(text)) return 'ja'
    if (/[\u0600-\u06FF]/.test(text)) return 'ar'

    return 'en'
  }

  // 加载聊天室
  useEffect(() => {
    if (!currentUsername) return
    fetchRooms()
  }, [currentUsername])

  const fetchRooms = async () => {
    try {
      const res = await fetch(
        `${API_BASE}/api/chat/rooms?username=${currentUsername}`
      )

      if (!res.ok) {
        setRooms([])
        return
      }

      const data = await res.json()

      if (!Array.isArray(data)) {
        setRooms([])
        return
      }

      setRooms(data)

      if (data.length > 0) {
        setSelectedRoom(prev =>
          prev?.roomId === data[0].roomId
            ? prev
            : data[0]
        )
      }

    } catch (err) {
      console.log('聊天室加载失败', err)
      setRooms([])
    }
  }

  // 加载聊天记录（实时）
  useEffect(() => {
    if (!selectedRoom || !currentUsername) return

    fetchMessages(true)

    const interval = setInterval(() => {
      fetchMessages(false)
    }, 2000)

    return () => clearInterval(interval)

  }, [selectedRoom, currentUsername])

  const fetchMessages = async (shouldScroll = false) => {
    try {
      const res = await fetch(
        `${API_BASE}/api/chat/messages?me=${currentUsername}&partner=${selectedRoom.partnerUsername}`
      )

      if (!res.ok) return

      const data = await res.json()

      if (!Array.isArray(data)) return

      setMessages(data)

      if (shouldScroll) {
        scrollToBottom()
      }

    } catch (err) {
      console.log('聊天记录加载失败', err)
    }
  }

  // 自动翻译
  useEffect(() => {
    if (!messages.length) return
    autoTranslateMessages()
  }, [messages])

  const autoTranslateMessages = async () => {
    const currentLang = getCurrentLang()
    const translations = {}

    for (const msg of messages) {
      const messageLang = detectLanguage(msg.content)

      if (messageLang === currentLang) {
        continue
      }

      try {
        const res = await fetch(
          `${API_BASE}/api/translate`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              text: msg.content,
              targetLang: currentLang
            })
          }
        )

        const translated = await res.text()

        if (
          translated &&
          translated.trim() &&
          translated !== msg.content
        ) {
          translations[msg.id] = translated
        }

      } catch (err) {
        console.log('翻译失败', err)
      }
    }

    setTranslatedMessages(translations)
  }

  // 发消息
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return
    if (!selectedRoom) return

    try {
      const res = await fetch(
        `${API_BASE}/api/chat/send`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            senderUsername: currentUsername,
            receiverUsername: selectedRoom.partnerUsername,
            content: newMessage
          })
        }
      )

      const data = await res.json()

      if (data.success) {
        setNewMessage('')
        setAiSuggestion('')
        fetchMessages(true)
        fetchRooms()
      } else {
        alert(data.message)
      }

    } catch (err) {
      console.log('发送失败', err)
    }
  }

  // AI 推荐
  const handleAiSuggest = async () => {
    if (!messages.length) return

    setIsAiLoading(true)

    try {
      const lastMessage = messages[messages.length - 1]

      const res = await fetch(
        `${API_BASE}/api/chat/ai-suggest`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            message: lastMessage.content,
            partner: selectedRoom.partnerUsername
          })
        }
      )

      const data = await res.json()

      if (data.success) {
        setAiSuggestion(data.suggestion)
        scrollToBottom()
      }

    } catch (err) {
      console.log('AI失败', err)
    } finally {
      setIsAiLoading(false)
    }
  }

  if (!currentUsername) {
    return (
      <div style={{ color: 'white', padding: '40px' }}>
        Please login first.
      </div>
    )
  }

  if (rooms.length === 0) {
    return (
      <div style={{ color: 'white', padding: '40px' }}>
        No matched chats.
      </div>
    )
  }

  return (
    <div className="chat-page">

      {/* 左侧 */}
      <div className="chat-sidebar">
        <div className="chat-sidebar-top">
          <h2 className="chat-title">
            {text.chat}
          </h2>

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
                setAiSuggestion('')
                scrollToBottom()
              }}
            >
              <div className="chat-avatar">
                {room.partnerName?.charAt(0)}
              </div>

              <div className="chat-user-info">
                <h4>{room.partnerName}</h4>
                <p>
                  {room.lastMessage || '새로운 대화를 시작하세요'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 右侧 */}
      <div className="chat-main">

        <div className="chat-header">
          <div className="chat-header-info">
            <div className="chat-avatar">
              {selectedRoom?.partnerName?.charAt(0)}
            </div>

            <div>
              <h3>{selectedRoom?.partnerName}</h3>
              <p>온라인</p>
            </div>
          </div>
        </div>

        {/* 消息区 */}
        <div className="chat-messages">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`message ${
                msg.senderUsername === currentUsername
                  ? 'sent'
                  : 'received'
              }`}
            >
              <div>{msg.content}</div>

              {translatedMessages[msg.id] && (
                <div className="translated-message">
                  🌐 {translatedMessages[msg.id]}
                </div>
              )}
            </div>
          ))}

          {aiSuggestion && (
            <div
              className="ai-suggestion-box"
              onClick={() =>
                setNewMessage(aiSuggestion)
              }
            >
              <p className="ai-label">
                ✨ AI Suggestion
              </p>
              <p>{aiSuggestion}</p>
            </div>
          )}

          <div ref={messagesEndRef}></div>
        </div>

        {/* 输入 */}
        <div className="chat-input-area">
          <button className="plus-btn">
            +
          </button>

          <input
            type="text"
            placeholder="메시지를 입력하세요..."
            className="chat-input"
            value={newMessage}
            onChange={(e) =>
              setNewMessage(e.target.value)
            }
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSendMessage()
              }
            }}
          />

          <button
            className="ai-btn"
            onClick={handleAiSuggest}
            disabled={isAiLoading}
          >
            {isAiLoading ? 'AI...' : '✨ AI'}
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
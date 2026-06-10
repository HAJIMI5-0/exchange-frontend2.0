import { useEffect, useMemo, useRef, useState } from 'react'
import client from '../api/client'

const AI_PREFIX = '🤖'
const TIME_GAP = 300000

function Chat({ text }) {
  const currentUser = useMemo(() => {
    try {
      return JSON.parse(
        localStorage.getItem('loginUser') || '{}'
      )
    } catch {
      return {}
    }
  }, [])
  const currentUsername = currentUser?.username || ''
  const currentLang = localStorage.getItem('lang') || 'ko'
  const [rooms, setRooms] = useState([])
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [isAiLoading, setIsAiLoading] = useState(false)
  const [
    translatedMessages,
    setTranslatedMessages
  ] = useState({})
  const [aiError, setAiError] = useState('')
  // 新增
  const [myRating, setMyRating] = useState(0)
  const messagesEndRef = useRef(null)
  const scrollToBottom = () =>
    requestAnimationFrame(() =>
      messagesEndRef.current?.scrollIntoView({
        behavior: 'smooth'
      })
    )
  const detectLanguage = (text) => {
    if (!text) return 'en'
    if (/[\uac00-\ud7af]/.test(text))
      return 'ko'
    if (/[\u4e00-\u9fff]/.test(text))
      return 'zh'
    if (/[\u3040-\u30ff]/.test(text))
      return 'ja'
    if (/[\u0600-\u06FF]/.test(text))
      return 'ar'
    return 'en'
  }
  const translateText = async (
    content
  ) => {
    if (
      !content ||
      detectLanguage(content) === currentLang
    ) {return null}
    try {
      const res = await client.post(
        '/api/translate',
        {text: content, targetLang: currentLang}
      )
      const data = res.data
      if (typeof data === 'string') {
        return data.trim() &&
          data !== content
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
    } catch {return null}
  }
  const formatWeChatTime = (
    timeStr
  ) => {
    if (!timeStr) return ''
    try {
      const date =
        new Date(timeStr)
      if (isNaN(date.getTime()))
        return ''
      const now = new Date()
      let hours =
        date.getHours()
      const minutes =
        String(
          date.getMinutes()
        ).padStart(2, '0')
      const ampm =
        hours >= 12
          ? '오후'
          : '오전'
      hours = hours % 12 || 12
      const time =
        `${ampm} ${hours}:${minutes}`
      if (
        date.toDateString() ===
        now.toDateString()
      ) {return `오늘 ${time}`}
      const yesterday =
        new Date(now)
      yesterday.setDate(now.getDate() - 1)
      if (
        date.toDateString() ===
        yesterday.toDateString()
      ) {return `어제 ${time}`}
      if (
        date.getFullYear() ===
        now.getFullYear()
      ) {return `${date.getMonth() + 1}월 ${date.getDate()}일 ${time}`}
      return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 ${time}`
    } catch {return ''}
  }
  const fetchRooms = async () => {
    try {
      const res =
        await client.get(
          '/api/chat/rooms',
          {
            params: {
              username:
                currentUsername
            }
          }
        )
      const data = res.data
      if (!Array.isArray(data)) {
        setRooms([])
        return
      }
      setRooms(data)
      if (
        !selectedRoom &&
        data.length
      ) {
        setSelectedRoom(data[0])
        scrollToBottom()
        return
      }
    } catch {setRooms([])}
  }
  const fetchMessages = async (scroll = false) => {
    if (!selectedRoom) return
    try {
      const res =
        await client.get(
          '/api/chat/messages',
          {
            params: {
              me:
                currentUsername,
              partner:
                selectedRoom.partnerUsername
            }
          }
        )
      const data = res.data
      if (
        !Array.isArray(data)
      ) return
      setMessages(data)
      if (scroll) {
        scrollToBottom()
      }
    } catch {}
  }
  // 新增评分读取
  const fetchMyRating = async () => {
    if (!selectedRoom) return
    try {
      const res =
        await client.get(
          '/api/chat/rating',
          {
            params: {
              roomId:
                selectedRoom.roomId,
              username:
                currentUsername
            }
          }
        )
      setMyRating(
        res.data.rating || 0
      )
    } catch {setMyRating(0)}
  }
  // 新增评分提交
  const handleRating = async (score) => {
    try {
      await client.post(
        '/api/chat/rating',
        {
          roomId:
            selectedRoom.roomId,
          username:
            currentUsername,
          score
        }
      )
      setMyRating(score)
      fetchRooms()
    } catch (e) {
      console.error(e)
    }
  }
  const autoTranslateMessages = async () => {
    const cache = {}
    for (const msg of messages) {
      if (
        msg.content?.startsWith(
          AI_PREFIX
        )
      ) continue
      if (
        translatedMessages[msg.id]
      ) {
        cache[msg.id] =
          translatedMessages[msg.id]
        continue
      }
      const translated =
        await translateText(
          msg.content
        )
      if (translated) {
        cache[msg.id] = translated
      }
    }
    setTranslatedMessages(
      cache
    )
  }
  const handleSendMessage = async () => {
    if (
      !newMessage.trim() ||
      !selectedRoom
    ) return
    try {
      const res =
        await client.post(
          '/api/chat/send',
          {
            senderUsername:
              currentUsername,
            receiverUsername:
              selectedRoom.partnerUsername,
            content:
              newMessage
          }
        )
      const data = res.data
      if (!data.success) {
        alert(data.message)
        return
      }
      setNewMessage('')
      setAiError('')
      fetchMessages(true)
      fetchRooms()
    } catch (err) {
      console.error(
        '发送消息失败:',
        err
      )
    }
  }
  const handleAiSuggest = async () => {
    if (!selectedRoom)
      return
    setIsAiLoading(true)
    setAiError('')
    try {
      const context =messages
        .slice(-8)
        .map(msg => msg.content)
        .join('\n')
        .slice(0, 300)
      const question =
        newMessage.trim()
        ||
        messages[messages.length - 1]?.content
        ||
        '최근 채팅 내용에서 이해하기 어려운 지식 포인트를 설명해주세요.'
      const res = await client.post(
        '/api/chat/ai-help',
        {
          message:
            question,
          partner:
            selectedRoom.partnerUsername,
          context,
          targetLang:
            currentLang
        }
      )
      const data =res.data
        if (
          !data.success
        ) {
          setAiError('AI 학습 도움 생성에 실패했습니다.')
          return
        }
        const aiMessage =
          `${AI_PREFIX}\n${data.answer}`
        const sendRes =
          await client.post(
            '/api/chat/send',
            {
              senderUsername:
                currentUsername,
              receiverUsername:
                selectedRoom.partnerUsername,
              content:
                aiMessage
            }
          )
        const sendData =
          sendRes.data
        if (
          !sendData.success
        ) {
          setAiError('AI 메시지 저장에 실패했습니다.')
          return
        }
        setNewMessage('')
        fetchMessages(true)
        fetchRooms()
        scrollToBottom()
      } catch (err) {
        console.error(
          'AI 요청失败:',
          err
        )
        setAiError(
          'AI 서버 연결에 실패했습니다.'
        )
      } finally {
        setIsAiLoading(
          false
        )
      }
    }
  useEffect(() => {
    if (
      currentUsername
    ) {
      fetchRooms()
    }
  }, [currentUsername])
  useEffect(() => {
    if (
      !selectedRoom ||
      !currentUsername
    ) {
      return
    }
    fetchMessages(true)
    // 新增
    fetchMyRating()
    const interval =
      setInterval(
        () =>
          fetchMessages(
            false
          ),
        2000
      )
    return () =>
      clearInterval(
        interval
      )
  }, [
    selectedRoom,
    currentUsername
  ])
  useEffect(() => {
    if (
      !messages.length
    ) {
      setTranslatedMessages(
        {}
      )
      return
    }
    autoTranslateMessages()
  }, [
    messages,
    currentLang
  ])
  if (
    !currentUsername
  ) {
    return (
      <div
        style={{
          color:
            'white',
          padding:
            '40px'
        }}
      >
        먼저 로그인해 주세요.
      </div>
    )
  }
  if (
    !rooms.length
  ) {
    return (
      <div
        style={{
          color:
            'white',
          padding:
            '40px'
        }}
      >
        매칭된 채팅방이 없습니다.
      </div>
    )
  }
  return (
    <div className="chat-page">
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
          {rooms.map(
            room => (
            <div
              key={
                room.roomId
              }
              className={`chat-user-card ${
                selectedRoom?.roomId ===
                room.roomId
                  ? 'active-chat'
                  : ''
              }`}
              onClick={() => {
                setSelectedRoom(
                  room
                )
                setAiError('')
                scrollToBottom()
              }}
            >
              <div className="chat-avatar">
                {room.partnerAvatar ? (
                  <img
                    src={room.partnerAvatar}
                    alt={room.partnerName}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      borderRadius: '50%'
                    }}
                  />
                ) : (
                  room.partnerName?.charAt(0)
                )}
              </div>
              <div className="chat-user-info">
                <h4>
                  {room.partnerName}
                  <span
                    style={{
                      marginLeft:
                        '8px',
                      color:
                        '#f5b50a',
                      fontSize:
                        '13px'
                    }}
                  >
                    ⭐ {
                      room.averageRating || 0
                    }
                  </span>
                </h4>
                <p>
                  {
                    room.lastMessage ||
                    '새로운 대화를 시작하세요'
                  }
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
            <div className="chat-main">
        <div className="chat-header">
          <div className="chat-header-info">
            <h3>
              {selectedRoom?.partnerName}
              <span
                style={{
                  marginLeft: '10px',
                  color: '#f5b50a',
                  fontSize: '15px'
                }}
              >
                ⭐ {
                  selectedRoom?.averageRating || 0
                }
              </span>
            </h3>
            {/* 当前用户评分 */}
            <div>
              {[1,2,3,4,5].map(star => (
                <span
                  style={{
                    display: 'flex',
                    gap: '6px',
                    marginTop: '8px',
                    padding: '8px 10px',
                    borderRadius: '14px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.05)',
                    backdropFilter: 'blur(12px)',
                    alignItems: 'center'
                  }}
                  key={star}
                  onClick={() => handleRating(star)}
                  style={{
                    cursor: 'pointer',
                    fontSize: '22px',
                    transition: 'all 0.2s ease',
                    transform: star <= myRating ? 'scale(1.08)' : 'scale(1)',
                    filter: star <= myRating
                      ? 'drop-shadow(0 0 4px rgba(255,215,0,0.6))'
                      : 'none',
                    opacity: star <= myRating ? 1 : 0.45,
                    userSelect: 'none'
                  }}
                >
                  {star <= myRating ? '⭐' : '☆'}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="chat-messages">
          {messages.map((msg, index) => {
            const isMe =
              msg.senderUsername ===
              currentUsername
            const isAi =
              msg.content?.startsWith(
                AI_PREFIX
              )
            let showTimeBubble =
              index === 0
            let hideAvatar =
              false
            if (index > 0) {
              const prev =
                messages[index - 1]
              const nowTime =
                new Date(
                  msg.createdAt ||
                  msg.time
                )
              const prevTime =
                new Date(
                  prev.createdAt ||
                  prev.time
                )
              if (
                !isNaN(nowTime) &&
                !isNaN(prevTime)
              ) {
                showTimeBubble =
                  nowTime -
                  prevTime >
                  TIME_GAP
              }
            }
            if (
              index <
              messages.length - 1
            ) {
              const next =
                messages[index + 1]
              const nowTime =
                new Date(
                  msg.createdAt ||
                  msg.time
                )
              const nextTime =
                new Date(
                  next.createdAt ||
                  next.time
                )
              if (
                next.senderUsername ===
                msg.senderUsername &&
                nextTime - nowTime <=
                TIME_GAP &&
                !next.content?.startsWith(
                  AI_PREFIX
                )
              ) {
                hideAvatar = true
              }
            }
            return (
              <div
                key={
                  msg.id || index
                }
                style={{
                  display:
                    'contents'
                }}
              >
                {showTimeBubble && (

                  <div className="chat-time-bubble">

                    {formatWeChatTime(
                      msg.createdAt ||
                      msg.time
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
                      {!hideAvatar && (
                        selectedRoom?.partnerAvatar ? (
                          <img
                            src={selectedRoom.partnerAvatar}
                            alt={selectedRoom.partnerName}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              borderRadius: '50%'
                            }}
                          />
                        ) : (
                          selectedRoom?.partnerName?.charAt(0)
                        )
                      )}
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
                          {
                            translatedMessages[msg.id]
                          }
                        </div>
                      )}
                    </div>
                    {isMe && (
                      <>
                        <div className="message-avatar">
                          {!hideAvatar &&
                            currentUsername?.charAt(
                              0
                            )}
                        </div>
                        <span
                          className={`msg-status ${
                            msg.isRead
                              ? 'status-read'
                              : 'status-unread'
                          }`}
                        >
                          {msg.isRead
                            ? '읽음'
                            : '1'}
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
              <div className="message-avatar">
                ✨
              </div>
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
              setNewMessage(
                e.target.value
              )
            }
            onKeyDown={(e) =>
              e.key === 'Enter' &&
              handleSendMessage()
            }
            placeholder="메시지를 입력하세요..."
          />
          <button
            className="ai-btn"
            onClick={
              handleAiSuggest
            }
            disabled={
              isAiLoading
            }
          >
            {
              isAiLoading
                ? '...'
                : '✨ AI'
            }
          </button>
          <button
            className="send-btn"
            onClick={
              handleSendMessage
            }
          >
            보내기
          </button>
        </div>
      </div>
    </div>
  )
}
export default Chat
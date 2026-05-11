import { useState } from 'react'

function Chat({ text }) {

  const initialChats = [
    {
      id: 1,
      user: "Alex",
      status: "온라인",
      lastMessage: "안녕하세요, 잘 지내세요?",
      time: "오후 10:30",
      messages: [
        { type: "received", text: "안녕하세요!" },
        { type: "sent", text: "안녕하세요, 만나서 반가워요." },
        { type: "received", text: "어떤 기술을 배우고 싶나요?" }
      ]
    },

    {
      id: 2,
      user: "Sophia",
      status: "오프라인",
      lastMessage: "기술 교환을 해봐요!",
      time: "오후 9:15",
      messages: [
        { type: "received", text: "React를 가르쳐 줄 수 있나요?" },
        { type: "sent", text: "물론이죠, 도와드릴게요." }
      ]
    },

    {
      id: 3,
      user: "Daniel",
      status: "온라인",
      lastMessage: "내일 봐요.",
      time: "어제",
      messages: [
        { type: "received", text: "내일 봐요!" }
      ]
    }
  ]

  const [chats, setChats] = useState(initialChats)

  const [selectedChat, setSelectedChat] =
    useState(initialChats[0])

  const [newMessage, setNewMessage] = useState("")

  /* ===== 메시지 전송 ===== */

  const handleSendMessage = () => {

    if (!newMessage.trim()) return

    const updatedChats = chats.map((chat) => {

      if (chat.id === selectedChat.id) {

        const updatedMessages = [
          ...chat.messages,
          {
            type: "sent",
            text: newMessage
          }
        ]

        return {
          ...chat,
          lastMessage: newMessage,
          messages: updatedMessages
        }
      }

      return chat
    })

    setChats(updatedChats)

    const updatedSelectedChat = updatedChats.find(
      (chat) => chat.id === selectedChat.id
    )

    setSelectedChat(updatedSelectedChat)

    setNewMessage("")
  }

  return (
    <div className="chat-page">

      {/* ===== Sidebar ===== */}
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

        {/* ===== Chat Users ===== */}
        <div className="chat-user-list">

          {chats.map((chat) => (

            <div
              key={chat.id}
              className={`chat-user-card ${
                selectedChat.id === chat.id
                  ? 'active-chat'
                  : ''
              }`}
              onClick={() => setSelectedChat(chat)}
            >

              <div className="chat-avatar">
                {chat.user.charAt(0)}
              </div>

              <div className="chat-user-info">

                <div className="chat-user-top">

                  <h4>{chat.user}</h4>

                  <span>{chat.time}</span>

                </div>

                <p>{chat.lastMessage}</p>

              </div>

            </div>

          ))}

        </div>

      </div>

      {/* ===== Main Chat ===== */}
      <div className="chat-main">

        {/* ===== Header ===== */}
        <div className="chat-header">

          <div className="chat-header-info">

            <div className="chat-avatar">
              {selectedChat.user.charAt(0)}
            </div>

            <div>

              <h3>{selectedChat.user}</h3>

              <p>{selectedChat.status}</p>

            </div>

          </div>

        </div>

        {/* ===== Messages ===== */}
        <div className="chat-messages">

          {selectedChat.messages.map((msg, index) => (

            <div
              key={index}
              className={`message ${msg.type}`}
            >
              {msg.text}
            </div>

          ))}

        </div>

        {/* ===== Input Area ===== */}
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
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import MatchFilter from '../components/match/MatchFilter'
import MatchUserCard from '../components/match/MatchUserCard'
import MatchUserModal from '../components/match/MatchUserModal'
import useTranslatedUsers from '../components/match/useTranslatedUsers'

import {
  fetchMatchUsers,
  createDirectChatRoom
} from '../api/matchApi'

function Match({ text, lang = 'zh' }) {
  const navigate = useNavigate()

  const [users, setUsers] = useState([])

  const [haveSkill, setHaveSkill] = useState('')
  const [wantSkill, setWantSkill] = useState('')
  const [timeSlot, setTimeSlot] = useState('')
  const [learnLevel, setLearnLevel] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [selectedUser, setSelectedUser] = useState(null)
  const [chatResult, setChatResult] = useState('')

  const translatedUsers = useTranslatedUsers(users, lang)

  const displayUsers = translatedUsers.length > 0 ? translatedUsers : users

  const handleMatch = async () => {
    setLoading(true)
    setError('')
    setUsers([])
    setChatResult('')

    try {
      const data = await fetchMatchUsers({
        haveSkill,
        wantSkill,
        timeSlot,
        learnLevel,
        limit: 5
      })

      console.log('匹配接口返回:', data)

      setUsers(data)
    } catch (err) {
      console.error(err)
      setError(text.matchError || '匹配失败，请检查后端接口是否正常')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectUser = (user) => {
    console.log('当前选择的用户:', user)

    setSelectedUser(user)
    setChatResult('')
  }

  const handleCloseModal = () => {
    setSelectedUser(null)
    setChatResult('')
  }

  const handleStartChat = async () => {
    const savedLoginUser = localStorage.getItem('loginUser')
    const loginUser = savedLoginUser ? JSON.parse(savedLoginUser) : null

    if (!loginUser || !loginUser.username) {
      setChatResult(text.loginBeforeChat || '请先登录后再开始聊天')
      return
    }

    if (!selectedUser || !selectedUser.username) {
      setChatResult(text.noReceiverAccount || '暂时无法创建聊天室：匹配接口没有返回对方账号')
      return
    }

    if (loginUser.username === selectedUser.username) {
      setChatResult(text.cannotChatSelf || '不能和自己创建聊天室')
      return
    }

    try {
      const result = await createDirectChatRoom({
        senderUsername: loginUser.username,
        receiverUsername: selectedUser.username
      })

      const data = result.data

      console.log('创建聊天室接口状态:', result.status)
      console.log('创建聊天室接口返回:', data)

      if (result.ok && data.success === true) {
        const roomId = data.roomId || data.chatRoomId || data.id

        setChatResult(text.chatRoomCreated || '聊天室已创建')

        if (roomId) {
          navigate(`/chat?roomId=${roomId}`, {
            state: {
              roomId,
              chatUser: selectedUser
            }
          })
        } else {
          navigate('/chat', {
            state: {
              chatUser: selectedUser
            }
          })
        }
      } else {
        setChatResult(data.message || text.createChatFailed || '创建聊天室失败')
      }
    } catch (err) {
      console.error(err)
      setChatResult(text.createChatApiError || '创建聊天室失败，请检查后端聊天室接口')
    }
  }

  return (
    <div className="match-page">
      <h1>{text.matchTitle || '技能匹配'}</h1>

      <MatchFilter
        text={text}
        haveSkill={haveSkill}
        wantSkill={wantSkill}
        timeSlot={timeSlot}
        learnLevel={learnLevel}
        setHaveSkill={setHaveSkill}
        setWantSkill={setWantSkill}
        setTimeSlot={setTimeSlot}
        setLearnLevel={setLearnLevel}
        loading={loading}
        onMatch={handleMatch}
      />

      <div className="match-result">
        {loading && (
          <p className="empty-text">
            {text.matching || '匹配中...'}
          </p>
        )}

        {error && (
          <p className="empty-text">
            {error}
          </p>
        )}

        {!loading && !error && users.length === 0 ? (
          <p className="empty-text">
            {text.matchEmpty || '请选择条件后开始匹配'}
          </p>
        ) : (
          displayUsers.map(user => (
            <MatchUserCard
              key={user.id || user.username || user.name}
              text={text}
              user={user}
              onSelect={handleSelectUser}
            />
          ))
        )}
      </div>

      {selectedUser && (
        <MatchUserModal
          text={text}
          selectedUser={selectedUser}
          chatResult={chatResult}
          onClose={handleCloseModal}
          onStartChat={handleStartChat}
        />
      )}
    </div>
  )
}

export default Match
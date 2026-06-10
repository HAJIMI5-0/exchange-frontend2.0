import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import MatchFilter from '../components/match/MatchFilter'
import MatchUserCard from '../components/match/MatchUserCard'
import MatchUserModal from '../components/match/MatchUserModal'
import useTranslatedUsers from '../components/match/useTranslatedUsers'

import {
  fetchMatchUsers,
  fetchMatchProfile,
  createDirectChatRoom
} from '../api/matchApi'

function Match({ text, lang = 'zh' }) {
  const navigate = useNavigate()

  const [users, setUsers] = useState([])

  const [haveSkill, setHaveSkill] = useState('')
  const [wantSkill, setWantSkill] = useState('')
  const [timeSlot, setTimeSlot] = useState('weekday_morning')
  const [learnLevel, setLearnLevel] = useState('beginner')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [selectedUser, setSelectedUser] = useState(null)
  const [chatResult, setChatResult] = useState('')

  const [matchHistory, setMatchHistory] = useState([])
  const [matchHistoryLoading, setMatchHistoryLoading] = useState(false)
  const [matchHistoryError, setMatchHistoryError] = useState('')

  const translatedUsers = useTranslatedUsers(users, lang)

  const displayUsers = translatedUsers.length > 0 ? translatedUsers : users

  const handleMatch = async () => {
    setLoading(true)
    setError('')
    setUsers([])
    setChatResult('')
    setSelectedUser(null)
    setMatchHistory([])
    setMatchHistoryError('')

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

  // 点击头像：打开用户详情卡片，并请求详情接口
  const handleAvatarClick = async (user) => {
    console.log('当前查看的用户:', user)

    setSelectedUser(user)
    setChatResult('')
    setMatchHistory([])
    setMatchHistoryError('')

    const userId = user.id

    if (!userId) {
      setMatchHistoryError(text.noUserId || '暂时无法获取匹配历史：用户ID不存在')
      return
    }

    setMatchHistoryLoading(true)

    try {
      const profile = await fetchMatchProfile(userId)

      const mergedUser = {
        ...user,
        ...profile,

        // 兼容后端详情接口字段
        skills: profile.skillOffer || user.skills,
        wants: profile.skillWant || user.wants,
        skillOffer: profile.skillOffer || user.skillOffer,
        skillWant: profile.skillWant || user.skillWant,

        // 评分字段
        averageRating: profile.averageRating ?? user.averageRating,
        ratingCount: profile.ratingCount ?? user.ratingCount,

        // 保留翻译后的字段，避免点击头像后翻译字段丢失
        translatedSkills: user.translatedSkills,
        translatedWants: user.translatedWants,
        translatedNationality: user.translatedNationality
      }

      const histories =
        profile.histories ||
        profile.history ||
        profile.matchHistory ||
        profile.matchHistories ||
        []

      setSelectedUser(mergedUser)
      setMatchHistory(histories)
    } catch (err) {
      console.error(err)
      setMatchHistoryError(text.matchHistoryLoadFailed || '匹配历史记录加载失败')
    } finally {
      setMatchHistoryLoading(false)
    }
  }

  const handleCloseModal = () => {
    setSelectedUser(null)
    setChatResult('')
    setMatchHistory([])
    setMatchHistoryError('')
    setMatchHistoryLoading(false)
  }

  // 点击选择TA：直接创建聊天室 / 匹配成功 / 跳转聊天
  const handleSelectUser = async (user) => {
    console.log('当前选择的用户:', user)

    setChatResult('')

    const savedLoginUser = localStorage.getItem('loginUser')
    const loginUser = savedLoginUser ? JSON.parse(savedLoginUser) : null

    if (!loginUser || !loginUser.username) {
      setChatResult(text.loginBeforeChat || '请先登录后再开始聊天')
      return
    }

    if (!user || !user.username) {
      setChatResult(text.noReceiverAccount || '暂时无法创建聊天室：匹配接口没有返回对方账号')
      return
    }

    if (loginUser.username === user.username) {
      setChatResult(text.cannotChatSelf || '不能和自己创建聊天室')
      return
    }

    try {
      const result = await createDirectChatRoom({
        senderUsername: loginUser.username,
        receiverUsername: user.username
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
              chatUser: user
            }
          })
        } else {
          navigate('/chat', {
            state: {
              chatUser: user
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

      {chatResult && !selectedUser && (
        <p className="match-chat-result">
          {chatResult}
        </p>
      )}

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
              lang={lang}
              onSelect={handleSelectUser}
              onAvatarClick={handleAvatarClick}
            />
          ))
        )}
      </div>

      {selectedUser && (
        <MatchUserModal
          text={text}
          lang={lang}
          selectedUser={selectedUser}
          chatResult={chatResult}
          matchHistory={matchHistory}
          matchHistoryLoading={matchHistoryLoading}
          matchHistoryError={matchHistoryError}
          onClose={handleCloseModal}
        />
      )}
    </div>
  )
}

export default Match
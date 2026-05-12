import { useState } from 'react'

const API_BASE_URL = 'http://10.30.4.139:8080'

function Match({ text }) {
  const [users, setUsers] = useState([])

  const [haveSkill, setHaveSkill] = useState('')
  const [wantSkill, setWantSkill] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // 保存当前被选择的用户
  const [selectedUser, setSelectedUser] = useState(null)

  // 保存申请好友后的提示文字
  const [applyResult, setApplyResult] = useState('')

  const handleMatch = async () => {
    setLoading(true)
    setError('')
    setUsers([])
    setApplyResult('')

    try {
      const params = new URLSearchParams()

      if (haveSkill) {
        params.append('haveSkill', haveSkill.toLowerCase())
      }

      if (wantSkill) {
        params.append('wantSkill', wantSkill.toLowerCase())
      }

      params.append('limit', '5')

      const res = await fetch(`${API_BASE_URL}/api/match?${params.toString()}`)

      if (!res.ok) {
        throw new Error('后端匹配接口请求失败')
      }

      const data = await res.json()

      setUsers(data)
    } catch (err) {
      console.error(err)
      setError(text.matchError || '匹配失败，请检查后端接口是否正常')
    } finally {
      setLoading(false)
    }
  }

  // 点击选择TA，打开弹窗
  const handleSelectUser = (user) => {
  setSelectedUser(user)
  setApplyResult('')
  }

  // 关闭弹窗
  const handleCloseModal = () => {
    setSelectedUser(null)
    setApplyResult('')
  }

  // 申请好友
  const handleApplyFriend = async () => {
    const loginUser = JSON.parse(localStorage.getItem('loginUser'))

    if (!loginUser || !loginUser.username) {
      setApplyResult('请先登录后再申请好友')
      return
    }

    if (!selectedUser || !selectedUser.username) {
      setApplyResult('无法获取对方用户信息')
      return
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/friend-requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          requesterUsername: loginUser.username,
          receiverUsername: selectedUser.username
        })
      })

      const data = await res.json()

      if (res.ok && data.success === true) {
        setApplyResult('好友申请已发送')
      } else {
        setApplyResult(data.message || '申请失败')
      }
    } catch (err) {
      console.error(err)
      setApplyResult('申请失败，请检查后端好友申请接口')
    }
  }

  return (
    <div className="match-page">
      <h1>{text.matchTitle || '技能匹配'}</h1>

      <div className="match-filter-box">
        <div className="filter-group">
          <label>{text.iCan || '我会什么'}</label>

          <input
            type="text"
            value={haveSkill}
            onChange={(e) => setHaveSkill(e.target.value)}
            placeholder="请输入你会的技能，例如 Java"
          />
        </div>

        <div className="filter-group">
          <label>{text.iWantLearn || '我想学什么'}</label>

          <input
            type="text"
            value={wantSkill}
            onChange={(e) => setWantSkill(e.target.value)}
            placeholder="请输入你想学的技能，例如 React"
          />
        </div>

        <button className="match-btn" onClick={handleMatch}>
          {loading ? (text.matching || '匹配中...') : (text.startMatch || '开始匹配')}
        </button>
      </div>

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
            {text.matchEmpty || '请选择技能后开始匹配'}
          </p>
        ) : (
          users.map(user => (
            <div className="user-card" key={user.id}>
              <div className="user-avatar-card">👤</div>

              <h3>{user.name || user.username}</h3>

              <p className="user-age">
                {user.age ? `${user.age}${text.yearsOld || '岁'}` : text.ageUnknown || '年龄未填写'}
              </p>

              <div className="skill-section">
                <span className="skill-title can">
                  {text.canDo || '我会'}
                </span>

                <div>
                  {(user.skills || []).map((s, i) => (
                    <span className="tag" key={i}>{s}</span>
                  ))}
                </div>
              </div>

              <div className="skill-section">
                <span className="skill-title want">
                  {text.wantLearn || '想学'}
                </span>

                <div>
                  {(user.wants || []).map((w, i) => (
                    <span className="tag" key={i}>{w}</span>
                  ))}
                </div>
              </div>

              <button 
                type="button"
                className="select-user-btn"
                onClick={() => handleSelectUser(user)}
              >
                {text.selectTa || '选择TA'}
              </button>
            </div>
          ))
        )}
      </div>

      {/* 用户信息弹窗 */}
      {selectedUser && (
        <div className="modal-mask">
          <div className="user-modal">
            <button className="modal-close-btn" onClick={handleCloseModal}>
            X
            </button>

            <div className="modal-avatar">
              {selectedUser.avatar ? (
                <img src={selectedUser.avatar} alt="avatar" />
              ) : (
                <span>👤</span>
              )}
            </div>

            <h2>{selectedUser.name || selectedUser.username}</h2>

            <div className="modal-info">
              <div className="modal-row">
                <span className="modal-label">用户名</span>
                <span className="modal-value">{selectedUser.username || '-'}</span>
              </div>

              <div className="modal-row">
                <span className="modal-label">年龄</span>
                <span className="modal-value">{selectedUser.age || '-'}</span>
              </div>

              <div className="modal-row">
                <span className="modal-label">性别</span>
                <span className="modal-value">{selectedUser.gender || '-'}</span>
              </div>

              <div className="modal-row">
                <span className="modal-label">国籍</span>
                <span className="modal-value">{selectedUser.nationality || '-'}</span>
              </div>

              <div className="modal-row ">
                <span className="modal-label">擅长技能</span>
                <span className="modal-value">
                  {(selectedUser.skills && selectedUser.skills.length > 0)
                    ? selectedUser.skills.join(', ')
                    : selectedUser.teachSkill || '-'}
                </span>
              </div>

              <div className="modal-row ">
                <span className="modal-label">想学技能</span>
                <span className="modal-value">
                  {(selectedUser.wants && selectedUser.wants.length > 0)
                    ? selectedUser.wants.join(', ')
                    : selectedUser.learnSkill || '-'}
                </span>
              </div>
            </div>

            <button className="apply-friend-btn" onClick={handleApplyFriend}>
              申请好友
            </button>

            {applyResult && (
              <p className="apply-result">
                {applyResult}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Match
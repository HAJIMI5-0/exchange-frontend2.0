import { useState } from 'react'

const API_BASE_URL = 'http://10.30.4.139:8080'

function Match({ text }) {
  const [users, setUsers] = useState([])

  const [haveSkill, setHaveSkill] = useState('')
  const [wantSkill, setWantSkill] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleMatch = async () => {
    setLoading(true)
    setError('')
    setUsers([])

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

  return (
    <div className="match-page">
      <h1>{text.matchTitle || '技能匹配'}</h1>

      <div className="match-filter-box">
        <div className="filter-group">
          <label>{text.iCan || '我会什么'}</label>

          <select
            value={haveSkill}
            onChange={(e) => setHaveSkill(e.target.value)}
          >
            <option value="">{text.noLimit || '不限'}</option>
            <option value="java">Java</option>
            <option value="react">React</option>
            <option value="python">Python</option>
            <option value="ui设计">{text.uiDesign || 'UI设计'}</option>
          </select>
        </div>

        <div className="filter-group">
          <label>{text.iWantLearn || '我想学什么'}</label>

          <select
            value={wantSkill}
            onChange={(e) => setWantSkill(e.target.value)}
          >
            <option value="">{text.noLimit || '不限'}</option>
            <option value="java">Java</option>
            <option value="react">React</option>
            <option value="python">Python</option>
            <option value="ui设计">{text.uiDesign || 'UI设计'}</option>
          </select>
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

              <button className="select-user-btn">
                {text.selectTa || '选择TA'}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default Match
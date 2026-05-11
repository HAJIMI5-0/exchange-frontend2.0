import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const API_BASE_URL = 'http://10.30.4.139:8080'

function Login({ text, setUser }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [result, setResult] = useState('')
  const navigate = useNavigate()

  /*登录数据检查(请求后端前检查有没有填写)*/
  const handleLogin = async () => {
    if (!username || !password) {
      setResult(text.fillAll)
      return
    }

    /*请求后端接口，通过fetch向后端发送请求*/
    try {
      const res = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })

      const data = await res.json() //接收后端返回数据

      //如果后端返回成功，前端创建登录对象
      if (res.ok && data.success === true) {
        let profileData = {}

        try {
          const profileRes = await fetch(
            `${API_BASE_URL}/api/profile?username=${encodeURIComponent(data.username || username)}`
          )

          if (profileRes.ok) {
            profileData = await profileRes.json()
          }
        } catch (profileErr) {
          console.error('登录后获取头像失败:', profileErr)
        }

        let avatarUrl = profileData.avatar || data.avatar || ''

        if (avatarUrl && avatarUrl.startsWith('/')) {
          avatarUrl = `${API_BASE_URL}${avatarUrl}`
        }

        const loginUser = {
          username: profileData.username || data.username || username,
          avatar: avatarUrl
        }

        localStorage.setItem('loginUser', JSON.stringify(loginUser)) //把用户数据保存本地，即使刷新页面也不会退出登录状态
        setUser(loginUser) //更新APP.jsx用户登录状态，导航栏按钮更新
        navigate('/') // 登录成功后自动返回首页
      } else {
        setResult(data.message || '登录失败')
      }
    } catch (err) {
      console.error('登陆错误', err)
      setResult('请求失败')
    }
  }

  return (
    <section className="auth-page">

      <h1>{text.loginPage}</h1>

      <div className="auth-form">
        <input
          type="text"
          placeholder={text.username}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          placeholder={text.password}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* ============ 按钮组=================== */}
        <div className="auth-buttons">
          <button onClick={handleLogin}>{text.loginBtn}</button>

          <button
            type="button"
            className="switch-btn"
            onClick={() => navigate('/register')}
          >
            {text.registerBtn}
          </button>
        </div>

        <p>{result}</p>
      </div>
    </section>
  )
}

export default Login
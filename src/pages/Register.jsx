import { useState } from 'react'                 // 引入 useState，用于管理状态（数据）
import { useNavigate } from 'react-router-dom'   // 引入 useNavigate，用于页面跳转
import client from '../api/client'               // 引入统一 axios 客户端
// import { fetchProfile, updateProfile } from '../api/profileApi'

function Register({ text }) {                    // Register组件接收text

  const [formData, setFormData] = useState({     // 保持注册表单数据
    username: '',                                // 用户名初始为空
    password: '',                                // 密码初始为空
    phone: '',                                   // 电话初始为空
    email: ''                                    // 邮箱初始为空
  })

  const [result, setResult] = useState('')       // 保存提示信息（成功/失败提示）

  const navigate = useNavigate()                 // 创建跳转函数，用于页面切换

  /*用户输入时，自动更新formData里的对应数据*/
  const handleChange = (e) => {                  // 输入框变化时触发
    const { name, value } = e.target             // 获取当前输入框的 name 和 value

    setFormData((prev) => ({                     // 更新表单数据
      ...prev,                                   // 保留原来的所有字段
      [name]: value                              // 根据 name 动态修改对应字段
    }))
  }

  const handleRegister = async () => {           // 点击注册按钮时执行（异步函数）

    const { username, password, phone, email } = formData   // 获取表单数据

    if (!username || !password || !phone || !email) {       // 如果有任意字段为空
      setResult(text.fillAll)                               // 显示“请填写完整信息”
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/         // 邮箱格式正则表达式

    if (!emailRegex.test(email)) {                          // 如果邮箱格式不符合 xxx@xxx.xxx
      setResult(text.emailInvalid || '邮箱格式不正确')
      return
    }

    try {
      const res = await client.post('/api/register', {      // 向后端发送注册请求
        username,
        password,
        phone,
        email
      })

      const data = res.data                                 // axios 自动解析返回数据

      if (data.success === true || res.status === 200) {    // 注册成功
        navigate('/login')                                  // 注册成功跳转登录页
      } else {
        setResult(data.message || `${text.registerBtn}失败`)
      }

    } catch (err) {                                         // 捕获错误（例如后端没启动）
      console.error('注册错误:', err)

      setResult(
        err.response?.data?.message ||
        text.registerFailed ||
        '注册失败'
      )
    }
  }

  return (
    <section className="auth-page">

      <h1>{text.registerPage}</h1>

      <div className="auth-form">

        <input
          name="username"
          placeholder={text.name}
          value={formData.username}
          onChange={handleChange}
        />

        <input
          name="password"
          type="password"
          placeholder={text.password}
          value={formData.password}
          onChange={handleChange}
        />

        <input
          name="phone"
          placeholder={text.phone}
          value={formData.phone}
          onChange={handleChange}
        />

        <input
          name="email"
          type="email"
          placeholder={text.email}
          value={formData.email}
          onChange={handleChange}
        />

        <div className="auth-buttons">

          <button onClick={handleRegister}>
            {text.registerBtn}
          </button>

          <button
            type="button"
            className="switch-btn"
            onClick={() => navigate('/login')}
          >
            {text.loginBtn}
          </button>

        </div>

        <p>{result}</p>

      </div>
    </section>
  )
}

export default Register
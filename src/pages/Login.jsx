import { useState } from 'react'                  // 引入 useState，用来保存输入框内容和提示信息
import { useNavigate } from 'react-router-dom'    // 引入 useNavigate，用来进行页面跳转
import client from "../api/client"                // 引入统一 axios 客户端

function Login({ text, setUser }) {               // 登录组件，接收多语言文本 text 和更新登录用户状态的 setUser
  const [username, setUsername] = useState('')    // 保存用户输入的用户名
  const [password, setPassword] = useState('')    // 保存用户输入的密码
  const [result, setResult] = useState('')        // 保存登录结果提示信息
  const navigate = useNavigate()                  // 创建页面跳转函数

  /*登录数据检查(请求后端前检查有没有填写)*/
  const handleLogin = async () => {               // 点击登录按钮后执行的函数
    if (!username || !password) {                 // 如果用户名或密码为空
      setResult(text.fillAll)                     // 显示“请填写完整信息”的提示
      return                                      // 停止继续执行，不发送请求
    }

    /*请求后端接口，通过axios向后端发送请求*/
    try {
      const res = await client.post('/api/login', {   // 向后端登录接口发送请求
        username,
        password
      })

      const data = res.data                           // axios 自动解析返回数据

      /*如果后端返回成功，前端创建登录对象*/
      if (data.success === true) {                    // 判断后端返回 success 是否为 true
        let profileData = {}                          // 用来保存登录后再次获取到的用户资料

        try {
          const profileRes = await client.get(        // 登录成功后，根据用户名再请求一次个人资料接口
            `/api/profile?username=${encodeURIComponent(
              data.username || username
            )}`                                       // 防止用户名中有特殊字符，使用 encodeURIComponent 编码
          )

          profileData = profileRes.data               // 保存个人资料接口返回的数据

        } catch (profileErr) {                        // 如果获取个人资料失败
          console.error('登录后获取头像失败:', profileErr) // 在控制台输出错误，不影响正常登录
        }

        let avatarUrl =
          profileData.avatar ||
          data.avatar ||
          ''                                          // 优先使用个人资料头像，其次登录接口头像

        if (avatarUrl && avatarUrl.startsWith('/')) { // 如果头像地址是相对路径
          avatarUrl =
            `${import.meta.env.VITE_API_BASE_URL}${avatarUrl}` // 拼接完整头像地址
        }

        const loginUser = {                           // 创建前端保存的登录用户对象
          username:
            profileData.username ||
            data.username ||
            username,

          avatar: avatarUrl
        }

        localStorage.setItem(
          'loginUser',
          JSON.stringify(loginUser)
        )                                             // 把用户数据保存本地，即使刷新页面也不会退出登录状态

        setUser(loginUser)                            // 更新 APP.jsx 用户登录状态
        navigate('/')                                 // 登录成功后自动返回首页

      } else {
        setResult(data.message || '登录失败')         // 登录失败显示提示
      }

    } catch (err) {                                   // 如果请求过程中出错
      console.error('登陆错误', err)
      setResult('请求失败')
    }
  }

  return (
    <section className="auth-page">                           {/* 登录页面最外层容器 */}

      <h1>{text.loginPage}</h1>                               {/* 登录页面标题 */}

      <div className="auth-form">                             {/* 登录表单区域 */}
        <input
          type="text"
          placeholder={text.name}
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
          <button onClick={handleLogin}>
            {text.loginBtn}
          </button>

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
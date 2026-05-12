import { useState } from 'react'                  // 引入 useState，用来保存输入框内容和提示信息
import { useNavigate } from 'react-router-dom'    // 引入 useNavigate，用来进行页面跳转

const API_BASE_URL = 'http://10.30.4.139:8080'    // 后端接口基础地址

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

    /*请求后端接口，通过fetch向后端发送请求*/
    try {
      const res = await fetch(`${API_BASE_URL}/api/login`, {      // 向后端登录接口发送请求
        method: 'POST',                                           // 请求方式是 POST
        headers: { 'Content-Type': 'application/json' },          // 告诉后端发送的是 JSON 数据
        body: JSON.stringify({ username, password })              // 把用户名和密码转成 JSON 字符串发送给后端
      })

      const data = await res.json()                               //接收后端返回数据

      /*如果后端返回成功，前端创建登录对象*/
      if (res.ok && data.success === true) {                      // 判断请求是否成功，并且后端返回 success 为 true
        let profileData = {}                                      // 用来保存登录后再次获取到的用户资料

        try {
          const profileRes = await fetch(                         // 登录成功后，根据用户名再请求一次个人资料接口
            `${API_BASE_URL}/api/profile?username=${encodeURIComponent(data.username || username)}` // 防止用户名中有特殊字符，使用 encodeURIComponent 编码
          )

          if (profileRes.ok) {                                    // 如果获取个人资料成功
            profileData = await profileRes.json()                 // 把个人资料接口返回的数据保存到 profileData
          }
        } catch (profileErr) {                                    // 如果获取个人资料失败
          console.error('登录后获取头像失败:', profileErr)          // 在控制台输出错误，不影响正常登录
        }

        let avatarUrl = profileData.avatar || data.avatar || ''   // 优先使用个人资料里的头像，其次使用登录接口返回的头像，没有就为空

        if (avatarUrl && avatarUrl.startsWith('/')) {             // 如果头像地址是以 / 开头，说明是后端相对路径
          avatarUrl = `${API_BASE_URL}${avatarUrl}`               // 拼接成完整的头像访问地址
        }

        const loginUser = {                                       // 创建前端保存的登录用户对象
          username: profileData.username || data.username || username,    // 优先使用个人资料用户名，其次登录返回用户名，最后使用输入框用户名
          avatar: avatarUrl                                       // 保存处理后的头像地址
        }

        localStorage.setItem('loginUser', JSON.stringify(loginUser)) //把用户数据保存本地，即使刷新页面也不会退出登录状态
        setUser(loginUser)                                        //更新APP.jsx用户登录状态，导航栏按钮更新
        navigate('/')                                             // 登录成功后自动返回首页
      } else {
        setResult(data.message || '登录失败')                     // 登录失败时，显示后端返回的错误信息，没有就显示默认提示
      }
    } catch (err) {                                              // 如果请求过程中出错，比如后端没启动、地址错误、网络失败
      console.error('登陆错误', err)                              // 在控制台输出错误信息
      setResult('请求失败')                                       // 页面显示请求失败
    }
  }

  return (
    <section className="auth-page">                           {/* 登录页面最外层容器 */}

      <h1>{text.loginPage}</h1>                               {/* 登录页面标题 */}

      <div className="auth-form">                             {/* 登录表单区域 */}
        <input
          type="text"                                         // 文本输入框
          placeholder={text.username}                         // 用户名输入框提示文字
          value={username}                                    // 输入框内容绑定 username 状态
          onChange={(e) => setUsername(e.target.value)}       // 输入内容变化时，更新 username
        />

        <input
          type="password"                                     // 密码输入框，输入内容会被隐藏
          placeholder={text.password}                         // 密码输入框提示文字
          value={password}                                    // 输入框内容绑定 password 状态
          onChange={(e) => setPassword(e.target.value)}       // 输入内容变化时，更新 password
        />

        {/* ============ 按钮组=================== */}
        <div className="auth-buttons">                            {/* 登录和注册按钮的容器 */}
          <button onClick={handleLogin}>{text.loginBtn}</button>  {/* 点击后执行登录函数 */}

          <button
            type="button"                                     // 普通按钮，防止默认提交表单
            className="switch-btn"                            // 注册按钮样式
            onClick={() => navigate('/register')}             // 点击后跳转到注册页面
          >
            {text.registerBtn}                                {/* 注册按钮文字 */}
          </button>
        </div>

        <p>{result}</p>                                       {/* 显示登录结果提示信息 */}
      </div>
    </section>
  )
}

export default Login // 导出 Login 组件，供其他文件使用
import { useState } from 'react'                 // 引入 useState，用于管理状态（数据）
import { useNavigate } from 'react-router-dom'   // 引入 useNavigate，用于页面跳转
// import { fetchProfile, updateProfile } from '../api/profileApi'

function Register({ text }) {                   // Register组件接收text

  const [formData, setFormData] = useState({    // 保持注册表单数据
    username: '',                               // 用户名初始为空
    password: '',                               // 密码初始为空
    phone: '',                                  // 电话初始为空
    email: ''                                   // 邮箱初始为空
  })

  const [result, setResult] = useState('')      // 保存提示信息（成功/失败提示）

  const navigate = useNavigate()                // 创建跳转函数，用于页面切换
/*用户输入时，自动更新fromdate里的对应数据*/
  const handleChange = (e) => {                 // 输入框变化时触发
    const { name, value } = e.target            // 获取当前输入框的 name 和 value

    setFormData((prev) => ({                    // 更新表单数据
      ...prev,                                  // 保留原来的所有字段
      [name]: value                             // 根据 name 动态修改对应字段
    }))
  }

  const handleRegister = async () => {          // 点击注册按钮时执行（异步函数）

    const { username, password, phone, email } = formData   // 获取表单数据

    if (!username || !password || !phone || !email) {       // 如果有任意字段为空
      setResult(text.fillAll)                 // 显示“请填写完整信息”（多语言）
      return                                  // 终止函数，不继续执行
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/          // 邮箱格式正则表达式
    if (!emailRegex.test(email)) {                           // 如果邮箱格式不符合 xxx@xxx.xxx
      setResult(text.emailInvalid || '邮箱格式不正确')          // 显示邮箱格式错误提示
      return                                                 // 终止函数，不发送注册请求
    }

    try {
      const res = await fetch('http://10.30.4.139:8080/api/register', {  // 向后端发送请求
        method: 'POST',                         // 使用 POST 请求（提交数据）
        headers: {
          'Content-Type': 'application/json'   // 告诉后端发送的是 JSON 格式
        },
        body: JSON.stringify({                 // 将数据转成 JSON 字符串
          username,                            // 用户名
          password,                            // 密码
          phone,                               // 电话
          email                                // 邮箱
        })
      })

      const data = await res.json()            // 将返回结果解析为 JSON 对象

      if (res.ok) {                           // 如果状态码是 200（成功）
        navigate('/login')                    //注册成功跳转登录页
      } else {
        setResult(data.message || `${text.registerBtn}失败`)               // 显示失败信息
      }

    } catch (err) {                            // 捕获错误（例如后端没启动）
      console.error('注册错误:', err)           // 在控制台输出错误
      setResult('注册失败')                    // 显示错误提示（这里建议也做多语言）
    }
  }



  return (
    <section className="auth-page">            {/* 页面最外层容器 */}

      <h1>{text.registerPage}</h1>             {/* 标题（多语言） */}

      <div className="auth-form">              {/* 表单区域 */}


        <input
          name="username"                     // 对应 formData.username
          placeholder={text.name}             // 占位提示（多语言）
          value={formData.username}           // 绑定状态值
          onChange={handleChange}             // 输入时触发更新
        />

        <input
          name="password"                     // 对应 formData.password
          type="password"                     // 密码类型（隐藏输入）
          placeholder={text.password}         // 提示文字
          value={formData.password}           // 绑定数据
          onChange={handleChange}             // 输入事件
        />

        <input
          name="phone"                        // 对应 formData.phone
          placeholder={text.phone}            // 提示文字
          value={formData.phone}              // 绑定数据
          onChange={handleChange}             // 输入事件
        />

        <input
          name="email"                        // 对应 formData.email
          type="email"                        // 邮箱类型
          placeholder={text.email}            // 提示文字
          value={formData.email}              // 绑定数据
          onChange={handleChange}             // 输入事件
        />

        <div className="auth-buttons">        {/* 按钮区域 */}

          <button onClick={handleRegister}>   {/* 点击触发注册 */}
            {text.registerBtn}                {/* 按钮文字（多语言） */}
          </button>

          <button type="button"                // 普通按钮（不是提交）
            className="switch-btn"             // 样式类
            onClick={() => navigate('/login')} // 点击跳转到登录页
          >
            {text.loginBtn}                  {/* 登录按钮文字 */}
          </button>
        </div>
        <p>{result}</p>                      {/* 显示提示信息 */}
      </div>
    </section>
  )
}

export default Register                       // 导出组件
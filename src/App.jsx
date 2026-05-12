// import './App.css'   // 原来的样式（已不用）

import './styles/global.css'     // 全局样式（字体、基础设置）
import './styles/navbar.css'     // 导航栏样式
import './styles/home.css'       // 首页样式
import './styles/auth.css'       // 登录/注册样式
import './styles/profile.css'    // 个人页面样式
import './styles/match.css'      // 匹配页面样式
import './styles/chat.css'    //ChatUI
import './styles/board.css'  //BoardUI
import './styles/responsive.css' // 手机适配样式


import { useState, useEffect } from 'react'   // React状态和副作用
import { NavLink, Routes, Route } from 'react-router-dom' // 路由组件
import logo from './assets/frontend_logo.png' // logo图片
import defaultAvatar from './assets/default-avatar.png' // 默认头像

// 页面组件
import Home from './pages/Home'
import Match from './pages/Match'
import Chat from './pages/Chat'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import Board from './pages/Board'

// import { translateText } from './api/translateApi'

// 多语言文本
  import messages from './i18n/messages'


function App() {

const [lang, setLang] = useState(() => {
  return localStorage.getItem('lang') || 'zh'
})

  // ===== 当前登录用户 =====
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('loginUser')
    return savedUser ? JSON.parse(savedUser) : null 
    /* 从本地读取登录信息 */
  })
  const text = messages[lang] || messages.zh// 当前语言对应的文本

  // const [text, setText] = useState(baseText)  // 当前语言对应的文本

  // ===== 语言变化时保存 =====
  useEffect(() => {
    localStorage.setItem('lang', lang) 
  }, [lang])
 

  // ===== 退出登录 =====
  const handleLogout = () => {
    localStorage.removeItem('loginUser') // 清除本地用户
    setUser(null)                        // 清空状态
  }

  return (
    <div className="container">

      {/* ===== 导航栏 ===== */}
      <nav className="navbar">

        {/* 左边：logo */}
        <div className="logo-title">
          <img src={logo} alt="logo" className="logo-img" />
          <h2>SOUL</h2>
        </div>

        {/* 右边区域 */}
        <div className="nav-right">

          {/* 🌍 语言切换 */}
          <select
            className="lang-select"
            value={lang}
            onChange={(e) => setLang(e.target.value)} // 切换语言
          >
            <option value="zh">中文</option>
            <option value="en">English</option>
            <option value="ko">한국어</option>
            <option value="ja">日本語</option>
            <option value="fr">Français</option>
            <option value="de">Deutsch</option>
            <option value="es">Español</option>
            <option value="ar">العربية</option>
          </select>

          {/* ===== 导航菜单 ===== */}
          <div className="nav-links">
            <NavLink to="/">{text.home}</NavLink>       {/* 首页 */}
            <NavLink to="/match">{text.match}</NavLink> {/* 匹配 */}
            <NavLink to="/chat">{text.chat}</NavLink>   {/* 聊天 */}
            <NavLink to="/board">{text.board || '告示板'}</NavLink>     {/* 告示板 */}
          </div>

          {/* ===== 用户区域 ===== */}
          {user ? (
            <div className="user-box">

              {/* 头像 */}
              <NavLink to="/profile" className="profile-link">
                <img
                  src={user.avatar && user.avatar.trim() ? user.avatar : defaultAvatar}
                  /* 如果有头像用用户头像，否则用默认头像 */
                  alt="avatar"
                  className="user-avatar"
                  onError={(e) => {
                    e.target.src = defaultAvatar /* 加载失败用默认 */
                  }}
                />
              </NavLink>

              {/* 用户名 */}
              <NavLink to="/profile" className="profile-link username-link">
                {user.name || user.name}
              </NavLink>

              {/* 退出按钮 */}
              <button className="logout-btn" onClick={handleLogout}>
                {text.logout}
              </button>

            </div>
          ) : (
            <div className="auth-links">
              <NavLink to="/login">{text.login}</NavLink> {/* 未登录显示登录 */}
            </div>
          )}

        </div>
      </nav>

      {/* ===== 页面路由 ===== */}
      <Routes>
          /*根据网址前往页面 */
        <Route path="/" element={<Home text={text} />} />       {/* 首页 */}
        <Route path="/match" element={<Match text={text} user={user} />} />  {/* 匹配 */}
        <Route path="/chat" element={<Chat text={text} user={user} />} />  {/* 聊天 */}
        <Route path="/board" element={<Board />} />             {/* 告示板 */}
        <Route path="/login" element={<Login text={text} setUser={setUser} />} />  {/* 登录 */}
        <Route path="/register" element={<Register text={text} />} />  {/* 注册 */}
        <Route path="/profile" element={<Profile key={`${user?.username || 'guest'}-${lang}`} 
        text={text} 
        user={user} 
        setUser={setUser} 
        lang={lang}/>}/>  {/* 个人页面 */}</Routes>
    </div>
  )
}

export default App
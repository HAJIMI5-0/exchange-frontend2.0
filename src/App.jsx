// import './App.css'   // 原来的样式（已不用）

import './styles/global.css'
import './styles/navbar.css'
import './styles/home.css'
import './styles/auth.css'
import './styles/profile.css'
import './styles/match.css'
import './styles/chat.css'
import './styles/board.css'
import './styles/boardDetail.css'
import './styles/responsive.css'

import { useState, useEffect } from 'react'
import { NavLink, Routes, Route } from 'react-router-dom'

import logo from './assets/frontend_logo.png'
import defaultAvatar from './assets/default-avatar.png'

// 페이지 컴포넌트
import Home from './pages/Home'
import Match from './pages/Match'
import Chat from './pages/Chat'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import Board from './pages/Board'
import BoardDetail from './pages/BoardDetail'

// 다국어
import messages from './i18n/messages'

function App() {

  const [lang, setLang] = useState(() => {
    return localStorage.getItem('lang') || 'zh'
  })

  // 현재 로그인 사용자
  const [user, setUser] = useState(() => {

    const savedUser =
      localStorage.getItem('loginUser')

    return savedUser
      ? JSON.parse(savedUser)
      : null
  })

  const text =
    messages[lang] || messages.zh

  // 언어 저장
  useEffect(() => {
    localStorage.setItem('lang', lang)
  }, [lang])

  // 로그아웃
  const handleLogout = () => {

    localStorage.removeItem('loginUser')

    setUser(null)
  }

  return (

    <div className="container">

      {/* NAVBAR */}
      <nav className="navbar">

        {/* LOGO */}
        <div className="logo-title">

          <img
            src={logo}
            alt="logo"
            className="logo-img"
          />

          <h2>SOUL</h2>

        </div>

        {/* RIGHT */}
        <div className="nav-right">

          {/* LANGUAGE */}
          <select
            className="lang-select"
            value={lang}
            onChange={(e) =>
              setLang(e.target.value)
            }
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

          {/* NAVIGATION */}
          <div className="nav-links">

            <NavLink to="/">
              {text.home}
            </NavLink>

            <NavLink to="/match">
              {text.match}
            </NavLink>

            <NavLink to="/chat">
              {text.chat}
            </NavLink>

            <NavLink to="/board">
              {text.board || '告示板'}
            </NavLink>

          </div>

          {/* USER */}
          {user ? (

            <div className="user-box">

              {/* AVATAR */}
              <NavLink
                to="/profile"
                className="profile-link"
              >

                <img
                  src={
                    user.avatar &&
                    user.avatar.trim()
                      ? user.avatar
                      : defaultAvatar
                  }
                  alt="avatar"
                  className="user-avatar"
                  onError={(e) => {
                    e.target.src = defaultAvatar
                  }}
                />

              </NavLink>

              {/* USERNAME */}
              <NavLink
                to="/profile"
                className="profile-link username-link"
              >
                {user.name || user.username}
              </NavLink>

              {/* LOGOUT */}
              <button
                className="logout-btn"
                onClick={handleLogout}
              >
                {text.logout}
              </button>

            </div>

          ) : (

            <div className="auth-links">

              <NavLink to="/login">
                {text.login}
              </NavLink>

            </div>

          )}

        </div>

      </nav>

      {/* ROUTES */}
      <Routes>

        <Route
          path="/"
          element={
            <Home
              text={text}
              lang={lang}
            />
          }
        />

        <Route
          path="/match"
          element={
            <Match
              text={text}
              user={user}
              lang={lang}
            />
          }
        />

        <Route
          path="/chat"
          element={
            <Chat
              text={text}
              user={user}
            />
          }
        />

        <Route
          path="/board"
          element={<Board />}
        />

        <Route
          path="/board/:id"
          element={<BoardDetail />}
        />

        <Route
          path="/login"
          element={
            <Login
              text={text}
              setUser={setUser}
            />
          }
        />

        <Route
          path="/register"
          element={
            <Register text={text} />
          }
        />

        <Route
          path="/profile"
          element={
            <Profile
              key={`${user?.username || 'guest'}-${lang}`}
              text={text}
              user={user}
              setUser={setUser}
              lang={lang}
            />
          }
        />

      </Routes>

    </div>
  )
}

export default App
// import './App.css'   // 原来的样式（已不用）

import './styles/global.css'

import './styles/home.css'
import './styles/auth.css'
import './styles/profile.css'
import './styles/match.css'
import './styles/chat.css'
import './styles/board.css'
import './styles/boardDetail.css'
import './styles/responsive.css'
import './styles/settings.css'
import './styles/quiz.css'

import './styles/navbar.css'
import './styles/theme.css'

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
import Settings from './pages/Settings'
import Quiz from './pages/Quiz'
import QuizTest from './pages/QuizTest'
import QuizResult from './pages/QuizResult'


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

  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false)

  // 当前主题：dark 深色 / light 浅色
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark'
  })

  const text =
    messages[lang] || messages.zh

  // 언어 저장
  useEffect(() => {
    localStorage.setItem('lang', lang)
  }, [lang])

  // 主题保存 + 给页面加 data-theme 属性
  useEffect(() => {
    localStorage.setItem('theme', theme)
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  // 点击头像菜单以外的区域，关闭头像菜单
  useEffect(() => {
    if (!avatarMenuOpen) return

    const closeAvatarMenu = (e) => {
      if (!e.target.closest('.user-box')) {
        setAvatarMenuOpen(false)
      }
    }

    document.addEventListener('click', closeAvatarMenu)

    return () => {
      document.removeEventListener('click', closeAvatarMenu)
    }
  }, [avatarMenuOpen])

  // 로그아웃
  const handleLogout = () => {

    localStorage.removeItem('loginUser')

    setAvatarMenuOpen(false)

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

          {/* NAVIGATION */}
          <div className="nav-links">

            <NavLink to="/">
              {text.home}
            </NavLink>

            <NavLink to="/match">
              {text.match}
            </NavLink>

            <NavLink to="/quiz">
              {text.quiz || 'AI测试'}
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

              {/* SETTINGS OUTSIDE */}
              <NavLink
                to="/settings"
                className="profile-link settings-outside-link"
                onClick={() =>
                  setAvatarMenuOpen(false)
                }
              >
                {text.settings || '设置'}
              </NavLink>

              {/* AVATAR MENU BUTTON */}
              <button
                type="button"
                className="avatar-menu-button"
                onClick={() =>
                  setAvatarMenuOpen(!avatarMenuOpen)
                }
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

              </button>

              {/* USERNAME */}
              <span className="profile-link username-link">
                {user.name || user.username}
              </span>

              {/* AVATAR MENU */}
              {avatarMenuOpen && (

                <div className="avatar-menu">

                  <div className="avatar-menu-top">

                    <img
                      src={
                        user.avatar &&
                        user.avatar.trim()
                          ? user.avatar
                          : defaultAvatar
                      }
                      alt="avatar"
                      className="avatar-menu-img"
                      onError={(e) => {
                        e.target.src = defaultAvatar
                      }}
                    />

                    <strong>
                      {user.name || user.username}
                    </strong>

                    <span>
                      {user.email || ''}
                    </span>

                  </div>

                  <NavLink
                    to="/profile"
                    className="avatar-menu-item"
                    onClick={() =>
                      setAvatarMenuOpen(false)
                    }
                  >
                    👤 {text.profile || '个人资料'}
                  </NavLink>

                  <button
                    type="button"
                    className="avatar-menu-item avatar-menu-logout"
                    onClick={handleLogout}
                  >
                    🚪 {text.logout || '退出登录'}
                  </button>

                </div>

              )}

            </div>

          ) : (

            <div className="auth-links">

              <NavLink to="/settings">
                {text.settings || '设置'}
              </NavLink>

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
          path="/quiz"
          element={
            <Quiz
              text={text}
              user={user}
              lang={lang}
            />
          }
        />

        <Route
          path="/quiz/test"
          element={
            <QuizTest
              lang={lang}
          />
        }
       />

        <Route
         path="/quiz/result"
         element={
           <QuizResult
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

        <Route
          path="/settings"
          element={
            <Settings
              text={text}
              user={user}
              lang={lang}
              setLang={setLang}
              theme={theme}
              setTheme={setTheme}
            />
          }
        />

      </Routes>

    </div>
  )
}

export default App
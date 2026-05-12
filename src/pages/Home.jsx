import { useNavigate } from 'react-router-dom'
import '../styles/home.css'

/**
 * Home Page Component
 * Main landing page featuring the Hero section, trending skills, and AI features.
 */
function Home() {
  // Initialize navigation hook for client-side routing
  const navigate = useNavigate()

  // Mock data for trending skills showcased on the landing page
  const skills = [
    'Python',
    '한국어',
    'UI 디자인',
    '사진 촬영',
    '영상 편집',
    'AI 도구',
  ]

  // Handles programmatic redirect to the matching dashboard
  const handleMatchStart = () => {
    // Navigate to the match route defined in App.jsx
    navigate('/match')
  }

  return (
    <div className="home-container">
      {/* =====================================================
          Hero Section (Main Banner)
      ===================================================== */}
      <section className="hero">
        <h1>
          스킬 교환 플랫폼
          <span className="hero-underline"></span>
        </h1>

        <p className="hero-description">
          새로운 사람들과 스킬을 교환하며
          함께 성장해보세요.
          <br />
          언어, 디자인, 프로그래밍, 음악 등
          다양한 스킬을 자유롭게 교환할 수 있습니다.
        </p>

        {/* Action Button: Triggers the match routing logic */}
        <button className="hero-btn" onClick={handleMatchStart}>
          매칭 시작하기
        </button>
      </section>

      {/* =====================================================
          Trending Skills Grid Section
      ===================================================== */}
      <section className="skills-section">
        <h2 className="section-title">인기 스킬</h2>

        <div className="skills-grid">
          {skills.map((skill, index) => (
            <div className="skill-card" key={index}>
              <h3>{skill}</h3>
              <p>인기 스킬 교환</p>
            </div>
          ))}
        </div>
      </section>

      {/* =====================================================
          AI Feature Introduction Section
      ===================================================== */}
      <section className="ai-section">
        <h2 className="section-title">AI 스마트 매칭 시스템</h2>

        <p className="ai-desc">
          스킬 태그, 관심 분야,
          학습 목표, 활동 시간 등을 기반으로
          가장 잘 맞는 교환 파트너를
          AI가 추천합니다.
        </p>
      </section>

      {/* =====================================================
          Global Footer Container
      ===================================================== */}
      <footer className="footer">
        © 2026 Skill Exchange Platform
      </footer>
    </div>
  )
}

export default Home

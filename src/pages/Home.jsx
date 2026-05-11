import '../styles/home.css'

// Home 页面组件
function Home() {

  // 热门技能数据
  const skills = [
    'Python',
    '한국어',
    'UI 디자인',
    '사진 촬영',
    '영상 편집',
    'AI 도구',
  ]

  return (

    <div>

      {/* =====================================================
          Hero 主区域
      ===================================================== */}
      <section className="hero">

        <h1>
          스킬 교환 플랫폼
          <span></span>
        </h1>

        <p>
          새로운 사람들과 스킬을 교환하며
          함께 성장해보세요.
          <br />

          언어, 디자인, 프로그래밍, 음악 등
          다양한 스킬을 자유롭게 교환할 수 있습니다.
        </p>

        <button className="hero-btn">
          매칭 시작하기
        </button>

      </section>



      {/* =====================================================
          热门技能区域
      ===================================================== */}
      <section className="skills-section">

        <h2 className="section-title">
          인기 스킬
        </h2>

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
          AI 系统介绍
      ===================================================== */}
      <section className="ai-section">

        <h2 className="section-title">
          AI 스마트 매칭 시스템
        </h2>

        <p className="ai-desc">

          스킬 태그, 관심 분야,
          학습 목표, 활동 시간 등을 기반으로

          가장 잘 맞는 교환 파트너를
          AI가 추천합니다.

        </p>

      </section>



      {/* =====================================================
          Footer
      ===================================================== */}
      <footer className="footer">
        © 2026 Skill Exchange Platform
      </footer>

    </div>
  )
}

export default Home
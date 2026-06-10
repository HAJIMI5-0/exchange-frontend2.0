import { useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { translateText } from '../api/profileApi'
import '../styles/quizResult.css'

function getLevel(score, total) {
  const ratio = score / total

  if (ratio <= 0.25) {
    return {
      label: '入门',
      english: 'Beginner',
      color: 'level-beginner',
      badge: 'badge-beginner'
    }
  } else if (ratio <= 0.5) {
    return {
      label: '基础',
      english: 'Basic',
      color: 'level-basic',
      badge: 'badge-basic'
    }
  } else if (ratio <= 0.75) {
    return {
      label: '中级',
      english: 'Intermediate',
      color: 'level-intermediate',
      badge: 'badge-intermediate'
    }
  } else {
    return {
      label: '进阶',
      english: 'Advanced',
      color: 'level-advanced',
      badge: 'badge-advanced'
    }
  }
}

function QuizResult({ lang = 'zh' }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [t, setT] = useState({})

  const score = location.state?.score ?? 0
  const total = location.state?.total ?? 5
  const skill = location.state?.skill || '未知技能'

  const level = getLevel(score, total)
  const percentage = Math.round((score / total) * 100)
  useEffect(() => {

  const loadTranslations = async () => {

    try {

      const [
        testCompleted,
        resultDesc,
        scoreText,
        accuracy,
        skillLevel,
        yourLevel,
        retry,
        backHome,
        skillTest,

        beginner,
        basic,
        intermediate,
        advanced
      ] = await Promise.all([

        translateText('测试完成', lang),

        translateText(
          '以下是你的测试结果与技能等级评定',
          lang
        ),

        translateText('得分', lang),

        translateText('正确率', lang),

        translateText('技能等级', lang),

        translateText('你的等级', lang),

        translateText('重新测试', lang),

        translateText('返回首页', lang),

        translateText('技能测试', lang),
        translateText('入门', lang),
        translateText('基础', lang),
        translateText('中级', lang),
        translateText('进阶', lang)
      ])

      setT({
        testCompleted,
        resultDesc,
        scoreText,
        accuracy,
        skillLevel,
        yourLevel,
        retry,
        backHome,
        skillTest,
        beginner,
        basic,
        intermediate,
        advanced
      })

    } catch (err) {

      console.error(
        'QuizResult翻译失败',
        err
      )

    }
  }

  loadTranslations()

}, [lang])

  const radius = 50
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - percentage / 100)

  return (
    <main className="result-page">
      <section className="result-hero">
        <div className="result-skill-label">{skill} {t.skillTest || '技能测试'}</div>
        <h1>
          {t.testCompleted || '测试完成'}
        </h1>
        <p className="result-sub">{t.resultDesc || '以下是你的测试结果与技能等级评定'}</p>
      </section>

      <div className="result-body">

        {/* 得分 */}
        <div className="result-panel result-score-panel">
          <div className="result-section-title">
            <span>01</span>
            <h2> {t.scoreText || '得分'}</h2>
          </div>

          <div className="result-score-display">
            <div className="result-score-ring">
              <svg viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r={radius}
                  fill="none"
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth="8"
                />

                <circle
                  cx="60"
                  cy="60"
                  r={radius}
                  fill="none"
                  stroke="url(#ringGrad)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  transform="rotate(-90 60 60)"
                  className="ring-arc"
                />

                <defs>
                  <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#a855f7" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
              </svg>

              <div className="ring-inner">
                <strong>{score}</strong>
                <span>/ {total}</span>
              </div>
            </div>

            <div className="result-score-info">
              <div className="result-percentage">{percentage}%</div>
              <p className="result-percentage-label">{t.accuracy || '正确率'}</p>

              <div className={`result-level-badge ${level.badge}`}>
                <span className="level-label">{level.label}</span>
                <small className="level-english">{level.english}</small>
              </div>
            </div>
          </div>
        </div>

        {/* 等级说明 */}
        <div className="result-panel result-level-panel">
          <div className="result-section-title">
            <span>02</span>
            <h2>{t.skillLevel || '技能等级'}</h2>
          </div>

          <div className="result-level-grid">
            {[
              {
                label: t.beginner || '入门',
                english: 'Beginner',
                cls: 'level-beginner',
                range: '0 ~ 25%'
              },
              {
                label: t.basic || '基础',
                english: 'Basic',
                cls: 'level-basic',
                range: '26 ~ 50%'
              },
              {
                label: t.intermediate || '中级',
                english: 'Intermediate',
                cls: 'level-intermediate',
                range: '51 ~ 75%'
              },
              {
                label: t.advanced || '进阶',
                english: 'Advanced',
                cls: 'level-advanced',
                range: '76 ~ 100%'
              }
            ].map((lv) => (
              <div
                key={lv.label}
                className={`result-level-item ${lv.cls} ${lv.cls === level.color ? 'current' : ''}`}
              >
                <strong>{lv.label}</strong>
                <span>{lv.english}</span>
                <small>{lv.range}</small>

                {lv.cls === level.color && (
                  <div className="current-tag">{t.yourLevel || '你的等级'}</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 按钮 */}
        <div className="result-actions">
          <button
            className="result-btn-primary"
            onClick={() => navigate('/quiz')}
          >
            {t.retry || '重新测试'}
          </button>

          <button
            className="result-btn-secondary"
            onClick={() => navigate('/')}
          >
            {t.backHome || '返回首页'}
          </button>
        </div>

      </div>
    </main>
  )
}

export default QuizResult
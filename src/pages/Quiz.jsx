import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { translateText } from '../api/profileApi'
import '../styles/quiz.css'

function Quiz({ lang = 'zh' }) {
  const [skill, setSkill] = useState('')
  const [quizType, setQuizType] = useState('teach')
  const [message, setMessage] = useState('')
  const [t, setT] = useState({})

  const navigate = useNavigate()

  useEffect(() => {
    const loadTranslations = async () => {
      try {
        const [
          quizTitle,
          quizDescription,
          inputSkill,
          skillPlaceholder,
          selectPurpose,
          teachSkill,
          teachSkillDesc,
          learnSkill,
          learnSkillDesc,
          quizRules,
          rule1,
          rule2,
          rule3,
          rule4,
          rule5,
          rule6,
          beginner,
          basic,
          intermediate,
          advanced,
          startTest,
          emptySkill
        ] = await Promise.all([
          translateText('AI 技能测试', lang),
          translateText(
            'AI 会根据你输入的技能自动生成 20 道测试题。题目会从入门到高级逐渐增加难度。完成测试后系统会判断你的技能等级。',
            lang
          ),
          translateText('输入测试技能', lang),
          translateText(
            '请输入你想测试的技能，例如 Java、React、Python、UI设计',
            lang
          ),
          translateText('选择测试用途', lang),
          translateText('我会的技能', lang),
          translateText(
            '用于测试你可以教别人的技能水平',
            lang
          ),
          translateText('我想学的技能', lang),
          translateText(
            '用于判断你当前想学习技能的水平',
            lang
          ),
          translateText('测试规则', lang),
          translateText('自主完成 20 道选择题', lang),
          translateText('题目从入门到进阶排列', lang),
          translateText('每道题只有一个正确答案', lang),
          translateText('系统根据正确题数判断等级', lang),
          translateText('测试结果保存到个人资料', lang),
          translateText('匹配时可以使用测试等级', lang),
          translateText('入门 Beginner', lang),
          translateText('基础 Basic', lang),
          translateText('中级 Intermediate', lang),
          translateText('进阶 Advanced', lang),
          translateText('开始 AI 测试', lang),
          translateText('请先输入一个测试技能', lang)
        ])

        setT({
          quizTitle,
          quizDescription,
          inputSkill,
          skillPlaceholder,
          selectPurpose,
          teachSkill,
          teachSkillDesc,
          learnSkill,
          learnSkillDesc,
          quizRules,
          rule1,
          rule2,
          rule3,
          rule4,
          rule5,
          rule6,
          beginner,
          basic,
          intermediate,
          advanced,
          startTest,
          emptySkill
        })
      } catch (err) {
        console.error('Quiz翻译失败:', err)
      }
    }

    loadTranslations()
  }, [lang])

  const handleStart = () => {
    const finalSkill = skill.trim()

    if (!finalSkill) {
      setMessage(
        t.emptySkill || '请先输入一个测试技能'
      )
      return
    }

    const loginUser = JSON.parse(
      localStorage.getItem('loginUser')
    )

    navigate('/quiz/test', {
      state: {
        skill: finalSkill,
        quizType,
        questionCount: 20,
        username: loginUser?.username
      }
    })
  }
  return (
    <main className="quiz-page">
      <section className="quiz-hero">
        <h1>
          {t.quizTitle || 'AI 技能测试'}
        </h1>

        <p>
          {t.quizDescription ||
            'AI 会根据你输入的技能自动生成 20 道测试题。'}
        </p>
      </section>

      <section className="quiz-main-grid">
        {/* 技能输入 */}
        <div className="quiz-panel">
          <div className="quiz-section-title">
            <span>01</span>
            <h2>
              {t.inputSkill || '输入测试技能'}
            </h2>
          </div>

          <div className="quiz-skill-input-area">
            <input
              type="text"
              className="quiz-skill-input"
              placeholder={
                t.skillPlaceholder ||
                '请输入你想测试的技能'
              }
              value={skill}
              onChange={(e) => {
                setSkill(e.target.value)
                setMessage('')
              }}
            />
          </div>
        </div>

        {/* 用途选择 */}
        <div className="quiz-panel">
          <div className="quiz-section-title">
            <span>02</span>
            <h2>
              {t.selectPurpose || '选择测试用途'}
            </h2>
          </div>

          <div className="quiz-type-grid">
            <button
              type="button"
              className={`quiz-type-card ${
                quizType === 'teach' ? 'active' : ''
              }`}
              onClick={() => setQuizType('teach')}
            >
              <strong>
                {t.teachSkill || '我会的技能'}
              </strong>

              <p>
                {t.teachSkillDesc ||
                  '用于测试你可以教别人的技能水平'}
              </p>
            </button>

            <button
              type="button"
              className={`quiz-type-card ${
                quizType === 'learn' ? 'active' : ''
              }`}
              onClick={() => setQuizType('learn')}
            >
              <strong>
                {t.learnSkill || '我想学的技能'}
              </strong>

              <p>
                {t.learnSkillDesc ||
                  '用于判断你当前想学习技能的水平'}
              </p>
            </button>
          </div>
        </div>

        {/* 规则说明 */}
        <div className="quiz-panel quiz-rules-panel">
          <div className="quiz-section-title">
            <span>03</span>
            <h2>
              {t.quizRules || '测试规则'}
            </h2>
          </div>

          <ul className="quiz-rule-list">
            <li>{t.rule1}</li>
            <li>{t.rule2}</li>
            <li>{t.rule3}</li>
            <li>{t.rule4}</li>
            <li>{t.rule5}</li>
            <li>{t.rule6}</li>
          </ul>

          <div className="quiz-level-box">
            <div>
              <strong>0 ~ 5</strong>
              <span>{t.beginner}</span>
            </div>

            <div>
              <strong>6 ~ 10</strong>
              <span>{t.basic}</span>
            </div>

            <div>
              <strong>11 ~ 15</strong>
              <span>{t.intermediate}</span>
            </div>

            <div>
              <strong>16 ~ 20</strong>
              <span>{t.advanced}</span>
            </div>
          </div>
        </div>
      </section>

      <div className="quiz-start-area">
        <button
          type="button"
          className="quiz-primary-btn"
          onClick={handleStart}
        >
          {t.startTest || '开始 AI 测试'}
        </button>
      </div>

      {message && (
        <p className="quiz-message">
          {message}
        </p>
      )}
    </main>
  )
}

export default Quiz
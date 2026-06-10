import { useEffect, useState, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import client from '../api/client'
import { translateText } from '../api/profileApi'
import '../styles/quizTest.css'

function QuizTest({ lang = 'zh' }) {

  const location = useLocation()
  const navigate = useNavigate()
  const username = location.state?.username || ''
  const skill = location.state?.skill || ''
  const quizType = location.state?.quizType || 'teach'
  const questionCount = location.state?.questionCount || 20

  const [quizId, setQuizId] = useState(null)
  const [questions, setQuestions] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState({})

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [t, setT] = useState({})
  const startedRef = useRef(false)

  // AI翻译页面文字
  useEffect(() => {

    const loadTranslations = async () => {

      try {

        const [
          generating,
          generatingDesc,
          loadFailed,
          noSkill,
          createFailed,
          noQuestion,
          backQuiz,
          questionText,
          prevQuestion,
          nextQuestion,
          submittingText,
          submitQuiz,
          confirmSubmit,
          noQuizId,
          submitFailed
        ] = await Promise.all([

          translateText(
            '系统正在根据技能生成测试题，请稍等',
            lang
          ),

          translateText('测试加载失败', lang),

          translateText(
            '没有找到测试技能，请重新进入测试页面',
            lang
          ),

          translateText(
            '生成测试题失败，请检查后端是否启动',
            lang
          ),

          translateText('没有生成题目', lang),

          translateText('返回测试页', lang),

          translateText('题目', lang),

          translateText('上一题', lang),

          translateText('下一题', lang),

          translateText('提交中...', lang),

          translateText('提交测试', lang),

          translateText(
            '还有题目没有作答，确定要提交吗？',
            lang
          ),

          translateText('测试编号不存在', lang),

          translateText(
            '提交测试失败，请稍后再试',
            lang
          )
        ])

        setT({
          generating,
          generatingDesc,
          loadFailed,
          noSkill,
          createFailed,
          noQuestion,
          backQuiz,
          questionText,
          prevQuestion,
          nextQuestion,
          submittingText,
          submitQuiz,
          confirmSubmit,
          noQuizId,
          submitFailed
        })

      } catch (err) {

        console.error('QuizTest翻译失败', err)

      }
    }

    loadTranslations()

  }, [lang])

  useEffect(() => {

  if (startedRef.current) {
    return
  }

  startedRef.current = true

  async function startQuiz() {

    if (!skill) {

      setError(
        '没有找到测试技能，请重新进入测试页面'
      )

      setLoading(false)
      return
    }

    try {

      setLoading(true)
      setError('')

      const currentLang =
        localStorage.getItem('lang') || 'ko'

      const res = await client.post(
        '/api/quiz/start',
        {
          skill,
          quizType,
          count: questionCount,
          targetLang: currentLang,
          username
        }
      )

      setQuizId(res.data.quizId)

      setQuestions(
        res.data.questions || []
      )

    } catch (err) {

      console.error(err)

      setError(
        '生成测试题失败'
      )

    } finally {

      setLoading(false)

    }
  }

  startQuiz()

}, [
  skill,
  quizType,
  questionCount
])

  if (loading) {

    return (
      <main className="quiz-test-page">
        <div className="quiz-test-header">

          <h1>
            loading.......
          </h1>
          <br></br>
          <p>
            {t.generatingDesc ||
              '系统正在根据技能生成测试题，请稍等'}
          </p>

        </div>
      </main>
    )
  }

  if (error) {

    return (
      <main className="quiz-test-page">
        <div className="quiz-test-header">

          <h1>
            {t.loadFailed || '测试加载失败'}
          </h1>

          <p>{error}</p>

          <button
            className="quiz-btn quiz-btn-primary"
            onClick={() => navigate('/quiz')}
          >
            {t.backQuiz || '返回测试页'}
          </button>

        </div>
      </main>
    )
  }

  if (questions.length === 0) {

    return (
      <main className="quiz-test-page">
        <div className="quiz-test-header">

          <h1>
            {t.noQuestion || '没有生成题目'}
          </h1>

          <button
            className="quiz-btn quiz-btn-primary"
            onClick={() => navigate('/quiz')}
          >
            {t.backQuiz || '返回测试页'}
          </button>

        </div>
      </main>
    )
  }

  const currentQuestion =
    questions[currentIndex]

  const progress =
    ((currentIndex + 1) /
      questions.length) *
    100

  const handleSelect = (option) => {

    setAnswers({
      ...answers,
      [currentQuestion.questionId]:
        option
    })
  }

  const handleSubmit = async () => {

    if (!quizId) {

      setError(
        t.noQuizId ||
        '测试编号不存在'
      )

      return
    }

const loginUser = JSON.parse(localStorage.getItem('loginUser'))

    const submitAnswers =
      Object.entries(answers).map(
        ([questionId, answer]) => ({
          questionId:
            Number(questionId),
          answer
        })
      )

    if (
      submitAnswers.length <
      questions.length
    ) {

      const ok = window.confirm(
        t.confirmSubmit ||
          '还有题目没有作答，确定要提交吗？'
      )

      if (!ok) return
    }

    try {

      setSubmitting(true)

    const loginUser = JSON.parse(
      localStorage.getItem('loginUser')
    )

    const res = await client.post(
      '/api/quiz/submit',
      {
        quizId,
        username: loginUser?.username,
        skill,
        quizType,
        answers: submitAnswers
      }
)

        navigate(
          '/quiz/result',
          {
            state: {
              score: res.data.score,
              total: res.data.total,
              skill,
              level: res.data.level,        
              levelText: res.data.levelText,
              username: loginUser?.username,    
            }
          }
        )

    } catch (err) {

      console.error(err)

      setError(
        t.submitFailed ||
          '提交测试失败'
      )

    } finally {

      setSubmitting(false)

    }
  }

  return (
    <main className="quiz-test-page">

      <div className="quiz-test-header">

        <h1>
          {skill}
        </h1>

      </div>

      <div className="quiz-progress">

        <div className="quiz-progress-track">

          <div
            className="quiz-progress-bar"
            style={{
              width: `${progress}%`
            }}
          />

        </div>

        <p className="quiz-progress-info">

          {currentIndex + 1}
          /
          {questions.length}

        </p>

      </div>

      <div className="quiz-question-section">

        <p className="quiz-question-number">

          {t.questionText || '题目'}
          {' '}
          {currentIndex + 1}

        </p>

        <h2 className="quiz-question-title">
          {currentQuestion.question}
        </h2>

        <div className="quiz-options">

          {currentQuestion.options.map(
            (option) => (

              <button
                key={option}
                type="button"
                className={`quiz-option ${
                  answers[
                    currentQuestion.questionId
                  ] === option
                    ? 'selected'
                    : ''
                }`}
                onClick={() =>
                  handleSelect(option)
                }
              >
                {option}
              </button>

            )
          )}

        </div>

      </div>

      <div className="quiz-footer">

        <button
          type="button"
          className="quiz-btn quiz-btn-secondary"
          disabled={currentIndex === 0}
          onClick={() =>
            setCurrentIndex(
              prev => prev - 1
            )
          }
        >
          {t.prevQuestion || '上一题'}
        </button>

        {currentIndex ===
        questions.length - 1 ? (

          <button
            type="button"
            className="quiz-btn quiz-btn-primary"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting
              ? (
                t.submittingText ||
                '提交中...'
              )
              : (
                t.submitQuiz ||
                '提交测试'
              )}
          </button>

        ) : (

          <button
            type="button"
            className="quiz-btn quiz-btn-primary"
            onClick={() =>
              setCurrentIndex(
                prev => prev + 1
              )
            }
          >
            {t.nextQuestion || '下一题'}
          </button>

        )}

      </div>

    </main>
  )
}

export default QuizTest
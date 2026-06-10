import { useEffect, useMemo, useState, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import client from "../api/client"
import { translateText } from "../api/profileApi"

function BoardDetail() {
  const lang = localStorage.getItem('lang') || 'zh'
  const { id } = useParams()
  const navigate = useNavigate()

  const [post, setPost] = useState(null)
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [translations, setTranslations] = useState({})

  //  翻译工具函数
  const translate = useCallback(async (text) => {
    if (!text || typeof text !== 'string') return text
    try {
      const result = await translateText(text, lang)
      return result
    } catch (err) {
      console.error('翻译失败:', err)
      return text
    }
  }, [lang])

  const currentUser = useMemo(() => JSON.parse(localStorage.getItem("loginUser") || "null"), [])
  const currentUsername = currentUser?.username || ""
  const currentAuthor = currentUser?.name || currentUser?.username || ""

  useEffect(() => {
    const init = async () => {
      // 1. 翻译静态文本
      const staticTexts = [
        "게시글이 존재하지 않습니다.",
        "게시글을 불러오지 못했습니다.",
        "게시글 데이터가 유효하지 않습니다.",
        "댓글",
        "댓글 입력...",
        "작성",
        "삭제",
        "로그인 필요",
        "삭제 권한 없음",
        "댓글 작성 실패",
        "Loading...",
        "전체",
        "자유게시판",
        "질문게시판",
        "자료공유"
      ]
      const results = {}
      for (const text of staticTexts) {
        results[text] = await translate(text)
      }
      setTranslations({...results})

      // 2. 获取帖子和评论
      setLoading(true)
      try {
        const [postRes, commentRes] = await Promise.all([
          client.get(`/api/board/${id}`),
          client.get(`/api/comments/${id}`)
        ])
        const postData = postRes.data
        if (!postData) throw new Error("POST_NOT_FOUND")

        // 翻译帖子内容
        const [translatedTitle, translatedContent, translatedCategory] = await Promise.all([
          translate(postData.title),
          translate(postData.content),
          translate(postData.category)
        ])
        setPost({...postData, translatedTitle, translatedContent, translatedCategory})

        setComments(Array.isArray(commentRes.data) ? commentRes.data : [])
      } catch (err) {
        let errorMsg = "게시글을 불러오지 못했습니다."
        if (err.response?.status === 404 || err.message === "POST_NOT_FOUND") {
          errorMsg = "게시글이 존재하지 않습니다."
        }
        setError(errorMsg)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [id, translate])

  const handleDelete = useCallback(() => {
    if (!currentUsername) {
      alert(translations["로그인 필요"] || "로그인 필요")
      return
    }
    client.delete(`/api/board/${id}?username=${currentUsername}`)
      .then(() => navigate("/board"))
      .catch(() => alert(translations["삭제 권한 없음"] || "삭제 권한 없음"))
  }, [id, currentUsername, navigate, translations])

  const handleComment = useCallback(async () => {
    if (!newComment.trim()) return
    if (!currentUsername) {
      alert(translations["로그인 필요"] || "로그인 필요")
      return
    }
    try {
      const res = await client.post(`/api/comments/${id}`, { username: currentUsername, author: currentAuthor, content: newComment })
      setComments(prev => [...prev, res.data])
      setNewComment("")
    } catch {
      alert(translations["댓글 작성 실패"] || "댓글 작성 실패")
    }
  }, [id, currentUsername, currentAuthor, newComment, translations])

  const handleDeleteComment = useCallback(async (commentId) => {
    if (!currentUsername) {
      alert(translations["로그인 필요"] || "로그인 필요")
      return
    }
    await client.delete(`/api/comments/${commentId}?username=${currentUsername}`)
    setComments(prev => prev.filter(c => c.id !== commentId))
  }, [currentUsername, translations])

  if (loading) return <div className="board-page status-msg">{translations["Loading..."] || "Loading..."}</div>
  if (error) return <div className="board-detail-page"><div className="status-msg error">{error}</div></div>
  if (!post) return <div className="board-detail-page"><div className="status-msg error">{translations["게시글 데이터가 유효하지 않습니다."] || "게시글 데이터가 유효하지 않습니다."}</div></div>

  return (
    <div className="board-detail-page">
      <div className="detail-card">
        <div className="detail-top">
          <div className="detail-author">
            <div className="author-avatar">
              {post.avatar ? <img src={post.avatar} className="board-avatar-img" alt="" /> : (post.name || post.username)?.charAt(0)}
            </div>
            <div>
              <h4>{post.name || post.username}</h4>
              <span>{post.date}</span>
            </div>
          </div>
          <span className="post-category">{post.translatedCategory || translations[post.category] || post.category}</span>
        </div>
        <h1 className="detail-title">{post.translatedTitle || post.title}</h1>
        <div className="detail-content">{post.translatedContent || post.content}</div>
        {(currentUsername === post.username || currentUser?.role === "ADMIN") && (
          <button className="delete-btn" onClick={handleDelete}>Delete Post</button>
        )}
      </div>

      <div className="comment-section">
        <h3>{translations["댓글"] || "댓글"} ({comments.length})</h3>
        <div className="comment-write">
          <textarea
            placeholder={translations["댓글 입력..."] || "댓글 입력..."}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <button className="write-btn" onClick={handleComment}>
            {translations["작성"] || "작성"}
          </button>
        </div>
        <div className="comment-list">
          {comments.map(comment => (
            <div key={comment.id} className="comment-item">
              <div className="author-avatar small-avatar">
                {comment.avatar ? <img src={comment.avatar} className="board-avatar-img" alt="" /> : (comment.name || comment.username)?.charAt(0)}
              </div>
              <div style={{ flex: 1 }}>
                <strong>{comment.name || comment.username}</strong>
                <p>{comment.content}</p>
              </div>
              {(currentUsername === comment.username || currentUser?.role === "ADMIN") && (
                <button className="delete-btn" onClick={() => handleDeleteComment(comment.id)}>
                  {translations["삭제"] || "삭제"}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default BoardDetail
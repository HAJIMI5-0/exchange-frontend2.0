import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import client from "../api/client"

function BoardDetail() {

  const { id } = useParams()
  const navigate = useNavigate()

  const [post, setPost] = useState(null)

  const [comments, setComments] = useState([])

  const [newComment, setNewComment] = useState("")

  const currentUser =
    JSON.parse(localStorage.getItem("loginUser"))

  // 로그인 사용자 이름 통합
  const currentUsername =
    currentUser?.username ||
    currentUser?.name ||
    ""

  // =========================
  // 게시글 조회
  // =========================
  useEffect(() => {

    client.get(`/api/board/${id}`)

      .then((res) => {
        setPost(res.data)
      })

      .catch((err) => {
        console.log(err)
      })

  }, [id])

  // =========================
  // 댓글 조회
  // =========================
  useEffect(() => {

    client.get(`/api/comments/${id}`)

      .then((res) => {
        setComments(res.data)
      })

      .catch((err) => {
        console.log(err)
      })

  }, [id])

  // =========================
  // 게시글 삭제
  // =========================
  const handleDelete = () => {

    client.delete(
      `/api/board/${id}?author=${currentUsername}`
    )

      .then(() => {
        navigate("/board")
      })

      .catch((err) => {
        alert(
          err.response?.data?.message ||
          "삭제 권한 없음"
        )
      })
  }

  // =========================
  // 댓글 작성
  // =========================
  const handleComment = () => {

    if (!newComment.trim()) return

    client.post(
      `/api/comments/${id}`,
      {
        author: currentUsername,
        content: newComment
      }
    )

      .then((res) => {

        setComments([
          ...comments,
          res.data
        ])

        setNewComment("")

      })

      .catch((err) => {
        console.log(err)
      })
  }

  // =========================
  // 댓글 삭제
  // =========================
  const handleDeleteComment = (commentId) => {

    client.delete(`/api/comments/${commentId}`)

      .then(() => {

        setComments(
          comments.filter(
            (comment) =>
              comment.id !== commentId
          )
        )

      })

      .catch((err) => {
        console.log(err)
      })
  }

  // =========================
  // 로딩
  // =========================
  if (!post) {

    return (
      <div className="board-page">
        Loading...
      </div>
    )
  }

  return (

    <div className="board-detail-page">

      {/* 뒤로가기 */}
      <button
        className="back-btn"
        onClick={() => navigate("/board")}
      >
        ← 목록으로
      </button>

      {/* 게시글 카드 */}
      <div className="detail-card">

        {/* 상단 */}
        <div className="detail-top">

          {/* 작성자 */}
          <div className="detail-author">

            <div className="author-avatar">
              {post.author?.charAt(0)}
            </div>

            <div>

              <h4>
                {post.author}
              </h4>

              <span>
                {post.date}
              </span>

            </div>

          </div>

          {/* 카테고리 */}
          <span className="post-category">
            {post.category}
          </span>

        </div>

        {/* 제목 */}
        <h1 className="detail-title">
          {post.title}
        </h1>

        {/* 내용 */}
        <div className="detail-content">
          {post.content}
        </div>

        {/* 삭제 버튼 */}
        {currentUsername === post.author && (

          <button
            className="delete-btn"
            onClick={handleDelete}
          >
            삭제하기
          </button>

        )}

      </div>

      {/* 댓글 */}
      <div className="comment-section">

        <h3>댓글</h3>

        {/* 댓글 작성 */}
        <div className="comment-write">

          <textarea
            placeholder="댓글 입력..."
            value={newComment}
            onChange={(e) =>
              setNewComment(e.target.value)
            }
          />

          <button
            className="write-btn"
            onClick={handleComment}
          >
            작성
          </button>

        </div>

        {/* 댓글 목록 */}
        <div className="comment-list">

          {comments.map((comment) => (

            <div
              key={comment.id}
              className="comment-item"
            >

              {/* 댓글 프로필 */}
              <div className="author-avatar small-avatar">

                {comment.author?.charAt(0)}

              </div>

              {/* 댓글 내용 */}
              <div style={{ flex: 1 }}>

                <strong>
                  {comment.author}
                </strong>

                <p>
                  {comment.content}
                </p>

              </div>

              {/* 댓글 삭제 */}
              {currentUsername === comment.author && (

                <button
                  className="delete-btn"
                  style={{
                    marginTop: 0,
                    padding: "8px 12px",
                    fontSize: "13px"
                  }}
                  onClick={() =>
                    handleDeleteComment(comment.id)
                  }
                >
                  삭제
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
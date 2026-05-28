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
    JSON.parse(localStorage.getItem("loginUser") || "null")

  // 登录账号
  const currentUsername =
    currentUser?.username || ""

  // 显示名称
  const currentAuthor =
    currentUser?.name ||
    currentUser?.nickname ||
    currentUser?.username ||
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
        setComments(
          Array.isArray(res.data)
            ? res.data
            : []
        )
      })
      .catch((err) => {
        console.log(err)
      })

  }, [id])

  // =========================
  // 게시글 삭제
  // =========================
  const handleDelete = () => {

    if (!currentUsername) {

      alert("로그인 필요")

      return
    }

    client.delete(
      `/api/board/${id}?username=${currentUsername}`
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

    if (!currentUsername) {

      alert("로그인 필요")

      return
    }

    client.post(
      `/api/comments/${id}`,
      {
        username: currentUsername,
        author: currentAuthor,
        content: newComment
      }
    )
      .then((res) => {

        setComments(prev => [
          ...prev,
          res.data
        ])

        setNewComment("")
      })
      .catch((err) => {

        console.log("COMMENT ERROR:", err)

        alert("댓글 작성 실패")
      })
  }

  // =========================
  // 댓글 삭제
  // =========================
  const handleDeleteComment = (commentId) => {

    if (!currentUsername) {

      alert("로그인 필요")

      return
    }

    client.delete(
      `/api/comments/${commentId}?username=${currentUsername}`
    )
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

      {/* BACK */}
      <button
        className="back-btn"
        onClick={() => navigate("/board")}
      >
        ← 목록으로
      </button>

      {/* POST */}
      <div className="detail-card">

        <div className="detail-top">

          <div className="detail-author">

            {/* AVATAR */}
            <div className="author-avatar">

              {post.avatar ? (

                <img
                  src={post.avatar}
                  alt=""
                  className="board-avatar-img"
                />

              ) : (

                (
                  post.name ||
                  post.username
                )?.charAt(0)

              )}

            </div>

            <div>

              {/* NAME */}
              <h4>
                {post.name || post.username}
              </h4>

              <span>
                {post.date}
              </span>

            </div>

          </div>

          <span className="post-category">
            {post.category}
          </span>

        </div>

        <h1 className="detail-title">
          {post.title}
        </h1>

        <div className="detail-content">
          {post.content}
        </div>

        {/* DELETE */}
        {(
          currentUsername === post.username ||
          currentUser?.role === "ADMIN"
        ) && (

          <button
            className="delete-btn"
            onClick={handleDelete}
          >
            삭제하기
          </button>

        )}

      </div>

      {/* COMMENT */}
      <div className="comment-section">

        <h3>댓글</h3>

        {/* WRITE */}
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

        {/* LIST */}
        <div className="comment-list">

          {comments.map((comment) => (

            <div
              key={comment.id}
              className="comment-item"
            >

              {/* COMMENT AVATAR */}
              <div className="author-avatar small-avatar">

                {comment.avatar ? (

                  <img
                    src={comment.avatar}
                    alt=""
                    className="board-avatar-img"
                  />

                ) : (

                  (
                    comment.name ||
                    comment.username
                  )?.charAt(0)

                )}

              </div>

              <div style={{ flex: 1 }}>

                {/* COMMENT NAME */}
                <strong>
                  {comment.name || comment.username}
                </strong>

                <p>
                  {comment.content}
                </p>

              </div>

              {/* DELETE */}
              {(
                currentUsername === comment.username ||
                currentUser?.role === "ADMIN"
              ) && (

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
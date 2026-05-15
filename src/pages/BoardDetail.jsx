import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"

function BoardDetail() {

  const { id } = useParams()

  const navigate = useNavigate()

  const [post, setPost] = useState(null)

  const [comments, setComments] = useState([])

  const [newComment, setNewComment] = useState("")

  const currentUser =
    JSON.parse(localStorage.getItem("loginUser"))

  useEffect(() => {

    fetch(`http://10.30.4.139:8080/api/board/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setPost(data)
      })
      .catch((err) => {
        console.log(err)
      })

  }, [id])

  const handleDelete = () => {

    fetch(
      `http://10.30.4.139:8080/api/board/${id}?author=${currentUser?.username}`,
      {
        method: "DELETE"
      }
    )

      .then((res) => {

        if (!res.ok) {
          throw new Error("삭제 권한 없음")
        }

        navigate("/board")
      })

      .catch((err) => {
        alert(err.message)
      })
  }

  const handleComment = () => {

    if (!newComment.trim()) return

    const comment = {
      author: currentUser?.username,
      content: newComment
    }

    setComments([...comments, comment])

    setNewComment("")
  }

  if (!post) {
    return <div className="board-page">Loading...</div>
  }

  return (
    <div className="board-detail-page">

      <button
        className="back-btn"
        onClick={() => navigate("/board")}
      >
        ← 목록으로
      </button>

      <div className="detail-card">

        <div className="detail-top">

          <div className="detail-author">

            <div className="author-avatar">
              {post.author?.charAt(0)}
            </div>

            <div>

              <h4>{post.author}</h4>

              <span>{post.date}</span>

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

        {currentUser?.username === post.author && (

          <button
            className="delete-btn"
            onClick={handleDelete}
          >
            삭제하기
          </button>

        )}

      </div>

      <div className="comment-section">

        <h3>댓글</h3>

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

        <div className="comment-list">

          {comments.map((comment, index) => (

            <div
              key={index}
              className="comment-item"
            >

              <div className="author-avatar small-avatar">
                {comment.author?.charAt(0)}
              </div>

              <div>

                <strong>{comment.author}</strong>

                <p>{comment.content}</p>

              </div>

            </div>

          ))}

        </div>

      </div>

    </div>
  )
}

export default BoardDetail
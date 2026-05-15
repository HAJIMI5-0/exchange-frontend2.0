import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function Board() {

  const navigate = useNavigate()

  const categories = [
    "전체",
    "자유게시판",
    "질문게시판",
    "자료공유"
  ]

  const [posts, setPosts] = useState([])

  const [selectedCategory, setSelectedCategory] = useState("전체")
  const [search, setSearch] = useState("")

  const [showWriteModal, setShowWriteModal] = useState(false)

  const currentUser =
    JSON.parse(localStorage.getItem("loginUser"))

  const [newPost, setNewPost] = useState({
    category: "자유게시판",
    title: "",
    author: currentUser?.username || "",
    content: "",
    date: new Date().toISOString().split("T")[0]
  })

  useEffect(() => {

    fetch("http://10.30.4.139:8080/api/board")
      .then((res) => res.json())
      .then((data) => {
        setPosts(data)
      })
      .catch((err) => {
        console.log(err)
      })

  }, [])

  const filteredPosts = posts.filter((post) => {

    const categoryMatch =
      selectedCategory === "전체" ||
      post.category === selectedCategory

    const searchMatch =
      post.title.toLowerCase().includes(search.toLowerCase())

    return categoryMatch && searchMatch
  })

  const handleWrite = () => {

    fetch("http://10.30.4.139:8080/api/board", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(newPost)
    })

      .then((res) => res.json())

      .then((data) => {

        setPosts([data, ...posts])

        setShowWriteModal(false)

        setNewPost({
          category: "자유게시판",
          title: "",
          author: currentUser?.username || "",
          content: "",
          date: new Date().toISOString().split("T")[0]
        })

      })

      .catch((err) => {
        console.log(err)
      })
  }

  return (

    <div className="board-page">

      {/* HEADER */}
      <div className="board-header">

        <div>

          <h1>커뮤니티 게시판</h1>

          <p>
            다른 사용자들과 지식을 공유하고 소통해보세요.
          </p>

        </div>

        <button
          className="write-btn"
          onClick={() => setShowWriteModal(true)}
        >
          글쓰기
        </button>

      </div>

      {/* SEARCH */}
      <div className="board-search-area">

        <input
          type="text"
          placeholder="게시글 검색..."
          className="board-search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

      </div>

      {/* CATEGORY */}
      <div className="board-categories">

        {categories.map((category) => (

          <button
            key={category}
            className={`category-btn ${
              selectedCategory === category
                ? 'active-category'
                : ''
            }`}
            onClick={() => setSelectedCategory(category)}
          >

            {category}

          </button>

        ))}

      </div>

      {/* POSTS */}
      <div className="board-post-list">

        {filteredPosts.map((post) => (

          <div
            key={post.id}
            className="post-card"
            onClick={() => navigate(`/board/${post.id}`)}
          >

            {/* TOP */}
            <div className="post-top">

              <span className="post-category">
                {post.category}
              </span>

            </div>

            {/* TITLE */}
            <h3 className="post-title">
              {post.title}
            </h3>

            {/* CONTENT PREVIEW */}
            <p className="post-content">

              {post.content.length > 140
                ? post.content.slice(0, 140) + "..."
                : post.content}

            </p>

            {/* FOOTER */}
            <div className="post-footer">

              <div className="post-author">

                <div className="post-avatar">

                  {post.author?.charAt(0)}

                </div>

                <div className="author-info">

                  <span className="author-name">
                    {post.author}
                  </span>

                  <span className="post-date">
                    {post.date}
                  </span>

                </div>

              </div>

            </div>

          </div>

        ))}

      </div>

      {/* WRITE MODAL */}
      {showWriteModal && (

        <div
          className="modal-overlay"
          onClick={() => setShowWriteModal(false)}
        >

          <div
            className="post-modal"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="modal-top">

              <span className="post-category">
                글쓰기
              </span>

              <button
                className="close-btn"
                onClick={() => setShowWriteModal(false)}
              >
                ✕
              </button>

            </div>

            {/* CATEGORY */}
            <select
              value={newPost.category}
              onChange={(e) =>
                setNewPost({
                  ...newPost,
                  category: e.target.value
                })
              }
            >

              <option>자유게시판</option>
              <option>질문게시판</option>
              <option>자료공유</option>

            </select>

            {/* TITLE */}
            <input
              type="text"
              placeholder="제목 입력"
              value={newPost.title}
              onChange={(e) =>
                setNewPost({
                  ...newPost,
                  title: e.target.value
                })
              }
            />

            {/* CONTENT */}
            <textarea
              placeholder="내용 입력"
              value={newPost.content}
              onChange={(e) =>
                setNewPost({
                  ...newPost,
                  content: e.target.value
                })
              }
            />

            {/* WRITE BUTTON */}
            <button
              className="write-btn"
              onClick={handleWrite}
            >
              작성하기
            </button>

          </div>

        </div>

      )}

    </div>
  )
}

export default Board
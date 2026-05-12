import { useState, useEffect } from 'react'

function Board() {

  const categories = [
    "전체",
    "자유게시판",
    "질문게시판",
    "자료공유"
  ]

  const [posts, setPosts] = useState([])

  const [selectedCategory, setSelectedCategory] = useState("전체")
  const [search, setSearch] = useState("")
  const [selectedPost, setSelectedPost] = useState(null)

  const [showWriteModal, setShowWriteModal] = useState(false)

  const [newPost, setNewPost] = useState({
    category: "자유게시판",
    title: "",
    author: "",
    content: "",
    views: 0,
    date: new Date().toISOString().split("T")[0]
  })

  useEffect(() => {

    fetch("http://localhost:8080/api/board")
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

    fetch("http://localhost:8080/api/board", {
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
          author: "",
          content: "",
          views: 0,
          date: new Date().toISOString().split("T")[0]
        })

      })

      .catch((err) => {
        console.log(err)
      })
  }

  return (
    <div className="board-page">

      <div className="board-header">

        <div>
          <h1>커뮤니티 게시판</h1>
          <p>다른 사용자들과 지식을 공유하고 소통해보세요.</p>
        </div>

        <button
          className="write-btn"
          onClick={() => setShowWriteModal(true)}
        >
          글쓰기
        </button>

      </div>

      <div className="board-search-area">

        <input
          type="text"
          placeholder="게시글 검색..."
          className="board-search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

      </div>

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

      <div className="board-post-list">

        {filteredPosts.map((post) => (

          <div
            key={post.id}
            className="post-card"
            onClick={() => setSelectedPost(post)}
          >

            <div className="post-top">

              <span className="post-category">
                {post.category}
              </span>

              <span className="post-views">
                👁 {post.views}
              </span>

            </div>

            <h3 className="post-title">
              {post.title}
            </h3>

            <p className="post-content">
              {post.content}
            </p>

            <div className="post-footer">

              <span>{post.author}</span>

              <span>{post.date}</span>

            </div>

          </div>

        ))}

      </div>

      {selectedPost && (

        <div
          className="modal-overlay"
          onClick={() => setSelectedPost(null)}
        >

          <div
            className="post-modal"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="modal-top">

              <span className="post-category">
                {selectedPost.category}
              </span>

              <button
                className="close-btn"
                onClick={() => setSelectedPost(null)}
              >
                ✕
              </button>

            </div>

            <h2>{selectedPost.title}</h2>

            <div className="modal-info">

              <span>{selectedPost.author}</span>

              <span>{selectedPost.date}</span>

              <span>👁 {selectedPost.views}</span>

            </div>

            <p className="modal-content">
              {selectedPost.content}
            </p>

          </div>

        </div>

      )}

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

            <input
              type="text"
              placeholder="작성자 입력"
              value={newPost.author}
              onChange={(e) =>
                setNewPost({
                  ...newPost,
                  author: e.target.value
                })
              }
            />

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
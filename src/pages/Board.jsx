import { useState } from 'react'

function Board() {

  const categories = [
    "전체",
    "자유게시판",
    "질문게시판",
    "자료공유"
  ]

  const posts = [
    {
      id: 1,
      category: "자유게시판",
      title: "리액트 스터디 파트너를 찾고 있습니다",
      author: "Alex",
      date: "2026-05-07",
      views: 124,
      content: "프론트엔드 기술을 함께 교환하며 공부할 사람을 찾고 있습니다."
    },

    {
      id: 2,
      category: "질문게시판",
      title: "Spring Boot API는 어떻게 사용하나요?",
      author: "Sophia",
      date: "2026-05-06",
      views: 89,
      content: "백엔드 API 연결 방법에 대해 도움이 필요합니다."
    },

    {
      id: 3,
      category: "자료공유",
      title: "무료 JavaScript PDF 학습 자료 공유",
      author: "Daniel",
      date: "2026-05-05",
      views: 201,
      content: "유용한 JavaScript 학습 자료를 공유합니다."
    }
  ]

  const [selectedCategory, setSelectedCategory] = useState("전체")
  const [search, setSearch] = useState("")
  const [selectedPost, setSelectedPost] = useState(null)

  const filteredPosts = posts.filter((post) => {

    const categoryMatch =
      selectedCategory === "전체" ||
      post.category === selectedCategory

    const searchMatch =
      post.title.toLowerCase().includes(search.toLowerCase())

    return categoryMatch && searchMatch
  })

  return (
    <div className="board-page">

      {/* ===== Header ===== */}
      <div className="board-header">

        <div>
          <h1>커뮤니티 게시판</h1>
          <p>다른 사용자들과 지식을 공유하고 소통해보세요.</p>
        </div>

        <button className="write-btn">
          글쓰기
        </button>

      </div>

      {/* ===== Search ===== */}
      <div className="board-search-area">

        <input
          type="text"
          placeholder="게시글 검색..."
          className="board-search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

      </div>

      {/* ===== Categories ===== */}
      <div className="board-categories">

        {categories.map((category) => (

          <button
            key={category}
            className={`category-btn ${
              selectedCategory === category ? 'active-category' : ''
            }`}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>

        ))}

      </div>

      {/* ===== Post List ===== */}
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

      {/* ===== Post Detail Modal ===== */}

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

    </div>
  )
}

export default Board
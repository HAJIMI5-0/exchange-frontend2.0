import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import client from '../api/client'

function Board() {

  const navigate = useNavigate()

  const categories = [
    '전체',
    '자유게시판',
    '질문게시판',
    '자료공유'
  ]

  const [posts, setPosts] = useState([])

  const [selectedCategory, setSelectedCategory] =
    useState('전체')

  const [search, setSearch] = useState('')

  const [showWriteModal, setShowWriteModal] =
    useState(false)

  const currentUser =
    JSON.parse(localStorage.getItem('loginUser') || 'null')

  const currentUsername =
    currentUser?.username || ''

  // =========================
  // 新建帖子
  // =========================
  const [newPost, setNewPost] = useState({
    category: '자유게시판',
    title: '',
    content: ''
  })

  // =========================
  // 获取帖子列表
  // =========================
  useEffect(() => {

    client.get('/api/board')
      .then((res) => {

        setPosts(
          Array.isArray(res.data)
            ? res.data
            : []
        )
      })
      .catch((err) => {

        console.log(err)

        setPosts([])
      })

  }, [])

  // =========================
  // 分类 + 搜索过滤
  // =========================
  const filteredPosts = posts.filter((post) => {

    const categoryMatch =
      selectedCategory === '전체' ||
      post.category === selectedCategory

    const searchMatch =
      post.title
        ?.toLowerCase()
        .includes(search.toLowerCase())

    return categoryMatch && searchMatch
  })

  // =========================
  // 发帖
  // =========================
  const handleWrite = () => {

    if (!currentUsername) {

      alert('로그인 필요')

      return
    }

    if (
      !newPost.title.trim() ||
      !newPost.content.trim()
    ) {

      alert('제목과 내용을 입력하세요.')

      return
    }

    client.post('/api/board', {
      ...newPost,
      username: currentUsername
    })
      .then((res) => {

        setPosts(prev => [
          res.data,
          ...prev
        ])

        setShowWriteModal(false)

        setNewPost({
          category: '자유게시판',
          title: '',
          content: ''
        })
      })
      .catch((err) => {

        console.log(err)

        alert('게시글 작성 실패')
      })
  }

  return (

    <div className="board-page">

      {/* HEADER */}
      <div className="board-header">

        <div>

          <h1>
            커뮤니티 게시판
          </h1>

          <p>
            다른 사용자들과 지식을 공유하고 소통해보세요.
          </p>

        </div>

        <button
          className="write-btn"
          onClick={() =>
            setShowWriteModal(true)
          }
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
          onChange={(e) =>
            setSearch(e.target.value)
          }
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
            onClick={() =>
              setSelectedCategory(category)
            }
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
            onClick={() =>
              navigate(`/board/${post.id}`)
            }
          >

            <div className="post-top">

              <span className="post-category">
                {post.category}
              </span>

            </div>

            <h3 className="post-title">
              {post.title}
            </h3>

            <p className="post-content">

              {post.content?.length > 140
                ? post.content.slice(0, 140) + '...'
                : post.content}

            </p>

            <div className="post-footer">

              <div className="post-author">

                {/* AVATAR */}
                <div className="post-avatar">

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

                <div className="author-info">

                  {/* NAME */}
                  <span className="author-name">

                    {post.name || post.username}

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
          onClick={() =>
            setShowWriteModal(false)
          }
        >

          <div
            className="post-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="modal-top">

              <span className="post-category">
                글쓰기
              </span>

              <button
                className="close-btn"
                onClick={() =>
                  setShowWriteModal(false)
                }
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

              <option>
                자유게시판
              </option>

              <option>
                질문게시판
              </option>

              <option>
                자료공유
              </option>

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

            {/* BUTTON */}
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
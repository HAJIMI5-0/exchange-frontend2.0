import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import client from '../api/client'
import { translateText } from '../api/profileApi'

const CATEGORIES = ['전체', '자유게시판', '질문게시판', '자료공유']
const SORT_OPTIONS = [
  { value: 'latest',   label: '최신순' },
  { value: 'likes',    label: '좋아요순' },
  { value: 'comments', label: '댓글순' },
]
const TITLE_MAX   = 50
const CONTENT_MAX = 1000
const INITIAL_NEW_POST = { category: '자유게시판', title: '', content: '', tags: [] }

function useDebouncedValue(value, delay = 300) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

function useScrollTop(threshold = 400) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > threshold)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [threshold])
  return visible
}

const PostCard = ({ post, onClick, translations }) => {
  const displayName = post.name || post.username
  const preview = post.content?.length > 140
    ? post.content.slice(0, 140) + '...'
    : post.content

  return (
    <div className="post-card" onClick={onClick}>
      <div className="post-top">
        <span className="post-category">
          {translations[post.category] || post.category}
        </span>
        {post.tags?.map(tag => (
          <span key={tag} className="post-tag">#{tag}</span>
        ))}
      </div>

      <h3 className="post-title">{post.translatedTitle || post.title}</h3>
      <p className="post-content">{post.translatedPreview || preview}</p>

      <div className="post-footer">
        <div className="post-author">
          <div className="post-avatar">
            {post.avatar
              ? <img src={post.avatar} alt="" className="board-avatar-img" />
              : displayName?.charAt(0)
            }
          </div>
          <div className="author-info">
            <span className="author-name">{displayName}</span>
            <span className="post-date">{post.date}</span>
          </div>
        </div>

        <div className="post-stats">
          <span className="comment-count">💬 {post.commentCount ?? 0}</span>
        </div>
      </div>
    </div>
  )
}

const WriteModal = ({ onClose, onSubmit, translations }) => {
  const [newPost, setNewPost]   = useState(INITIAL_NEW_POST)
  const [tagInput, setTagInput] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (field) => (e) =>
    setNewPost(prev => ({ ...prev, [field]: e.target.value }))

  const addTag = () => {
    const tag = tagInput.trim()
    if (!tag || newPost.tags.includes(tag) || newPost.tags.length >= 5) return
    setNewPost(prev => ({ ...prev, tags: [...prev.tags, tag] }))
    setTagInput('')
  }

  const removeTag = (tag) =>
    setNewPost(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }))

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); addTag() }
  }

  const handleSubmit = useCallback(async () => {
    if (!newPost.title.trim() || !newPost.content.trim()) {
      alert(translations['제목과 내용을 입력하세요.'] || '제목과 내용을 입력하세요.')
      return
    }
    setSubmitting(true)
    try {
      await onSubmit(newPost)
    } finally {
      setSubmitting(false)
    }
  }, [newPost, onSubmit, translations])

  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') handleSubmit()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [handleSubmit])

  const titleLeft   = TITLE_MAX   - newPost.title.length
  const contentLeft = CONTENT_MAX - newPost.content.length

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="post-modal" onClick={(e) => e.stopPropagation()}>

        <div className="modal-top">
          <span className="post-category">{translations['글쓰기'] || '글쓰기'}</span>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <select
          value={newPost.category}
          onChange={handleChange('category')}
        >
          {CATEGORIES.filter(c => c !== '전체').map(c => (
            <option key={c} value={c}>
              {translations[c] || c}
            </option>
          ))}
        </select>

        <div className="input-wrapper">
          <input
            type="text"
            placeholder={translations['제목 입력'] || '제목 입력'}
            maxLength={TITLE_MAX}
            value={newPost.title}
            onChange={handleChange('title')}
          />
          <span className={`char-count ${titleLeft <= 5 ? 'char-warn' : ''}`}>
            {titleLeft}
          </span>
        </div>

        <div className="input-wrapper">
          <textarea
            placeholder={translations['내용 입력 (Ctrl+Enter로 제출)'] || '내용 입력 (Ctrl+Enter로 제출)'}
            maxLength={CONTENT_MAX}
            value={newPost.content}
            onChange={handleChange('content')}
          />
          <span className={`char-count ${contentLeft <= 50 ? 'char-warn' : ''}`}>
            {contentLeft}
          </span>
        </div>

        <div className="tag-input-area">
          <input
            type="text"
            placeholder={translations['태그 입력 후 Enter (최대 5개)'] || '태그 입력 후 Enter (최대 5개)'}
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
          />
          <div className="tag-list">
            {newPost.tags.map(tag => (
              <span key={tag} className="tag-chip">
                #{tag}
                <button onClick={() => removeTag(tag)}>×</button>
              </span>
            ))}
          </div>
        </div>

        <button
          className="write-btn"
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting 
            ? (translations['작성 중...'] || '작성 중...') 
            : (translations['작성하기'] || '작성하기')
          }
        </button>

      </div>
    </div>
  )
}

function Board() {
  const navigate = useNavigate()
  const lang = localStorage.getItem('lang') || 'zh'

  const [posts, setPosts]                     = useState([])
  const [selectedCategory, setSelectedCategory] = useState('전체')
  const [search, setSearch]                   = useState('')
  const [sortBy, setSortBy]                   = useState('latest')
  const [showWriteModal, setShowWriteModal]   = useState(false)
  const [loading, setLoading]                 = useState(true)
  const [error, setError]                     = useState(null)
  const [translations, setTranslations]       = useState({})

  const debouncedSearch = useDebouncedValue(search, 300)
  const showScrollTop   = useScrollTop(400)

  // 翻译工具函数（直接调用接口，不缓存）
  const translate = useCallback(async (text) => {
    if (!text || typeof text !== 'string') return text
    console.log(' 正在翻译:', text, '目标语言:', lang)
    try {
      const result = await translateText(text, lang)
      console.log(' 翻译成功:', text, '→', result)
      return result
    } catch (err) {
      console.error('翻译失败:', err)
      return text
    }
  }, [lang])

  const currentUsername = useMemo(() => {
    const user = JSON.parse(localStorage.getItem('loginUser') || 'null')
    return user?.username || ''
  }, [])

  //  强制翻译并更新状态
  useEffect(() => {
    const init = async () => {
      // 1. 翻译静态文本
      const staticTexts = [
        '전체', '자유게시판', '질문게시판', '자료공유',
        '최신순', '좋아요순', '댓글순',
        '커뮤니티 게시판',
        '다른 사용자들과 지식을 공유하고 소통해보세요.',
        '글쓰기',
        '게시글 검색...',
        '로딩 중...',
        '게시글을 불러오지 못했습니다.',
        '게시글이 없습니다.',
        '로그인 필요',
        '제목과 내용을 입력하세요.',
        '제목 입력',
        '내용 입력 (Ctrl+Enter로 제출)',
        '태그 입력 후 Enter (최대 5개)',
        '작성 중...',
        '작성하기',
        '맨 위로'
      ]
      const results = {}
      for (const text of staticTexts) {
        results[text] = await translate(text)
      }
      // 强制更新状态（创建新对象触发渲染）
      setTranslations({...results})

      // 2. 获取并翻译帖子
      setLoading(true)
      try {
        const res = await client.get('/api/board')
        const rawPosts = Array.isArray(res.data) ? res.data : []
        const translatedPosts = await Promise.all(rawPosts.map(async (post) => {
          const preview = post.content?.length > 140 ? post.content.slice(0, 140) + '...' : post.content
          const [translatedTitle, translatedPreview] = await Promise.all([
            translate(post.title),
            translate(preview)
          ])
          return { ...post, translatedTitle, translatedPreview }
        }))
        //  强制更新状态（创建新数组触发渲染）
        setPosts([...translatedPosts])
      } catch (err) {
        console.error(err)
        setError('게시글을 불러오지 못했습니다.')
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [translate])

  const displayedPosts = useMemo(() => {
    const lowerSearch = debouncedSearch.toLowerCase()
    const filtered = posts.filter((post) => {
      const categoryMatch = selectedCategory === '전체' || post.category === selectedCategory
      const searchMatch = post.title?.toLowerCase().includes(lowerSearch) || post.translatedTitle?.toLowerCase().includes(lowerSearch)
      return categoryMatch && searchMatch
    })
    return [...filtered].sort((a, b) => {
      if (sortBy === 'likes') return (b.likes ?? 0) - (a.likes ?? 0)
      if (sortBy === 'comments') return (b.commentCount ?? 0) - (a.commentCount ?? 0)
      return new Date(b.date) - new Date(a.date)
    })
  }, [posts, selectedCategory, debouncedSearch, sortBy])

  const handleWrite = useCallback(async (newPost) => {
    if (!currentUsername) {
      alert(translations['로그인 필요'] || '로그인 필요')
      return
    }
    const res = await client.post('/api/board', { ...newPost, username: currentUsername })
    const translatedNewPost = {
      ...res.data,
      translatedTitle: await translate(res.data.title),
      translatedPreview: res.data.content?.length > 140 ? await translate(res.data.content.slice(0, 140) + '...') : await translate(res.data.content)
    }
    setPosts(prev => [translatedNewPost, ...prev])
    setShowWriteModal(false)
  }, [currentUsername, translate, translations])

  const handleNavigate = useCallback((id) => navigate(`/board/${id}`), [navigate])

  return (
    <div className="board-page">
      <div className="board-header">
        <div>
          <h1>{translations['커뮤니티 게시판'] || '커뮤니티 게시판'}</h1>
          <p>{translations['다른 사용자들과 지식을 공유하고 소통해보세요.'] || '다른 사용자들과 지식을 공유하고 소통해보세요.'}</p>
        </div>
        <button className="write-btn" onClick={() => setShowWriteModal(true)}>
          {translations['글쓰기'] || '글쓰기'}
        </button>
      </div>

      <div className="board-search-area">
        <input
          type="text"
          placeholder={translations['게시글 검색...'] || '게시글 검색...'}
          className="board-search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="board-toolbar">
        <div className="board-categories">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              className={`category-btn ${selectedCategory === category ? 'active-category' : ''}`}
              onClick={() => setSelectedCategory(category)}
            >
              {translations[category] || category}
            </button>
          ))}
        </div>

        <select
          className="sort-select"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          {SORT_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>
              {translations[opt.label] || opt.label}
            </option>
          ))}
        </select>
      </div>

      {loading && <p className="status-msg">{translations['로딩 중...'] || '로딩 중...'}</p>}
      {error && <p className="status-msg error">{error}</p>}

      {!loading && !error && (
        <div className="board-post-list">
          {displayedPosts.length === 0
            ? <p className="empty-msg">{translations['게시글이 없습니다.'] || '게시글이 없습니다.'}</p>
            : displayedPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onClick={() => handleNavigate(post.id)}
                translations={translations}
              />
            ))
          }
        </div>
      )}

      {showScrollTop && (
        <button
          className="scroll-top-btn"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label={translations['맨 위로'] || '맨 위로'}
        >
          ↑
        </button>
      )}

      {showWriteModal && (
        <WriteModal
          onClose={() => setShowWriteModal(false)}
          onSubmit={handleWrite}
          translations={translations}
        />
      )}
    </div>
  )
}

export default Board
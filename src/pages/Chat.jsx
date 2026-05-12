import { useEffect, useMemo, useRef, useState } from 'react' // 从 React 导入需要使用的 Hook，包括副作用、缓存、DOM引用、状态管理

const API_BASE = 'http://10.30.4.139:8080' // 定义后端服务器基础地址，所有接口请求都通过这个地址发送
const AI_PREFIX = '🤖 AI 학습 도움' // 定义 AI 消息前缀，用来区分普通聊天消息和 AI 自动生成消息
const TIME_GAP = 300000 // 定义消息时间分组间隔，单位毫秒，这里是 5 分钟

function Chat({ text }) { // 定义聊天组件，接收父组件传来的 text 多语言文本对象
  const currentUser = useMemo(() => { // 使用 useMemo 缓存当前登录用户信息，避免重复解析 localStorage
    try { // 尝试读取本地缓存
      return JSON.parse(localStorage.getItem('loginUser') || '{}') // 从 localStorage 获取 loginUser，没有则返回空对象字符串再解析
    } catch { // 如果 JSON 解析失败
      return {} // 返回空对象避免程序报错
    }
  }, []) // 空依赖数组，只在组件首次渲染时执行一次

  const currentUsername = currentUser?.username || '' // 获取当前用户名，如果不存在则使用空字符串
  const currentLang = localStorage.getItem('lang') || 'ko' // 获取当前选择的语言，如果没有则默认韩语

  const [rooms, setRooms] = useState([]) // 保存聊天室列表数据
  const [selectedRoom, setSelectedRoom] = useState(null) // 保存当前选中的聊天室
  const [messages, setMessages] = useState([]) // 保存当前聊天室的消息列表
  const [newMessage, setNewMessage] = useState('') // 保存输入框中正在输入的新消息
  const [isAiLoading, setIsAiLoading] = useState(false) // 标记 AI 是否正在生成回复
  const [translatedMessages, setTranslatedMessages] = useState({}) // 保存已经翻译过的消息，key 为消息 id
  const [aiError, setAiError] = useState('') // 保存 AI 错误提示文本

  const messagesEndRef = useRef(null) // 创建 DOM 引用，用于滚动到底部定位最后一条消息

  const scrollToBottom = () => // 定义滚动到底部函数
    requestAnimationFrame(() => // 等浏览器下一帧渲染完成后执行
      messagesEndRef.current?.scrollIntoView({ // 如果底部元素存在则滚动到该元素
        behavior: 'smooth' // 使用平滑滚动动画
      })
    )

  const detectLanguage = (text) => { // 定义简单语言检测函数，根据字符判断文本属于哪种语言
    if (!text) return 'en' // 如果文本为空则默认英语
    if (/[\uac00-\ud7af]/.test(text)) return 'ko' // 如果包含韩文字符则返回韩语
    if (/[\u4e00-\u9fff]/.test(text)) return 'zh' // 如果包含中文字符则返回中文
    if (/[\u3040-\u30ff]/.test(text)) return 'ja' // 如果包含日文字符则返回日语
    if (/[\u0600-\u06FF]/.test(text)) return 'ar' // 如果包含阿拉伯字符则返回阿拉伯语
    return 'en' // 其他情况默认英语
  }

  const translateText = async (content) => { // 定义翻译函数，将文本翻译成当前用户选择的语言
    if (!content || detectLanguage(content) === currentLang) return null // 如果内容为空或已经是当前语言则不翻译

    try { // 尝试调用翻译接口
      const res = await fetch(`${API_BASE}/api/translate`, { // 向后端翻译接口发送请求
        method: 'POST', // 使用 POST 请求方式
        headers: { // 设置请求头
          'Content-Type': 'application/json' // 告诉后端发送的是 JSON 数据
        },
        body: JSON.stringify({ // 将请求体对象转换为 JSON 字符串
          text: content, // 要翻译的原始文本
          targetLang: currentLang // 翻译目标语言
        })
      })

      if (!res.ok) return null // 如果请求失败则返回 null

      const translated = await res.text() // 获取翻译结果文本

      return translated && // 判断翻译结果是否存在
        translated.trim() && // 判断翻译结果是否非空
        translated !== content // 判断翻译结果是否与原文不同
        ? translated // 如果满足条件返回翻译结果
        : null // 否则返回 null
    } catch { // 捕获请求异常
      return null // 翻译失败返回 null
    }
  }

  const formatWeChatTime = (timeStr) => { // 定义时间格式化函数，模仿微信聊天时间显示格式
    if (!timeStr) return '' // 如果时间为空则返回空字符串

    try { // 尝试解析时间
      const date = new Date(timeStr) // 将时间字符串转换为 Date 对象
      if (isNaN(date.getTime())) return '' // 如果转换失败则返回空字符串

      const now = new Date() // 获取当前时间
      let hours = date.getHours() // 获取小时数
      const minutes = String(date.getMinutes()).padStart(2, '0') // 获取分钟并补足两位
      const ampm = hours >= 12 ? '오후' : '오전' // 判断上午还是下午（韩文显示）

      hours = hours % 12 || 12 // 将 24 小时制转换为 12 小时制

      const time = `${ampm} ${hours}:${minutes}` // 拼接时间文本

      if (date.toDateString() === now.toDateString()) { // 如果消息是今天发送的
        return `오늘 ${time}` // 返回 今天 + 时间
      }

      const yesterday = new Date(now) // 创建昨天时间对象
      yesterday.setDate(now.getDate() - 1) // 当前日期减一天

      if (date.toDateString() === yesterday.toDateString()) { // 如果消息是昨天发送的
        return `어제 ${time}` // 返回 昨天 + 时间
      }

      if (date.getFullYear() === now.getFullYear()) { // 如果消息是今年发送的
        return `${date.getMonth() + 1}월 ${date.getDate()}일 ${time}` // 返回 月日 + 时间
      }

      return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 ${time}` // 如果不是今年则显示完整年月日
    } catch { // 捕获时间解析异常
      return '' // 返回空字符串
    }
  }

  const fetchRooms = async () => { // 定义获取聊天室列表函数
    try { // 尝试请求后端聊天室接口
      const res = await fetch( // 发起网络请求
        `${API_BASE}/api/chat/rooms?username=${currentUsername}` // 根据当前用户名获取该用户所有聊天室
      )

      if (!res.ok) { // 如果 HTTP 请求状态不是成功
        setRooms([]) // 清空聊天室列表
        return // 结束函数执行
      }

      const data = await res.json() // 将返回结果解析为 JSON 数据

      if (!Array.isArray(data)) { // 如果返回的数据不是数组
        setRooms([]) // 清空聊天室列表防止报错
        return // 停止执行
      }

      setRooms(data) // 将聊天室数据保存到 rooms 状态中

      if (!selectedRoom && data.length) { // 如果当前没有选中的聊天室并且返回数据不为空
        setSelectedRoom(data[0]) // 自动选择第一个聊天室
        scrollToBottom() // 滚动到底部
        return // 结束函数
      }

      if ( // 判断当前已选聊天室是否还存在
        selectedRoom && // 当前确实有选中的聊天室
        !data.find(room => room.roomId === selectedRoom.roomId) && // 新聊天室列表中找不到当前选中的聊天室
        data.length // 并且聊天室列表不为空
      ) {
        setSelectedRoom(data[0]) // 自动切换到第一个聊天室
        scrollToBottom() // 滚动到底部
      }
    } catch { // 捕获请求异常
      setRooms([]) // 请求失败时清空聊天室列表
    }
  }

  const fetchMessages = async (scroll = false) => { // 定义获取聊天消息函数，scroll 参数决定是否拉取后自动滚动
    if (!selectedRoom) return // 如果当前没有选中的聊天室则直接结束

    try { // 尝试请求聊天消息接口
      const res = await fetch( // 发起网络请求
        `${API_BASE}/api/chat/messages?me=${currentUsername}&partner=${selectedRoom.partnerUsername}` // 根据当前用户和聊天对象获取聊天记录
      )

      if (!res.ok) return // 如果请求失败则直接结束

      const data = await res.json() // 将返回数据解析为 JSON

      if (!Array.isArray(data)) return // 如果返回结果不是数组则结束

      setMessages(prev => { // 更新消息状态，使用函数式写法避免状态竞争
        if ( // 判断消息是否真的发生变化
          prev.length === data.length && // 消息数量一致
          prev[prev.length - 1]?.id === data[data.length - 1]?.id // 最后一条消息 id 一致
        ) {
          return prev // 如果没变化则直接返回旧数据避免重复渲染
        }

        return data // 如果有变化则更新为新消息列表
      })

      if (scroll) scrollToBottom() // 如果要求滚动则自动滚到底部
    } catch {} // 捕获异常但不处理，避免影响界面
  }

  const autoTranslateMessages = async () => { // 定义自动翻译消息函数
    const cache = {} // 创建临时翻译缓存对象

    for (const msg of messages) { // 遍历所有消息
      if (msg.content?.startsWith(AI_PREFIX)) continue // 如果是 AI 消息则跳过，因为 AI 消息已经单独处理翻译

      if (translatedMessages[msg.id]) { // 如果当前消息已经有翻译缓存
        cache[msg.id] = translatedMessages[msg.id] // 直接复用已有翻译
        continue // 跳过本次翻译
      }

      const translated = await translateText(msg.content) // 调用翻译函数翻译当前消息内容

      if (translated) { // 如果翻译成功
        cache[msg.id] = translated // 保存翻译结果到缓存
      }
    }

    setTranslatedMessages(cache) // 更新翻译消息状态
  }

  const handleSendMessage = async () => { // 定义发送普通聊天消息函数
    if (!newMessage.trim() || !selectedRoom) return // 如果输入为空或没有选中聊天室则不发送

    try { // 尝试发送消息
      const res = await fetch(`${API_BASE}/api/chat/send`, { // 调用发送消息接口
        method: 'POST', // 使用 POST 请求
        headers: { // 设置请求头
          'Content-Type': 'application/json' // 告诉后端发送的是 JSON 数据
        },
        body: JSON.stringify({ // 将发送内容转换为 JSON 字符串
          senderUsername: currentUsername, // 当前发送者用户名
          receiverUsername: selectedRoom.partnerUsername, // 当前聊天对象用户名
          content: newMessage // 输入框里的消息内容
        })
      })

      const data = await res.json() // 解析后端返回 JSON 数据

      if (!data.success) { // 如果后端返回发送失败
        alert(data.message) // 弹出错误提示信息
        return // 结束执行
      }

      setNewMessage('') // 清空输入框内容
      setAiError('') // 清空 AI 错误提示
      fetchMessages(true) // 重新获取消息并自动滚动到底部
      fetchRooms() // 更新聊天室列表（比如最后一条消息）
    } catch {} // 捕获异常但静默处理
  }
    const handleAiSuggest = async () => { // 定义 AI 辅助回复函数，用于请求 AI 生成学习帮助内容
    if (!selectedRoom) return // 如果当前没有选中的聊天室则直接结束

    setIsAiLoading(true) // 设置 AI 加载状态为 true，显示加载动画
    setAiError('') // 清空之前的 AI 错误信息

    try { // 尝试请求 AI 接口
      const context = messages // 获取当前聊天消息列表
        .slice(-8) // 只截取最近 8 条消息，避免上下文过长
        .map(msg => `${msg.senderUsername}: ${msg.content}`) // 将每条消息转换为 “用户名: 内容” 格式
        .join('\n') // 用换行符拼接成完整上下文字符串

      const question = // 定义 AI 实际提问内容
        newMessage.trim() || // 如果输入框有内容则优先使用输入框内容
        messages[messages.length - 1]?.content || // 如果输入框为空则使用最后一条聊天消息
        '최근 채팅 내용에서 이해하기 어려운 지식 포인트를 설명해주세요.' // 如果都没有则使用默认韩文提问内容

      const res = await fetch(`${API_BASE}/api/chat/ai-help`, { // 调用 AI 帮助接口
        method: 'POST', // 使用 POST 请求
        headers: { // 设置请求头
          'Content-Type': 'application/json' // 告诉后端发送 JSON 数据
        },
        body: JSON.stringify({ // 将请求体对象转为 JSON 字符串
          message: question, // AI 实际问题内容
          partner: selectedRoom.partnerUsername, // 当前聊天对象用户名
          context // 最近聊天上下文内容
        })
      })

      const data = await res.json() // 解析 AI 接口返回 JSON 数据

      if (!data.success) { // 如果 AI 接口返回失败
        setAiError('AI 학습 도움 생성에 실패했습니다.') // 设置 AI 错误提示
        return // 停止执行
      }

      const translated = await translateText(data.answer) // 将 AI 返回内容翻译为当前用户语言（如果需要）

      const aiMessage = `${AI_PREFIX}\n${ // 拼接 AI 消息内容
        translated // 判断是否存在翻译结果
          ? `${data.answer}\n🌐 ${translated}` // 如果有翻译则显示原文 + 翻译
          : data.answer // 如果没有翻译则只显示原文
      }`

      const sendRes = await fetch(`${API_BASE}/api/chat/send`, { // 调用发送消息接口，把 AI 回复写入聊天记录
        method: 'POST', // 使用 POST 请求
        headers: { // 设置请求头
          'Content-Type': 'application/json' // 告诉后端发送 JSON
        },
        body: JSON.stringify({ // 将 AI 消息对象转换为 JSON 字符串
          senderUsername: currentUsername, // 当前用户作为发送者
          receiverUsername: selectedRoom.partnerUsername, // 当前聊天对象作为接收者
          content: aiMessage // AI 拼接后的完整消息内容
        })
      })

      const sendData = await sendRes.json() // 解析发送消息接口返回结果

      if (!sendData.success) { // 如果 AI 消息写入聊天记录失败
        setAiError('AI 메시지 저장에 실패했습니다.') // 设置错误提示
        return // 停止执行
      }

      setNewMessage('') // 清空输入框
      fetchMessages(true) // 重新拉取消息并滚动到底部
      fetchRooms() // 更新聊天室列表（例如最后一条消息）
      scrollToBottom() // 强制滚动到底部
    } catch { // 捕获请求异常
      setAiError('AI 서버 연결에 실패했습니다.') // 设置 AI 服务器连接失败提示
    } finally { // 无论成功还是失败都会执行
      setIsAiLoading(false) // 关闭 AI loading 状态
    }
  }

  useEffect(() => { // 组件副作用：当前用户名变化时加载聊天室列表
    if (currentUsername) fetchRooms() // 如果当前用户存在则获取聊天室
  }, [currentUsername]) // currentUsername 变化时重新执行

  useEffect(() => { // 组件副作用：当前聊天室变化时加载消息并启动轮询
    if (!selectedRoom || !currentUsername) return // 如果没有聊天室或用户不存在则停止

    fetchMessages(true) // 首次进入聊天室时加载消息并滚动到底部

    const interval = setInterval( // 创建定时器轮询聊天消息
      () => fetchMessages(false), // 每次轮询获取消息但不强制滚动
      2000 // 每 2 秒执行一次
    )

    return () => clearInterval(interval) // 组件卸载或依赖变化时清除定时器
  }, [selectedRoom, currentUsername]) // 当前聊天室或当前用户变化时重新执行

  useEffect(() => { // 组件副作用：消息列表或当前语言变化时执行自动翻译
    if (!messages.length) { // 如果当前没有任何消息
      setTranslatedMessages({}) // 清空翻译缓存对象
      return // 结束执行
    }

    autoTranslateMessages() // 自动翻译当前消息列表
  }, [messages, currentLang]) // 当消息列表或当前语言变化时重新执行

  if (!currentUsername) { // 如果当前没有登录用户
    return ( // 直接返回未登录提示界面
      <div style={{ color: 'white', padding: '40px' }}> {/* 白色文字+40像素内边距 */}
        먼저 로그인해 주세요. {/* 提示用户先登录（韩文） */}
      </div>
    )
  }

  if (!rooms.length) { // 如果聊天室列表为空
    return ( // 返回无聊天室提示界面
      <div style={{ color: 'white', padding: '40px' }}> {/* 白色文字+40像素内边距 */}
        매칭된 채팅방이 없습니다. {/* 提示当前没有匹配聊天室（韩文） */}
      </div>
    )
  }

  return ( // 返回聊天页面主界面 JSX
    <div className="chat-page"> {/* 聊天页面最外层容器 */}
      <div className="chat-sidebar"> {/* 左侧聊天室列表区域 */}
        <div className="chat-sidebar-top"> {/* 左侧顶部区域 */}
          <h2 className="chat-title">{text.chat}</h2> {/* 聊天标题，来自多语言 text 对象 */}

          <input // 聊天搜索输入框
            type="text" // 输入框类型为文本
            placeholder="채팅 검색..." // 输入框占位提示文字（韩文）
            className="chat-search" // 应用聊天搜索框 CSS 样式
          />
        </div>

        <div className="chat-user-list"> {/* 聊天室用户列表容器 */}
          {rooms.map(room => ( // 遍历所有聊天室数据
            <div // 每个聊天室卡片
              key={room.roomId} // 使用聊天室 id 作为 React 唯一 key
              className={`chat-user-card ${ // 动态拼接聊天室卡片样式
                selectedRoom?.roomId === room.roomId // 判断当前聊天室是否被选中
                  ? 'active-chat' // 如果选中则添加 active-chat 样式
                  : '' // 否则不加额外样式
              }`}
              onClick={() => { // 点击聊天室执行
                setSelectedRoom(room) // 设置当前聊天室为点击的聊天室
                setAiError('') // 清空 AI 错误提示
                scrollToBottom() // 自动滚动到底部
              }}
            >
              <div className="chat-avatar"> {/* 聊天室头像区域 */}
                {room.partnerName?.charAt(0)} {/* 显示聊天对象名字的第一个字符 */}
              </div>

              <div className="chat-user-info"> {/* 聊天对象信息区域 */}
                <h4>{room.partnerName}</h4> {/* 显示聊天对象名字 */}
                <p>{room.lastMessage || '새로운 대화를 시작하세요'}</p> {/* 显示最后一条消息，没有则显示默认提示 */}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="chat-main"> {/* 右侧聊天主区域 */}
        <div className="chat-header"> {/* 聊天顶部信息栏 */}
          <div className="chat-header-info"> {/* 聊天对象信息区域 */}
            <h3>{selectedRoom?.partnerName}</h3> {/* 当前聊天对象名字 */}
            <span>온라인</span> {/* 在线状态文字（韩文） */}
          </div>
        </div>

        <div className="chat-messages"> {/* 消息显示区域 */}
          {messages.map((msg, index) => { // 遍历当前聊天室所有消息
            const isMe = msg.senderUsername === currentUsername // 判断当前消息是否由自己发送
            const isAi = msg.content?.startsWith(AI_PREFIX) // 判断当前消息是否为 AI 消息

            let showTimeBubble = index === 0 // 默认第一条消息显示时间气泡
            let hideAvatar = false // 默认不隐藏头像

            if (index > 0) { // 如果当前不是第一条消息
              const prev = messages[index - 1] // 获取上一条消息
              const nowTime = new Date(msg.createdAt || msg.time) // 获取当前消息时间，优先使用 createdAt，没有则用 time
              const prevTime = new Date(prev.createdAt || prev.time) // 获取上一条消息时间

              if (!isNaN(nowTime) && !isNaN(prevTime)) { // 如果两个时间都有效
                showTimeBubble = nowTime - prevTime > TIME_GAP // 如果两条消息时间差超过 5 分钟则显示时间气泡
              }
            }

            if (index < messages.length - 1) { // 如果当前不是最后一条消息
              const next = messages[index + 1] // 获取下一条消息
              const nowTime = new Date(msg.createdAt || msg.time) // 获取当前消息时间
              const nextTime = new Date(next.createdAt || next.time) // 获取下一条消息时间

              if ( // 判断是否需要隐藏头像
                next.senderUsername === msg.senderUsername && // 下一条消息发送者和当前消息相同
                nextTime - nowTime <= TIME_GAP && // 时间差不超过 5 分钟
                !next.content?.startsWith(AI_PREFIX) // 下一条消息不是 AI 消息
              ) {
                hideAvatar = true // 隐藏头像，模拟连续消息效果
              }
            }

            return ( // 返回当前消息 JSX
              <div key={msg.id || index} style={{ display: 'contents' }}> {/* 外层包装容器，不实际占布局 */}
                {showTimeBubble && ( // 如果需要显示时间气泡
                  <div className="chat-time-bubble"> {/* 时间气泡容器 */}
                    {formatWeChatTime(msg.createdAt || msg.time)} {/* 格式化显示当前消息时间 */}
                  </div>
                )}

                {isAi ? ( // 如果当前消息是 AI 消息
                  <div className="ai-suggestion-box"> {/* AI 消息整体容器 */}
                    <div className="ai-suggest-title"> {/* AI 标题区域 */}
                      {AI_PREFIX} {/* 显示 AI 前缀标题 */}
                    </div>

                    <div className="ai-suggest-content"> {/* AI 内容区域 */}
                      {msg.content.replace(`${AI_PREFIX}\n`, '')} {/* 去掉 AI 前缀后显示真正内容 */}
                    </div>
                  </div>
                ) : ( // 如果是普通聊天消息
                  <div
                    className={`message-row ${ // 动态设置消息行样式
                      isMe ? 'row-sent' : 'row-received' // 自己发送显示右侧样式，对方发送显示左侧样式
                    } ${hideAvatar ? 'avatar-hidden' : ''}`} // 如果隐藏头像则附加 avatar-hidden 样式
                  >
                    {!isMe && ( // 如果不是自己发送的消息
                      <div className="message-avatar"> {/* 对方头像区域 */}
                        {!hideAvatar && selectedRoom?.partnerName?.charAt(0)} {/* 如果不隐藏头像则显示聊天对象名字首字 */}
                      </div>
                    )}

                    <div className={`message ${isMe ? 'sent' : 'received'}`}> {/* 消息气泡容器 */}
                      <div className="message-text"> {/* 原始消息文本区域 */}
                        {msg.content} {/* 显示消息原文 */}
                      </div>

                      {translatedMessages[msg.id] && ( // 如果当前消息有翻译内容
                        <div className="translated-message"> {/* 翻译消息区域 */}
                          {translatedMessages[msg.id]} {/* 显示翻译结果 */}
                        </div>
                      )}
                    </div>

                    {isMe && ( // 如果是自己发送的消息
                      <> {/* React Fragment，不额外生成 DOM */}
                        <div className="message-avatar"> {/* 自己头像区域 */}
                          {!hideAvatar && currentUsername?.charAt(0)} {/* 如果不隐藏头像则显示当前用户名首字 */}
                        </div>

                        <span
                          className={`msg-status ${ // 动态设置消息状态样式
                            msg.isRead ? 'status-read' : 'status-unread' // 已读或未读状态
                          }`}
                        >
                          {msg.isRead ? '읽음' : '1'} {/* 已读显示“읽음”，未读显示数字 1 */}
                        </span>
                      </>
                    )}
                  </div>
                )}
              </div>
            )
          })}

                    {isAiLoading && ( // 如果 AI 正在生成内容
            <div className="message-row row-received"> {/* 模拟一条左侧接收消息 */}
              <div className="message-avatar">✨</div> {/* AI loading 状态头像，显示星星图标 */}

              <div className="message received ai-typing-bubble"> {/* AI typing 气泡容器 */}
                <div className="typing-dots"> {/* 打字动画点容器 */}
                  <span></span> {/* 第一个动画点 */}
                  <span></span> {/* 第二个动画点 */}
                  <span></span> {/* 第三个动画点 */}
                </div>
              </div>
            </div>
          )}

          {aiError && ( // 如果存在 AI 错误信息
            <div className="ai-suggestion-box"> {/* AI 错误显示容器 */}
              <div className="ai-suggest-title"> {/* AI 错误标题区域 */}
                {AI_PREFIX} {/* 显示 AI 前缀标题 */}
              </div>

              <div className="ai-suggest-content"> {/* AI 错误内容区域 */}
                {aiError} {/* 显示 AI 错误提示文本 */}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} /> {/* 聊天底部锚点，用于自动滚动到底部 */}
        </div>

        <div className="chat-input-area"> {/* 聊天输入区域整体容器 */}
          <button className="plus-btn">+</button> {/* 功能扩展按钮，目前只显示 + */}

          <input
            type="text" // 输入框类型为文本
            className="chat-input" // 应用聊天输入框样式
            value={newMessage} // 输入框内容绑定 newMessage 状态
            onChange={e => setNewMessage(e.target.value)} // 输入变化时更新状态
            onKeyDown={e => e.key === 'Enter' && handleSendMessage()} // 按下 Enter 键时发送消息
            placeholder="메시지를 입력하세요..." // 输入框占位提示（韩文）
          />

          <button
            className="ai-btn" // AI 按钮样式
            onClick={handleAiSuggest} // 点击时调用 AI 帮助函数
            disabled={isAiLoading} // AI 正在生成时禁用按钮
          >
            {isAiLoading ? '...' : '✨ AI'} {/* AI 加载中显示 ...，否则显示 AI 按钮文字 */}
          </button>

          <button
            className="send-btn" // 发送按钮样式
            onClick={handleSendMessage} // 点击时发送消息
          >
            보내기 {/* 发送按钮文字（韩文） */}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Chat // 导出 Chat 组件供其他页面使用
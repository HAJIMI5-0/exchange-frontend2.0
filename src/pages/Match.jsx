import { useState } from 'react'                    // 引入 useState，用来保存页面中的状态数据
import { useNavigate } from 'react-router-dom'      // 引入 useNavigate，用来进行页面跳转

const API_BASE_URL = 'http://10.30.4.139:8080'      // 后端接口的基础地址

function Match({ text }) {                          // 匹配页面组件，接收多语言文本 text
  const navigate = useNavigate()                    // 创建页面跳转函数

  const [users, setUsers] = useState([])            // 保存匹配接口返回的用户列表

  const [haveSkill, setHaveSkill] = useState('')    // 保存用户输入的“我会什么”
  const [wantSkill, setWantSkill] = useState('')    // 保存用户输入的“我想学什么”

  const [loading, setLoading] = useState(false)     // 保存匹配请求是否正在进行
  const [error, setError] = useState('')            // 保存匹配失败时的错误提示

  // 保存当前被选择的用户
  const [selectedUser, setSelectedUser] = useState(null)    // 保存点击“选择TA”后的用户信息，用来显示弹窗

  // 保存创建聊天室后的提示文字
  const [chatResult, setChatResult] = useState('')          // 保存开始聊天后的结果提示，比如创建成功或失败

  // 把后端返回的技能数据统一转成数组
  const normalizeSkillList = (value) => {                   // 处理技能数据，保证最后返回的一定是数组
    if (Array.isArray(value)) {                             // 如果后端返回的本来就是数组
      return value                                          // 直接返回这个数组
    }

    if (typeof value === 'string' && value.trim() !== '') { // 如果后端返回的是非空字符串
      return [value]                                        // 把字符串包装成数组
    }

    return []                                               // 如果没有数据，就返回空数组，避免页面报错
  }

  // 获取擅长技能，兼容 skills 和 teachSkill 两种字段名
  const getSkills = (user) => {                               // 获取用户会的技能
    return normalizeSkillList(user.skills || user.teachSkill) // 优先读取 skills，没有就读取 teachSkill
  }

  // 获取想学技能，兼容 wants 和 learnSkill 两种字段名
  const getWants = (user) => {                                // 获取用户想学的技能
    return normalizeSkillList(user.wants || user.learnSkill)  // 优先读取 wants，没有就读取 learnSkill
  }

  const handleMatch = async () => {                           // 点击“开始匹配”按钮后执行
    setLoading(true)                                          // 开始加载，页面显示匹配中
    setError('')                                              // 清空之前的错误信息
    setUsers([])                                              // 清空之前的匹配结果
    setChatResult('')                                         // 清空之前的聊天室提示

    try {
      const params = new URLSearchParams()                    // 创建 URL 参数对象，用来拼接查询条件

      if (haveSkill) {                                        // 如果填写了“我会什么”
        params.append('haveSkill', haveSkill.toLowerCase())   // 添加 haveSkill 参数，并转成小写
      }

      if (wantSkill) {                                        // 如果填写了“我想学什么”
        params.append('wantSkill', wantSkill.toLowerCase())   // 添加 wantSkill 参数，并转成小写
      }

      params.append('limit', '5')                             // 限制后端最多返回 5 个匹配用户

      const res = await fetch(`${API_BASE_URL}/api/match?${params.toString()}`)  // 请求后端匹配接口

      if (!res.ok) {                                                            // 如果接口状态不是成功
        throw new Error('后端匹配接口请求失败')                                   // 抛出错误，进入 catch
      }

      const data = await res.json()                                             // 把后端返回的数据转成 JSON

      console.log('匹配接口返回:', data)                                         // 在控制台查看后端返回的数据

      setUsers(data)                                                            // 把匹配用户列表保存到 users，页面会自动显示卡片
    } catch (err) {                                                             // 请求失败或后端报错时执行
      console.error(err)                                                        // 在控制台输出错误
      setError(text.matchError || '匹配失败，请检查后端接口是否正常')              // 页面显示错误提示
    } finally {
      setLoading(false)                                                         // 无论成功还是失败，最后都结束加载状态
    }
  }

  // 点击选择TA，直接打开弹窗
  const handleSelectUser = (user) => {                    // 点击某个用户卡片里的“选择TA”按钮时执行
    console.log('当前选择的用户:', user)                   // 在控制台查看当前选择的用户信息

    setSelectedUser(user)                                 // 保存当前选择的用户，用来打开弹窗
    setChatResult('')                                     // 清空之前创建聊天室的提示
  }

  // 关闭弹窗
  const handleCloseModal = () => {                        // 点击弹窗关闭按钮时执行
    setSelectedUser(null)                                 // 清空 selectedUser，弹窗就会关闭
    setChatResult('')                                     // 清空聊天室提示文字
  }

  // 创建聊天室
  const handleStartChat = async () => {                             // 点击“开始聊天”按钮时执行
    const loginUser = JSON.parse(localStorage.getItem('loginUser')) // 从本地存储中读取当前登录用户

    if (!loginUser || !loginUser.username) {                        // 如果没有登录用户信息
      setChatResult('请先登录后再开始聊天')                           // 提示用户先登录
      return                                                        // 停止继续执行
    }

    if (!selectedUser || !selectedUser.username) {                  // 如果没有选中用户，或者匹配接口没有返回对方 username
      setChatResult('暂时无法创建聊天室：匹配接口没有返回对方账号')     // 显示无法创建聊天室的原因
      return // 停止继续执行
    }

    if (loginUser.username === selectedUser.username) {             // 如果当前登录用户和选择的用户是同一个人
      setChatResult('不能和自己创建聊天室')                           // 提示不能和自己聊天
      return                                                        // 停止继续执行
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/chat/direct`, { // 请求后端创建一对一聊天室接口
        method: 'POST',                                            // 请求方式是 POST
        headers: {
          'Content-Type': 'application/json'                       // 告诉后端发送的是 JSON 数据
        },
        body: JSON.stringify({                                     // 把发送者和接收者账号转成 JSON 发给后端
          senderUsername: loginUser.username,                      // 当前登录用户账号
          receiverUsername: selectedUser.username                  // 被选择的用户账号
        })
      })

      const data = await res.json()                                // 接收后端返回的聊天室创建结果

      console.log('创建聊天室接口状态:', res.status)                // 输出接口状态码
      console.log('创建聊天室接口返回:', data)                      // 输出接口返回数据

      if (res.ok && data.success === true) {                      // 如果后端创建聊天室成功
        const roomId = data.roomId || data.chatRoomId || data.id  // 兼容后端可能返回的不同房间 ID 字段名

        setChatResult('聊天室已创建')                              // 显示聊天室创建成功

        if (roomId) {                                             // 如果后端返回了聊天室 ID
          navigate(`/chat?roomId=${roomId}`, {                    // 跳转到聊天页面，并把 roomId 放到地址栏
            state: {
              roomId,                                             // 把聊天室 ID 传给 Chat 页面
              chatUser: selectedUser                              // 把聊天对象信息传给 Chat 页面
            }
          })
        } else {                                                  // 如果后端没有返回聊天室 ID
          navigate('/chat', {                                     // 直接跳转到聊天页面
            state: {
              chatUser: selectedUser                              // 只传聊天对象信息
            }
          })
        }
      } else {
        setChatResult(data.message || `创建聊天室失败`)            // 创建失败时显示后端返回的错误信息
      }
    } catch (err) {                                               // 请求失败时执行，比如后端没启动或接口地址错误
      console.error(err)                                          // 在控制台输出错误
      setChatResult('创建聊天室失败，请检查后端聊天室接口')          // 页面显示创建聊天室失败提示
    }
  }

  return (
    <div className="match-page">                                  {/* 匹配页面最外层容器 */}
      <h1>{text.matchTitle || '技能匹配'}</h1>                     {/* 页面标题 */}

      <div className="match-filter-box">                          {/* 匹配筛选区域 */}
        <div className="filter-group">                            {/* 第一个筛选输入框 */}
          <label>{text.iCan || '我会什么'}</label>                 {/* “我会什么”标签 */}

          <input
            type="text"                                           // 文本输入框
            value={haveSkill}                                     // 输入框内容绑定 haveSkill
            onChange={(e) => setHaveSkill(e.target.value)}        // 输入变化时更新 haveSkill
            placeholder="请输入你会的技能，例如 Java"               // 输入框提示文字
          />
        </div>

        <div className="filter-group">                            {/* 第二个筛选输入框 */}
          <label>{text.iWantLearn || '我想学什么'}</label>         {/* “我想学什么”标签 */}

          <input
            type="text"                                           // 文本输入框
            value={wantSkill}                                     // 输入框内容绑定 wantSkill
            onChange={(e) => setWantSkill(e.target.value)}        // 输入变化时更新 wantSkill
            placeholder="请输入你想学的技能，例如 React"            // 输入框提示文字
          />
        </div>

        <button className="match-btn" onClick={handleMatch}>                             {/* 点击后执行匹配请求 */}
          {loading ? (text.matching || '匹配中...') : (text.startMatch || '开始匹配')}    {/* 根据 loading 状态切换按钮文字 */}
        </button>
      </div>

      <div className="match-result">                            {/* 匹配结果展示区域 */}
        {loading && (                                           // 如果正在匹配中，显示加载提示
          <p className="empty-text">
            {text.matching || '匹配中...'}
          </p>
        )}

        {error && (                                             // 如果有错误信息，显示错误提示
          <p className="empty-text">
            {error}
          </p>
        )}

        {!loading && !error && users.length === 0 ? (           // 如果没有加载、没有错误、并且没有用户结果
          <p className="empty-text">
            {text.matchEmpty || '请选择技能后开始匹配'}
          </p>
        ) : (
          users.map(user => (                                   // 遍历匹配到的用户列表，生成用户卡片
            <div className="user-card" key={user.id || user.username || user.name}>      {/* 单个用户卡片 */}
              <div className="user-avatar-card">                {/* 用户头像区域 */}
                {user.avatar ? (                                // 如果用户有头像
                  <img src={user.avatar} alt="avatar" />        // 显示头像图片
                ) : (
                  <span>👤</span>                               // 没有头像时显示默认图标
                )}
              </div>

              <h3>{user.name || user.username}</h3>             {/* 显示用户姓名，优先显示 name，没有就显示 username */}

              <p className="user-age"> {/* 显示年龄区域 */}
                {user.age ? `${user.age}${text.yearsOld || '岁'}` : text.ageUnknown || '年龄未填写'}        {/* 有年龄就显示年龄，没有就显示未填写 */}
              </p>

              <div className="skill-section">                   {/* 擅长技能区域 */}
                <span className="skill-title can">
                  {text.canDo || '我会'}                        {/* 擅长技能标题 */}
                </span>

                <div>
                  {getSkills(user).map((s, i) => (              // 遍历用户会的技能
                    <span className="tag" key={i}>{s}</span>    // 每个技能显示成一个标签
                  ))}
                </div>
              </div>

              <div className="skill-section">                   {/* 想学技能区域 */}
                <span className="skill-title want">
                  {text.wantLearn || '想学'}                    {/* 想学技能标题 */}
                </span>

                <div>
                  {getWants(user).map((w, i) => (               // 遍历用户想学的技能
                    <span className="tag" key={i}>{w}</span>    // 每个技能显示成一个标签
                  ))}
                </div>
              </div>

              <button
                type="button"                                   // 普通按钮
                className="select-user-btn"                     // 选择用户按钮样式
                onClick={() => handleSelectUser(user)}          // 点击后打开当前用户信息弹窗
              >
                {text.selectTa || '选择TA'}                     {/* 按钮文字 */}
              </button>
            </div>
          ))
        )}
      </div>

      {/* 用户信息弹窗 */}
      {selectedUser && (                                        // 如果 selectedUser 有值，就显示弹窗
        <div className="modal-mask">                            {/* 弹窗背景遮罩 */}
          <div className="user-modal">                          {/* 弹窗主体 */}
            <button className="modal-close-btn" onClick={handleCloseModal}>         {/* 关闭弹窗按钮 */}
              X
            </button>

            <div className="modal-avatar">                      {/* 弹窗中的头像区域 */}
              {selectedUser.avatar ? (                          // 如果选中的用户有头像
                <img src={selectedUser.avatar} alt="avatar" />  // 显示头像图片
              ) : (
                <span>👤</span>                                 // 没有头像时显示默认图标
              )}
            </div>

            <h2>{selectedUser.name || selectedUser.username || 'User'}</h2>         {/* 弹窗标题，显示用户姓名或账号 */}

            <div className="modal-info">                        {/* 用户详细信息区域 */}
              <div className="modal-row">                       {/* 年龄信息行 */}
                <span className="modal-label">年龄</span>       {/* 信息名称 */}
                <span className="modal-value">
                  {selectedUser.age || '-'}                     {/* 显示年龄，没有就显示 - */}
                </span>
              </div>

              <div className="modal-row">                       {/* 性别信息行 */}
                <span className="modal-label">性别</span>       {/* 信息名称 */}
                <span className="modal-value">
                  {selectedUser.gender === 'male'               // 如果性别是 male
                    ? '男' // 显示男
                    : selectedUser.gender === 'female'          // 如果性别是 female
                    ? '女' // 显示女
                    : selectedUser.gender === 'other'           // 如果性别是 other
                    ? '其他' // 显示其他
                    : selectedUser.gender || '-'}               {/* 其他情况显示原值，没有就显示 - */}
                </span>
              </div>

              <div className="modal-row">                       {/* 国籍信息行 */}
                <span className="modal-label">国籍</span>       {/* 信息名称 */}
                <span className="modal-value">
                  {selectedUser.nationality || '-'}             {/* 显示国籍，没有就显示 - */}
                </span>
              </div>

              <div className="modal-row">                       {/* 擅长技能信息行 */}
                <span className="modal-label">擅长技能</span>    {/* 信息名称 */}
                <span className="modal-value">
                  {getSkills(selectedUser).length > 0           // 如果有擅长技能
                    ? getSkills(selectedUser).join(', ')        // 用逗号拼接显示
                    : '-'}                                      {/* 没有技能就显示 - */}
                </span>
              </div>

              <div className="modal-row">                       {/* 想学技能信息行 */}
                <span className="modal-label">想学技能</span>    {/* 信息名称 */}
                <span className="modal-value">
                  {getWants(selectedUser).length > 0             // 如果有想学技能
                    ? getWants(selectedUser).join(', ')          // 用逗号拼接显示
                    : '-'}                                      {/* 没有技能就显示 - */}
                </span>
              </div>
            </div>

            <button className="apply-friend-btn" onClick={handleStartChat}>         {/* 点击后创建聊天室并跳转聊天页面 */}
              开始聊天
            </button>

            {chatResult && (                                    // 如果有聊天室创建结果提示，就显示出来
              <p className="apply-result">
                {chatResult}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Match // 导出 Match 组件，供其他文件使用
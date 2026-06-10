import { getSkills, getWants } from './matchUtils'

function MatchUserCard({ text, user, onSelect, onAvatarClick }) {
  const skills = user.translatedSkills || getSkills(user)
  const wants = user.translatedWants || getWants(user)

  const getLevelText = (level) => {
    if (level === 'beginner') return text.beginner || '入门'
    if (level === 'basic') return text.basic || '基础'
    if (level === 'intermediate') return text.intermediate || '中级'
    if (level === 'advanced') return text.advanced || '进阶'

    return level || text.levelUnknown || '未评级'
  }

  const getTeachLevel = (index) => {
    return (
      user.teachLevels?.[index] ||
      user.skillOfferLevels?.[index] ||
      user.skillLevels?.[index] ||
      user.canLevels?.[index] ||
      user.teachLevel ||
      user.skillOfferLevel ||
      user.skill_offer_level ||
      user.skillLevel ||
      ''
    )
  }

  const getWantLevel = (index) => {
    return (
      user.learnLevels?.[index] ||
      user.wantLevels?.[index] ||
      user.wantsLevels?.[index] ||
      user.skillWantLevels?.[index] ||
      user.skillWentLevels?.[index] ||
      user.learnLevel ||
      user.skillWantLevel ||
      user.skillWentLevel ||
      user.skill_want_level ||
      user.skill_went_level ||
      user.wantLevel ||
      ''
    )
  }

  // 点击头像：只打开详情卡片
  const handleAvatarClick = (e) => {
    e.stopPropagation()

    if (onAvatarClick) {
      onAvatarClick(user)
    }
  }

  // 点击选择TA：只执行选择 / 创建聊天室
  const handleSelectClick = (e) => {
    e.stopPropagation()

    if (onSelect) {
      onSelect(user)
    }
  }

  return (
    <div className="user-card">
      <div
        className="user-avatar-card"
        onClick={handleAvatarClick}
        title={text.viewProfile || '查看用户详情'}
      >
        {user.avatar ? (
          <img src={user.avatar} alt="avatar" />
        ) : (
          <span>👤</span>
        )}
      </div>

      <h3>{user.name || user.username}</h3>

      <p className="user-age">
        {user.age
          ? `${user.age}${text.yearsOld || '岁'}`
          : text.ageUnknown || '年龄未填写'}
      </p>

      <p className="user-intro">
        {user.introduction ||
          user.bio ||
          user.about ||
          text.noIntro ||
          '这个用户暂时没有填写个人介绍'}
      </p>

      <div className="skill-section">
        <div className="skill-title-line">
          <span className="skill-title can">
            {text.canDo || '我会'}
          </span>
        </div>

        <div className="skill-list">
          {skills.map((skill, index) => (
            <span className="skill-pill" key={index}>
              <span className="skill-name">{skill}</span>

              <span className="skill-level">
                {getLevelText(getTeachLevel(index))}
              </span>
            </span>
          ))}
        </div>
      </div>

      <div className="skill-section">
        <div className="skill-title-line">
          <span className="skill-title want">
            {text.wantLearn || '想学'}
          </span>
        </div>

        <div className="skill-list">
          {wants.map((want, index) => (
            <span className="skill-pill" key={index}>
              <span className="skill-name">{want}</span>

              <span className="skill-level">
                {getLevelText(getWantLevel(index))}
              </span>
            </span>
          ))}
        </div>
      </div>

      <button
        type="button"
        className="select-user-btn"
        onClick={handleSelectClick}
      >
        {text.selectTa || '选择TA'}
      </button>
    </div>
  )
}

export default MatchUserCard
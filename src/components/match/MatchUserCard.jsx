import { getSkills, getWants } from './matchUtils'

function MatchUserCard({ text, user, onSelect }) {
  const skills = user.translatedSkills || getSkills(user)
  const wants = user.translatedWants || getWants(user)

  const getTeachLevel = (index) => {
    return (
      user.teachLevels?.[index] ||
      user.skillLevels?.[index] ||
      user.canLevels?.[index] ||
      user.teachLevel ||
      user.skillLevel ||
      text.levelUnknown ||
      '未评级'
    )
  }

  const getWantLevel = (index) => {
    return (
      user.learnLevels?.[index] ||
      user.wantLevels?.[index] ||
      user.wantsLevels?.[index] ||
      user.learnLevel ||
      user.wantLevel ||
      text.levelUnknown ||
      '未评级'
    )
  }

  return (
    <div className="user-card">
      <div className="user-avatar-card">
        {user.avatar ? (
          <img src={user.avatar} alt="avatar" />
        ) : (
          <span>👤</span>
        )}
      </div>

      <h3>{user.name || user.username}</h3>

      <p className="user-age">
        {user.age ? `${user.age}${text.yearsOld || '岁'}` : text.ageUnknown || '年龄未填写'}
      </p>

      <p className="user-intro">
        {user.introduction || user.bio || user.about || text.noIntro || '这个用户暂时没有填写个人介绍'}
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
              <span className="skill-level">{getTeachLevel(index)}</span>
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
              <span className="skill-level">{getWantLevel(index)}</span>
            </span>
          ))}
        </div>
      </div>

      <button
        type="button"
        className="select-user-btn"
        onClick={() => onSelect(user)}
      >
        {text.selectTa || '选择TA'}
      </button>
    </div>
  )
}

export default MatchUserCard
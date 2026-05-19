import { getSkills, getWants } from './matchUtils'

function MatchUserCard({ text, user, onSelect }) {
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

      <div className="skill-section">
        <span className="skill-title can">
          {text.canDo || '我会'}
        </span>

        <div>
          {(user.translatedSkills || getSkills(user)).map((skill, index) => (
            <span className="tag" key={index}>
              {skill}
            </span>
          ))}
        </div>
      </div>

      <div className="skill-section">
        <span className="skill-title want">
          {text.wantLearn || '想学'}
        </span>

        <div>
          {(user.translatedWants || getWants(user)).map((want, index) => (
            <span className="tag" key={index}>
              {want}
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
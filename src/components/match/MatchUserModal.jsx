import {
  getSkills,
  getWants,
  getGenderText,
  getSkillText
} from './matchUtils'

function MatchUserModal({
  text,
  selectedUser,
  chatResult,
  onClose,
  onStartChat
}) {
  return (
    <div className="modal-mask">
      <div className="user-modal">
        <button className="modal-close-btn" onClick={onClose}>
          X
        </button>

        <div className="modal-avatar">
          {selectedUser.avatar ? (
            <img src={selectedUser.avatar} alt="avatar" />
          ) : (
            <span>👤</span>
          )}
        </div>

        <h2>
          {selectedUser.name || selectedUser.username || text.user || 'User'}
        </h2>

        <div className="modal-info">
          <div className="modal-row">
            <span className="modal-label">{text.age || '年龄'}</span>
            <span className="modal-value">
              {selectedUser.age || '-'}
            </span>
          </div>

          <div className="modal-row">
            <span className="modal-label">{text.gender || '性别'}</span>
            <span className="modal-value">
              {getGenderText(selectedUser.gender, text)}
            </span>
          </div>

          <div className="modal-row">
            <span className="modal-label">{text.nationality || '国籍'}</span>
            <span className="modal-value">
              {selectedUser.translatedNationality || selectedUser.nationality || '-'}
            </span>
          </div>

          <div className="modal-row">
            <span className="modal-label">{text.teachSkill || '擅长技能'}</span>
            <span className="modal-value">
              {getSkillText(selectedUser.translatedSkills || getSkills(selectedUser))}
            </span>
          </div>

          <div className="modal-row">
            <span className="modal-label">{text.learnSkill || '想学技能'}</span>
            <span className="modal-value">
              {getSkillText(selectedUser.translatedWants || getWants(selectedUser))}
            </span>
          </div>
        </div>

        <button className="apply-friend-btn" onClick={onStartChat}>
          {text.startChat || '开始聊天'}
        </button>

        {chatResult && (
          <p className="apply-result">
            {chatResult}
          </p>
        )}
      </div>
    </div>
  )
}

export default MatchUserModal
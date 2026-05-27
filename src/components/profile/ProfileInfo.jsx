function ProfileInfo({
  text,
  profile,
  translatedInfo = {
    teachSkill: '',
    learnSkill: '',
    nationality: ''
  },
  onEdit,
  onHome,
  onLogout
}) {
  const getTimeSlotText = (timeSlot) => {
    if (timeSlot === 'weekday_morning') return text.weekdayMorning || '平日上午'
    if (timeSlot === 'weekday_afternoon') return text.weekdayAfternoon || '平日下午'
    if (timeSlot === 'weekday_evening') return text.weekdayEvening || '平日晚上'
    if (timeSlot === 'weekend') return text.weekend || '周末'

    return '-'
  }

  const getLevelText = (level) => {
    if (level === 'beginner') return text.beginner || '入门'
    if (level === 'basic') return text.basic || '基础'
    if (level === 'intermediate') return text.intermediate || '中级'
    if (level === 'advanced') return text.advanced || '进阶'

    return level || ''
  }

  return (
    <>
      <div className="profile-info">

        <div className="profile-row-group">
          <div className="profile-row half">
            <span className="profile-label">
              {text.name || '用户名'}
            </span>

            <span>
              {profile.name || '-'}
            </span>
          </div>

          <div className="profile-row half">
            <span className="profile-label">
              {text.age || '年龄'}
            </span>

            <span>
              {profile.age || '-'}
            </span>
          </div>
        </div>

        <div className="profile-row">
          <span className="profile-label">
            {text.gender || '性别'}
          </span>

          <span>
            {profile.gender === 'male'
              ? text.male || '男'
              : profile.gender === 'female'
              ? text.female || '女'
              : profile.gender === 'other'
              ? text.other || '其他'
              : '-'}
          </span>
        </div>

        <div className="profile-row-group">
          <div className="profile-row half">
            <span className="profile-label">
              {text.phone || '电话'}
            </span>

            <span>
              {profile.phone || '-'}
            </span>
          </div>

          <div className="profile-row half">
            <span className="profile-label">
              {text.nationality || '国籍'}
            </span>

            <span>
              {translatedInfo.nationality || profile.nationality || '-'}
            </span>
          </div>
        </div>

        <div className="profile-row">
          <span className="profile-label">
            {text.email || '邮箱'}
          </span>

          <span>
            {profile.email || '-'}
          </span>
        </div>

        <div className="profile-row">
          <span className="profile-label">
            {text.address || '地址'}
          </span>

          <span>
            {profile.address || '-'}
          </span>
        </div>

        <div className="profile-row">
          <span className="profile-label">
            {text.teachSkill || '擅长的技能'}
          </span>

          <span className="profile-skill-with-level">
            <span className="profile-skill-text">
              {translatedInfo.teachSkill || profile.teachSkill || '-'}
            </span>

            {profile.teachLevel && (
              <span className="profile-level-tag">
                {getLevelText(profile.teachLevel)}
              </span>
            )}
          </span>
        </div>

        <div className="profile-row">
          <span className="profile-label">
            {text.learnSkill || '想学习的技能'}
          </span>

          <span className="profile-skill-with-level">
            <span className="profile-skill-text">
              {translatedInfo.learnSkill || profile.learnSkill || '-'}
            </span>

            {profile.learnLevel && (
              <span className="profile-level-tag learn-level-tag">
                {getLevelText(profile.learnLevel)}
              </span>
            )}
          </span>
        </div>

        <div className="profile-row">
          <span className="profile-label">
            {text.timeSlot || '学习时间段'}
          </span>

          <span>
            {getTimeSlotText(profile.timeSlot)}
          </span>
        </div>

        <div className="profile-row">
          <span className="profile-label">
            {text.projectAwards || '项目 / 奖项'}
          </span>

          <span>
            {profile.projectAwards || '-'}
          </span>
        </div>
      </div>

      <div className="profile-actions">
        <button onClick={onEdit}>
          {text.editProfile || '编辑资料'}
        </button>

        <button onClick={onHome}>
          {text.home || '首页'}
        </button>

        <button className="logout-btn" onClick={onLogout}>
          {text.logout || '退出登录'}
        </button>
      </div>
    </>
  )
}

export default ProfileInfo
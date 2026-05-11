function ProfileInfo({
  text,
  profile,
  translatedInfo = {
    teachSkill: '',
    learnSkill: ''
  },
  onEdit,
  onHome,
  onLogout
}) {
  return (
    <>
      <div className="profile-info">
        <div className="profile-row">
          <span className="profile-label">{text.username || '用户名'}</span>
          <span>{profile.username || '-'}</span>
        </div>

        <div className="profile-row">
          <span className="profile-label">{text.phone || '电话'}</span>
          <span>{profile.phone || '-'}</span>
        </div>

        <div className="profile-row">
          <span className="profile-label">{text.email || '邮箱'}</span>
          <span>{profile.email || '-'}</span>
        </div>

        <div className="profile-row">
          <span className="profile-label">{text.address || '地址'}</span>
          <span>{profile.address || '-'}</span>
        </div>

        <div className="profile-row">
          <span className="profile-label">{text.gender || '性别'}</span>
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

        <div className="profile-row">
          <span className="profile-label">{text.age || '年龄'}</span>
          <span>{profile.age || '-'}</span>
        </div>

        <div className="profile-row">
          <span className="profile-label">{text.teachSkill || '擅长的技能'}</span>
          <span>{translatedInfo.teachSkill || profile.teachSkill || '-'}</span>
        </div>

        <div className="profile-row">
          <span className="profile-label">{text.learnSkill || '想学习的技能'}</span>
          <span>{translatedInfo.learnSkill || profile.learnSkill || '-'}</span>
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
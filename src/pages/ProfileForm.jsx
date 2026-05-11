function ProfileForm({
  text,
  profile,
  uploading,
  onChange,
  onAvatarUpload,
  onSave,
  onCancel
}) {
  return (
    <div className="profile-form">
      <input
        type="file"
        accept="image/*"
        onChange={onAvatarUpload}
      />

      <input
        name="username"
        placeholder={text.username}
        value={profile.username}
        onChange={onChange}
      />

      <input
        name="phone"
        placeholder={text.phone}
        value={profile.phone}
        onChange={onChange}
      />

      <input
        name="email"
        placeholder={text.email}
        value={profile.email}
        onChange={onChange}
      />

      <input
        name="address"
        placeholder={text.address}
        value={profile.address}
        onChange={onChange}
      />

      <select
        name="gender"
        value={profile.gender}
        onChange={onChange}
      >
        <option value="">{text.gender || '性别'}</option>
        <option value="male">{text.male || '男'}</option>
        <option value="female">{text.female || '女'}</option>
        <option value="other">{text.other || '其他'}</option>
      </select>

      <input
        name="age"
        placeholder={text.age || '年龄'}
        value={profile.age}
        onChange={onChange}
      />

      <input
        name="teachSkill"
        placeholder={text.teachSkill || '擅长的技能'}
        value={profile.teachSkill}
        onChange={onChange}
      />

      <input
        name="learnSkill"
        placeholder={text.learnSkill || '想学习的技能'}
        value={profile.learnSkill}
        onChange={onChange}
      />

      <div className="profile-actions">
        <button onClick={onSave} disabled={uploading}>
          {uploading ? (text.uploading || '上传中...') : (text.save || '保存')}
        </button>

        <button
          type="button"
          className="switch-btn"
          onClick={onCancel}
        >
          {text.cancel || '取消'}
        </button>
      </div>
    </div>
  )
}

export default ProfileForm
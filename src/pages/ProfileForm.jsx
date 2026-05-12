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

      <div className="profile-form-row-group">
        <input
          name="name"
          placeholder={text.name || '用户名'}
          value={profile.name || ''}
          onChange={onChange}
        />

        <input
          name="age"
          placeholder={text.age || '年龄'}
          value={profile.age}
          onChange={onChange}
        />
      </div>

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

      <div className="profile-form-row-group">
        <input
          name="phone"
          placeholder={text.phone || '电话'}
          value={profile.phone}
          onChange={onChange}
        />

        <input
          name="nationality"
          placeholder={text.nationality || '国籍'}
          value={profile.nationality || ''}
          onChange={onChange}
        />
      </div>

      <input
        name="email"
        placeholder={text.email || '邮箱'}
        value={profile.email}
        onChange={onChange}
      />

      <input
        name="address"
        placeholder={text.address || '地址'}
        value={profile.address}
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
        <button type="button" onClick={onSave} disabled={uploading}>
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
function ProfileForm({
  text, // 多语言文本对象
  profile, // 当前用户资料数据
  uploading, // 是否正在上传头像
  onChange, // 输入框内容变化时调用
  onAvatarUpload, // 选择头像文件时调用
  onSave, // 点击保存按钮时调用
  onCancel // 点击取消按钮时调用
}) {
  return (
    <div className="profile-form">

      <input
        type="file" // 文件选择框
        accept="image/*" // 只允许选择图片文件
        onChange={onAvatarUpload} // 选择图片后执行头像上传函数
      />

      <div className="profile-form-row-group">
        <input
          name="name" // 对应 profile 里的 name 字段
          placeholder={text.name || '用户名'} // 输入框提示文字
          value={profile.name || ''} // 显示当前用户名
          onChange={onChange} // 输入内容变化时更新 profile
        />

        <input
          name="age" // 对应 profile 里的 age 字段
          placeholder={text.age || '年龄'} // 年龄输入框提示文字
          value={profile.age || ''} // 显示当前年龄
          onChange={onChange} // 输入内容变化时更新 profile
        />
      </div>

      <select
        name="gender" // 对应 profile 里的 gender 字段
        value={profile.gender || ''} // 当前选择的性别
        onChange={onChange} // 选择变化时更新 profile
      >
        <option value="">{text.gender || '性别'}</option>
        <option value="male">{text.male || '男'}</option>
        <option value="female">{text.female || '女'}</option>
        <option value="other">{text.other || '其他'}</option>
      </select>

      <div className="profile-form-row-group">
        <input
          name="phone" // 对应 profile 里的 phone 字段
          placeholder={text.phone || '电话'} // 电话输入框提示文字
          value={profile.phone || ''} // 显示当前电话
          onChange={onChange} // 输入内容变化时更新 profile
        />

        <input
          name="nationality" // 对应 profile 里的 nationality 字段
          placeholder={text.nationality || '国籍'} // 国籍输入框提示文字
          value={profile.nationality || ''} // 显示当前国籍
          onChange={onChange} // 输入内容变化时更新 profile
        />
      </div>

      <input
        name="email" // 对应 profile 里的 email 字段
        placeholder={text.email || '邮箱'} // 邮箱输入框提示文字
        value={profile.email || ''} // 显示当前邮箱
        onChange={onChange} // 输入内容变化时更新 profile
      />

      <input
        name="address" // 对应 profile 里的 address 字段
        placeholder={text.address || '地址'} // 地址输入框提示文字
        value={profile.address || ''} // 显示当前地址
        onChange={onChange} // 输入内容变化时更新 profile
      />

      <input
        name="teachSkill" // 对应 profile 里的 teachSkill 字段
        placeholder={text.teachSkill || '擅长的技能'} // 擅长技能输入框提示文字
        value={profile.teachSkill || ''} // 显示当前擅长技能
        onChange={onChange} // 输入内容变化时更新 profile
      />

      <input
        name="learnSkill" // 对应 profile 里的 learnSkill 字段
        placeholder={text.learnSkill || '想学习的技能'} // 想学习技能输入框提示文字
        value={profile.learnSkill || ''} // 显示当前想学习技能
        onChange={onChange} // 输入内容变化时更新 profile
      />

      <select
        name="timeSlot" // 对应 profile 里的 timeSlot 字段
        value={profile.timeSlot || ''} // 当前选择的学习时间段
        onChange={onChange} // 选择变化时更新 profile
      >
        <option value="">{text.timeSlot || '学习时间段'}</option>
        <option value="weekday_morning">{text.weekdayMorning || '平日上午'}</option>
        <option value="weekday_afternoon">{text.weekdayAfternoon || '平日下午'}</option>
        <option value="weekday_evening">{text.weekdayEvening || '平日晚上'}</option>
        <option value="weekend">{text.weekend || '周末'}</option>
      </select>

      <textarea
        name="projectAwards" // 对应 profile 里的 projectAwards 字段
        placeholder={text.projectAwardsPlaceholder || '请填写你做过的项目、获得的奖项或证书'} // 项目 / 奖项输入提示
        value={profile.projectAwards || ''} // 显示当前项目 / 奖项内容
        onChange={onChange} // 输入内容变化时更新 profile
        rows="4" // 文本框默认显示 4 行
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
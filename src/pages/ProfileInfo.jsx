function ProfileInfo({
  text, // 多语言文本对象
  profile, // 当前用户个人资料数据
  translatedInfo = { // 翻译后的个人资料信息，默认值为空
    teachSkill: '', // 翻译后的擅长技能
    learnSkill: '', // 翻译后的想学习技能
    nationality: '' // 翻译后的国籍
  },
  onEdit, // 点击编辑按钮时执行的函数
  onHome, // 点击首页按钮时执行的函数
  onLogout // 点击退出登录按钮时执行的函数
}) {
  return (
    <>
      <div className="profile-info"> {/* 个人资料信息显示区域 */}

        <div className="profile-row-group"> {/* 第一行分组：用户名和年龄 */}
          <div className="profile-row half"> {/* 用户名显示区域，占一半宽度 */}
            <span className="profile-label">{text.name || '用户名'}</span> {/* 用户名标签 */}
            <span>{profile.name || '-'}</span> {/* 显示用户名，没有数据就显示 - */}
          </div>

          <div className="profile-row half"> {/* 年龄显示区域，占一半宽度 */}
            <span className="profile-label">{text.age || '年龄'}</span> {/* 年龄标签 */}
            <span>{profile.age || '-'}</span> {/* 显示年龄，没有数据就显示 - */}
          </div>
        </div>

        <div className="profile-row"> {/* 性别显示行 */}
          <span className="profile-label">{text.gender || '性别'}</span> {/* 性别标签 */}
          <span>
            {profile.gender === 'male' // 如果性别是 male
              ? text.male || '男' // 显示男
              : profile.gender === 'female' // 如果性别是 female
              ? text.female || '女' // 显示女
              : profile.gender === 'other' // 如果性别是 other
              ? text.other || '其他' // 显示其他
              : '-'} {/* 没有性别数据就显示 - */}
          </span>
        </div>

        <div className="profile-row-group"> {/* 第三行分组：电话和国籍 */}
          <div className="profile-row half"> {/* 电话显示区域，占一半宽度 */}
            <span className="profile-label">{text.phone || '电话'}</span> {/* 电话标签 */}
            <span>{profile.phone || '-'}</span> {/* 显示电话，没有数据就显示 - */}
          </div>

          <div className="profile-row half"> {/* 国籍显示区域，占一半宽度 */}
            <span className="profile-label">{text.nationality || '国籍'}</span> {/* 国籍标签 */}
            <span>{translatedInfo.nationality || profile.nationality || '-'}</span> {/* 优先显示翻译后的国籍，没有就显示原国籍，再没有就显示 - */}
          </div>
        </div>

        <div className="profile-row"> {/* 邮箱显示行 */}
          <span className="profile-label">{text.email || '邮箱'}</span> {/* 邮箱标签 */}
          <span>{profile.email || '-'}</span> {/* 显示邮箱，没有数据就显示 - */}
        </div>

        <div className="profile-row"> {/* 地址显示行 */}
          <span className="profile-label">{text.address || '地址'}</span> {/* 地址标签 */}
          <span>{profile.address || '-'}</span> {/* 显示地址，没有数据就显示 - */}
        </div>

        <div className="profile-row"> {/* 擅长技能显示行 */}
          <span className="profile-label">{text.teachSkill || '擅长的技能'}</span> {/* 擅长技能标签 */}
          <span>{translatedInfo.teachSkill || profile.teachSkill || '-'}</span> {/* 优先显示翻译后的擅长技能，没有就显示原技能，再没有就显示 - */}
        </div>

        <div className="profile-row"> {/* 想学习技能显示行 */}
          <span className="profile-label">{text.learnSkill || '想学习的技能'}</span> {/* 想学习技能标签 */}
          <span>{translatedInfo.learnSkill || profile.learnSkill || '-'}</span> {/* 优先显示翻译后的想学习技能，没有就显示原技能，再没有就显示 - */}
        </div>
      </div>

      <div className="profile-actions"> {/* 操作按钮区域 */}
        <button onClick={onEdit}> {/* 点击后进入编辑资料模式 */}
          {text.editProfile || '编辑资料'} {/* 编辑资料按钮文字 */}
        </button>

        <button onClick={onHome}> {/* 点击后返回首页 */}
          {text.home || '首页'} {/* 首页按钮文字 */}
        </button>

        <button className="logout-btn" onClick={onLogout}> {/* 点击后退出登录 */}
          {text.logout || '退出登录'} {/* 退出登录按钮文字 */}
        </button>
      </div>
    </>
  )
}

export default ProfileInfo // 导出 ProfileInfo 组件，供其他文件使用
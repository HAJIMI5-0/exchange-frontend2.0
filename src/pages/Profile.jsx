import { useState, useEffect } from 'react'                       // 引入 useState 和 useEffect，用来管理状态和执行页面加载后的操作
import { useNavigate } from 'react-router-dom'                    // 引入 useNavigate，用来进行页面跳转
import defaultAvatar from '../assets/default-avatar.png'          // 引入默认头像图片

import {
  fetchProfileApi,                                                // 获取个人资料接口
  uploadAvatarApi,                                                // 上传头像接口
  updateProfileApi,                                               // 更新个人资料接口
  translateText                                                   // 翻译接口
} from '../api/profileApi'

import ProfileInfo from '../components/profile/ProfileInfo'       // 引入个人资料查看组件
import ProfileForm from '../components/profile/ProfileForm'       // 引入个人资料编辑表单组件

function Profile({ text, user, setUser, lang = 'zh' }) {          // 个人资料页面组件，接收多语言文本、当前用户、更新用户函数和当前语言
  const navigate = useNavigate()                                  // 创建页面跳转函数

  // =========================
  // 页面状态管理
  // =========================
  const [isEditing, setIsEditing] = useState(false)               // 控制当前是查看模式还是编辑模式
  const [loading, setLoading] = useState(true)                    // 控制页面是否正在加载个人资料
  const [result, setResult] = useState('')                        // 保存操作结果提示，比如保存成功、上传失败
  const [uploading, setUploading] = useState(false)               // 控制头像是否正在上传

  // =========================
  // 翻译后的个人资料信息
  // =========================
  const [translatedInfo, setTranslatedInfo] = useState({          // 保存翻译后的技能和国籍
    teachSkill: '',                                               // 翻译后的擅长技能
    learnSkill: '',                                               // 翻译后的想学技能
    nationality: ''                                               // 翻译后的国籍
  })

  // =========================
  // 用户个人资料数据
  // =========================
  const [profile, setProfile] = useState({                        // 保存个人资料表单和展示需要的数据
    id: '',                                                       // 用户 id
    username: '',                                                 // 用户登录账号
    name: '',                                                     // 用户显示名称
    phone: '',                                                    // 电话
    email: '',                                                    // 邮箱
    address: '',                                                  // 地址
    avatar: '',                                                   // 头像地址
    gender: '',                                                   // 性别
    age: '',                                                      // 年龄
    nationality: '',                                              // 国籍
    teachSkill: '',                                               // 擅长技能
    learnSkill: '',                                               // 想学技能
    teachLevel: '',                                               // 擅长技能等级
    learnLevel: '',                                               // 想学习的等级
    timeSlot: '',                                                 // 学习时间段
    projectAwards: ''                                             // 项目 / 奖项
  })

  // =========================
  // 获取用户个人资料
  // =========================
  useEffect(() => {                                               // 当页面加载或 user.username 改变时，获取个人资料
    const fetchProfile = async () => {                            // 定义异步函数，用来请求个人资料
      if (!user || !user.username) {                              // 如果当前没有登录用户，或者没有用户名
        setLoading(false)                                         // 停止加载
        return                                                    // 不继续请求后端
      }

      try {
        const data = await fetchProfileApi(user.username)         // 根据用户名请求后端个人资料接口

        const profileData = {                                     // 把后端返回的数据整理成前端需要的格式
          id: data.id || user.id || '',                           // 优先使用后端返回的 id，没有就用 user 里的 id
          username: data.username || user.username || '',         // 优先使用后端 username，没有就用当前登录用户 username
          name: data.name || data.nickname || user.name || data.username || user.username || '', // 显示名称，兼容 name、nickname、username
          phone: data.phone || '',                                // 电话，没有就为空
          email: data.email || '',                                // 邮箱，没有就为空
          address: data.address || '',                            // 地址，没有就为空
          avatar: data.avatar || user.avatar || '',               // 头像，优先使用后端头像，没有就用本地用户头像
          gender: data.gender || '',                              // 性别
          age: data.age || '',                                    // 年龄
          nationality: data.nationality || '',                    // 国籍
          teachSkill: data.teachSkill || '',                      // 擅长技能
          learnSkill: data.learnSkill || '',                      // 想学技能
          teachLevel: data.teachLevel || data.skillOfferLevel || data.skill_offer_level || '', // 擅长技能等级，兼容后端不同字段名
          learnLevel: data.learnLevel || data.skillWantLevel || data.skillWentLevel || data.skill_want_level || data.skill_went_level || '', // 想学习的等级，兼容后端不同字段名
          timeSlot: data.timeSlot || '',                          // 学习时间段
          projectAwards: data.projectAwards || ''                 // 项目 / 奖项
        }

        setProfile(profileData)                                   // 把整理好的个人资料保存到 profile 状态中

        const updatedUser = {                                     // 创建更新后的登录用户对象
          ...user,                                                // 保留原来 user 里的其他数据
          id: profileData.id,                                     // 更新 id
          username: profileData.username,                         // 更新用户名
          name: profileData.name,                                 // 更新显示名称
          phone: profileData.phone,                               // 更新电话
          email: profileData.email,                               // 更新邮箱
          address: profileData.address,                           // 更新地址
          avatar: profileData.avatar,                             // 更新头像
          gender: profileData.gender,                             // 更新性别
          age: profileData.age,                                   // 更新年龄
          nationality: profileData.nationality,                   // 更新国籍
          teachSkill: profileData.teachSkill,                     // 更新擅长技能
          learnSkill: profileData.learnSkill,                     // 更新想学技能
          teachLevel: profileData.teachLevel,                     // 更新擅长技能等级
          learnLevel: profileData.learnLevel,                     // 更新想学习的等级
          timeSlot: profileData.timeSlot,                         // 更新学习时间段
          projectAwards: profileData.projectAwards                // 更新项目 / 奖项
        }

        setUser(updatedUser)                                      // 更新 App.jsx 里的 user 状态
        localStorage.setItem('loginUser', JSON.stringify(updatedUser)) // 同步更新 localStorage，刷新页面后也能保留最新用户信息
      } catch (err) {                                             // 获取个人资料失败时执行
        console.error('获取个人信息失败:', err)                    // 在控制台输出错误信息
        setResult(err.message || '获取个人信息失败，请检查后端')    // 页面显示错误提示
      } finally {
        setLoading(false)                                         // 无论成功还是失败，都结束加载状态
      }
    }

    fetchProfile()                                                // 调用获取个人资料函数
  }, [user?.username])                                            // 当 user.username 变化时重新执行

  // =========================
  // 自动翻译技能和国籍
  // =========================
  useEffect(() => {                                               // 当语言、技能、国籍或编辑状态变化时执行翻译
    if (isEditing) return                                         // 如果正在编辑，就不进行自动翻译，避免影响输入内容

    const translateProfileInfo = async () => {                    // 定义异步翻译函数
      const translatedTeachSkill = await translateText(profile.teachSkill, lang)        // 翻译擅长技能
      const translatedLearnSkill = await translateText(profile.learnSkill, lang)        // 翻译想学技能
      const translatedNationality = await translateText(profile.nationality, lang)      // 翻译国籍

      setTranslatedInfo({                                         // 保存翻译后的内容
        teachSkill: translatedTeachSkill,                         // 保存翻译后的擅长技能
        learnSkill: translatedLearnSkill,                         // 保存翻译后的想学技能
        nationality: translatedNationality                        // 保存翻译后的国籍
      })
    }

    translateProfileInfo()                                        // 调用翻译函数
  }, [lang, profile.teachSkill, profile.learnSkill, profile.nationality, isEditing]) // 这些数据变化时重新翻译

  // =========================
  // 编辑表单输入内容
  // =========================
  const handleChange = (e) => {                                   // 编辑表单输入框内容变化时执行
    const { name, value } = e.target                              // 获取当前输入框的 name 和 value

    setProfile((prev) => ({                                       // 更新 profile 中对应字段
      ...prev,                                                    // 保留原来的其他字段
      [name]: value                                               // 根据输入框 name 动态更新对应字段
    }))
  }

  // =========================
  // 上传头像
  // =========================
  const handleAvatarUpload = async (e) => {                       // 选择头像文件后执行
    const file = e.target.files[0]                                // 获取用户选择的第一个文件

    if (!file) return                                             // 如果没有选择文件，就停止执行

    try {
      setUploading(true)                                          // 设置头像上传中状态
      setResult('')                                               // 清空之前的提示信息

      const avatarUrl = await uploadAvatarApi(file)               // 调用头像上传接口，获取头像地址

      const updatedProfile = {                                    // 创建更新后的个人资料对象
        ...profile,                                               // 保留原来的个人资料
        username: user.username,                                  // 确保 username 是当前登录用户
        avatar: avatarUrl                                         // 更新头像地址
      }

      const updatedUser = {                                       // 创建更新后的登录用户对象
        ...user,                                                  // 保留原来的用户信息
        name: updatedProfile.name,                                // 更新显示名称
        avatar: avatarUrl                                         // 更新头像
      }

      await updateProfileApi(updatedProfile)                      // 把新的头像地址保存到后端数据库

      setProfile(updatedProfile)                                  // 更新当前页面的个人资料
      setUser(updatedUser)                                        // 更新全局登录用户信息
      localStorage.setItem('loginUser', JSON.stringify(updatedUser)) // 更新本地存储中的登录用户信息

      setResult(text.uploadSuccess || '头像上传成功')              // 显示上传成功提示
    } catch (err) {                                               // 上传头像失败时执行
      console.error('头像上传失败:', err)                          // 在控制台输出错误信息
      setResult(err.message || '头像上传失败，请检查后端是否启动')   // 页面显示上传失败提示
    } finally {
      setUploading(false)                                         // 无论成功还是失败，都结束上传中状态
    }
  }

  // =========================
  // 保存个人资料
  // =========================
  const handleSave = async () => {                                // 点击保存按钮时执行
    try {
      const saveProfile = {                                       // 创建要保存到后端的个人资料对象
        ...profile,                                               // 使用当前 profile 中的数据
        username: user.username,                                  // 确保保存的是当前登录用户的 username
        skillOfferLevel: profile.teachLevel,                      // 后端接收的擅长技能等级字段
        skillWentLevel: profile.learnLevel                        // 后端接收的想学习等级字段
      }

      const data = await updateProfileApi(saveProfile)            // 调用后端接口保存个人资料，并接收后端返回的数据

      const updatedProfile = {                                    // 根据后端返回结果和当前保存数据，整理最终个人资料
        ...saveProfile,                                           // 先保留当前保存的数据
        id: data.id ?? saveProfile.id,                            // 优先使用后端返回 id，没有就保留原 id
        username: user.username,                                  // username 使用当前登录用户
        name: data.name ?? saveProfile.name,                      // 优先使用后端返回 name，没有就保留当前 name
        phone: data.phone ?? saveProfile.phone,                   // 优先使用后端返回 phone
        email: data.email ?? saveProfile.email,                   // 优先使用后端返回 email
        address: data.address ?? saveProfile.address,             // 优先使用后端返回 address
        avatar: data.avatar ?? saveProfile.avatar,                // 优先使用后端返回 avatar
        gender: data.gender ?? saveProfile.gender,                // 优先使用后端返回 gender
        age: data.age ?? saveProfile.age,                         // 优先使用后端返回 age
        nationality: data.nationality ?? saveProfile.nationality, // 优先使用后端返回 nationality
        teachSkill: data.teachSkill ?? saveProfile.teachSkill,    // 优先使用后端返回 teachSkill
        learnSkill: data.learnSkill ?? saveProfile.learnSkill,    // 优先使用后端返回 learnSkill
        teachLevel: data.teachLevel ?? data.skillOfferLevel ?? data.skill_offer_level ?? saveProfile.teachLevel, // 优先使用后端返回擅长技能等级
        learnLevel: data.learnLevel ?? data.skillWantLevel ?? data.skillWentLevel ?? data.skill_want_level ?? data.skill_went_level ?? saveProfile.learnLevel, // 优先使用后端返回想学习等级
        timeSlot: data.timeSlot ?? saveProfile.timeSlot,          // 优先使用后端返回 timeSlot
        projectAwards: data.projectAwards ?? saveProfile.projectAwards // 优先使用后端返回 projectAwards
      }

      const updatedUser = {                                       // 创建更新后的登录用户对象
        ...user,                                                  // 保留原来的用户信息
        username: user.username,                                  // 保留当前登录 username
        name: updatedProfile.name,                                // 更新显示名称
        phone: updatedProfile.phone,                              // 更新电话
        email: updatedProfile.email,                              // 更新邮箱
        address: updatedProfile.address,                          // 更新地址
        avatar: updatedProfile.avatar,                            // 更新头像
        gender: updatedProfile.gender,                            // 更新性别
        age: updatedProfile.age,                                  // 更新年龄
        nationality: updatedProfile.nationality,                  // 更新国籍
        teachSkill: updatedProfile.teachSkill,                    // 更新擅长技能
        learnSkill: updatedProfile.learnSkill,                    // 更新想学技能
        teachLevel: updatedProfile.teachLevel,                    // 更新擅长技能等级
        learnLevel: updatedProfile.learnLevel,                    // 更新想学习的等级
        timeSlot: updatedProfile.timeSlot,                        // 更新学习时间段
        projectAwards: updatedProfile.projectAwards               // 更新项目 / 奖项
      }

      setProfile(updatedProfile)                                  // 更新页面显示的个人资料
      setUser(updatedUser)                                        // 更新 App.jsx 中的登录用户状态
      localStorage.setItem('loginUser', JSON.stringify(updatedUser)) // 更新 localStorage 中的登录用户数据
      setResult(text.saveSuccess || '保存成功')                    // 显示保存成功提示
      setIsEditing(false)                                         // 保存成功后退出编辑模式
    } catch (err) {                                               // 保存失败时执行
      console.error('保存个人信息失败:', err)                      // 在控制台输出错误信息
      setResult(err.message || '保存失败，请检查后端是否启动')      // 页面显示保存失败提示
    }
  }

  // =========================
  // 退出登录
  // =========================
  const handleLogout = () => {                                    // 点击退出登录时执行
    localStorage.removeItem('loginUser')                          // 删除本地存储中的登录用户信息
    setUser(null)                                                 // 清空 App.jsx 中的用户状态
    navigate('/')                                                 // 跳转回首页
  }

  // =========================
  // 未登录状态页面
  // =========================
  if (!user) {                                                    // 如果当前没有登录用户
    return (
      <section className="profile-page">
        <h1>{text.profilePage || '个人信息页面'}</h1>

        <p>{text.notLoggedIn || '当前未登录'}</p>

        <button onClick={() => navigate('/login')}>
          {text.loginBtn || '登录'}
        </button>
      </section>
    )
  }

  // =========================
  // 加载中页面
  // =========================
  if (loading) {                                                  // 如果正在加载个人资料
    return (
      <section className="profile-page">
        <h1>{text.profilePage || '个人信息页面'}</h1>

        <p>{text.loading || '加载中...'}</p>
      </section>
    )
  }

  // =========================
  // 个人资料主页面
  // =========================
  return (
    <section className="profile-page">
      <h1>{text.profilePage || '个人信息页面'}</h1>

      <div className="profile-card">
        <div className="profile-top">
          <img
            src={profile.avatar && profile.avatar.trim() ? profile.avatar : defaultAvatar}
            alt="avatar"
            className="profile-avatar"
            onError={(e) => {
              e.target.src = defaultAvatar
            }}
          />

          <div className="profile-basic">
            <h2>{profile.name || profile.username || 'User'}</h2>

            <p className="profile-username-small">
              id:{profile.username || '-'}
            </p>

            <p>{text.welcome || '欢迎来到个人中心'}</p>
          </div>
        </div>

        {isEditing ? (
          <ProfileForm
            text={text}
            profile={profile}
            uploading={uploading}
            onChange={handleChange}
            onAvatarUpload={handleAvatarUpload}
            onSave={handleSave}
            onCancel={() => setIsEditing(false)}
          />
        ) : (
          <ProfileInfo
            text={text}
            profile={profile}
            translatedInfo={translatedInfo}
            onEdit={() => setIsEditing(true)}
            onHome={() => navigate('/')}
            onLogout={handleLogout}
          />
        )}

        {result && <p>{result}</p>}
      </div>
    </section>
  )
}

export default Profile
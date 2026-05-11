import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import defaultAvatar from '../assets/default-avatar.png'

import {
  fetchProfileApi,
  uploadAvatarApi,
  updateProfileApi,
  translateText
} from '../api/profileApi'

import ProfileInfo from './ProfileInfo'
import ProfileForm from './ProfileForm'

function Profile({ text, user, setUser, lang = 'zh' }) {
  const navigate = useNavigate()

  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [result, setResult] = useState('')
  const [uploading, setUploading] = useState(false)

  const [translatedInfo, setTranslatedInfo] = useState({
    teachSkill: '',
    learnSkill: '',
    nationality: ''
  })

  const [profile, setProfile] = useState({
    id: '',
    username: '',
    phone: '',
    email: '',
    address: '',
    avatar: '',
    gender: '',
    age: '',
    nationality: '',
    teachSkill: '',
    learnSkill: ''
  })

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user || !user.username) {
        setLoading(false)
        return
      }

      try {
        const data = await fetchProfileApi(user.username)

        const profileData = {
          id: data.id || user.id || '',
          username: data.username || user.username || '',
          phone: data.phone || '',
          email: data.email || '',
          address: data.address || '',
          avatar: data.avatar || user.avatar || '',
          gender: data.gender || '',
          age: data.age || '',
          nationality: data.nationality || '',
          teachSkill: data.teachSkill || '',
          learnSkill: data.learnSkill || ''
        }

        setProfile(profileData)

        const updatedUser = {
          ...user,
          avatar: profileData.avatar
        }

        setUser(updatedUser)
        localStorage.setItem('loginUser', JSON.stringify(updatedUser))
      } catch (err) {
        console.error('获取个人信息失败:', err)
        setResult(err.message || '获取个人信息失败，请检查后端')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [user?.username])

  useEffect(() => {
    if (isEditing) return

    const translateProfileInfo = async () => {
      const translatedTeachSkill = await translateText(profile.teachSkill, lang)
      const translatedLearnSkill = await translateText(profile.learnSkill, lang)
      const translatedNationality = await translateText(profile.nationality, lang)

      setTranslatedInfo({
        teachSkill: translatedTeachSkill,
        learnSkill: translatedLearnSkill,
        nationality: translatedNationality
      })
    }

    translateProfileInfo()
  }, [lang, profile.teachSkill, profile.learnSkill, isEditing])

  const handleChange = (e) => {
    const { name, value } = e.target

    setProfile((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    try {
      setUploading(true)
      setResult('')

      const avatarUrl = await uploadAvatarApi(file)

      const updatedProfile = {
        ...profile,
        avatar: avatarUrl
      }

      const updatedUser = {
        ...user,
        avatar: avatarUrl
      }

      await updateProfileApi(updatedProfile)

      setProfile(updatedProfile)
      setUser(updatedUser)
      localStorage.setItem('loginUser', JSON.stringify(updatedUser))

      setResult(text.uploadSuccess || '头像上传成功')
    } catch (err) {
      console.error('头像上传失败:', err)
      setResult(err.message || '头像上传失败，请检查后端是否启动')
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    try {
      const data = await updateProfileApi(profile)

      const updatedUser = {
        ...user,
        username: data.username || profile.username,
        phone: data.phone || profile.phone,
        email: data.email || profile.email,
        address: data.address || profile.address,
        avatar: data.avatar || profile.avatar,
        gender: data.gender || profile.gender,
        age: data.age || profile.age,
        nationality: data.nationality || profile.nationality,
        teachSkill: data.teachSkill || profile.teachSkill,
        learnSkill: data.learnSkill || profile.learnSkill
      }

      setProfile(updatedUser)
      setUser(updatedUser)
      localStorage.setItem('loginUser', JSON.stringify(updatedUser))
      setResult(text.saveSuccess || '保存成功')
      setIsEditing(false)
    } catch (err) {
      console.error('保存个人信息失败:', err)
      setResult(err.message || '保存失败，请检查后端是否启动')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('loginUser')
    setUser(null)
    navigate('/')
  }

  if (!user) {
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

  if (loading) {
    return (
      <section className="profile-page">
        <h1>{text.profilePage || '个人信息页面'}</h1>
        <p>{text.loading || '加载中...'}</p>
      </section>
    )
  }

  return (
    <section className="profile-page">
      <h1>{text.profilePage || '个人信息页面'}</h1>

      <div className="profile-card">
        <div className="profile-top">
          <img
            src={profile.avatar && profile.avatar.trim() ? profile.avatar : defaultAvatar}
            alt={'avatar'}
            className={'profile-avatar'}
            onError={(e) => {
              e.target.src = defaultAvatar
            }}
          />

          <div className="profile-basic">
            <h2>{profile.username || 'User'}</h2>
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
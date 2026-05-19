import { useState, useEffect } from 'react'
import { translateText } from '../../api/profileApi'
import { getSkills, getWants } from './matchUtils'

// 自动翻译匹配用户的国籍、擅长技能和想学技能
function useTranslatedUsers(users, lang) {
  const [translatedUsers, setTranslatedUsers] = useState([])

  useEffect(() => {
    let cancelled = false

    const translateMatchedUsers = async () => {
      if (users.length === 0) {
        setTranslatedUsers([])
        return
      }

      try {
        const translated = await Promise.all(
          users.map(async (user) => {
            const skills = getSkills(user)
            const wants = getWants(user)

            const [
              translatedNationality,
              translatedSkills,
              translatedWants
            ] = await Promise.all([
              translateText(user.nationality || '', lang),
              Promise.all(skills.map(skill => translateText(skill, lang))),
              Promise.all(wants.map(skill => translateText(skill, lang)))
            ])

            return {
              ...user,
              translatedNationality,
              translatedSkills,
              translatedWants
            }
          })
        )

        if (!cancelled) {
          setTranslatedUsers(translated)
        }
      } catch (err) {
        console.error('匹配用户信息翻译失败:', err)

        if (!cancelled) {
          setTranslatedUsers(users)
        }
      }
    }

    translateMatchedUsers()

    return () => {
      cancelled = true
    }
  }, [users, lang])

  return translatedUsers
}

export default useTranslatedUsers
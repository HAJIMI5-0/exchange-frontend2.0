// 把后端返回的技能数据统一转成数组
export const normalizeSkillList = (value) => {
  if (Array.isArray(value)) {
    return value
  }

  if (typeof value === 'string' && value.trim() !== '') {
    return [value]
  }

  return []
}

// 获取擅长技能，兼容 skills 和 teachSkill 两种字段名
export const getSkills = (user) => {
  return normalizeSkillList(user.skills || user.teachSkill)
}

// 获取想学技能，兼容 wants 和 learnSkill 两种字段名
export const getWants = (user) => {
  return normalizeSkillList(user.wants || user.learnSkill)
}

// 根据当前语言显示性别文本
export const getGenderText = (gender, text) => {
  if (gender === 'male') return text.male || '男'
  if (gender === 'female') return text.female || '女'
  if (gender === 'other') return text.other || '其他'

  return gender || '-'
}

// 根据当前语言显示技能文本
export const getSkillText = (list) => {
  return list.length > 0 ? list.join(', ') : '-'
}
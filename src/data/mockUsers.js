const names = [
  "Alice","Bob","Charlie","David","Emma","Frank","Grace","Henry","Ivy","Jack",
  "Kevin","Lily","Mike","Nina","Oscar","Paul","Queen","Ryan","Sophia","Tom"
]

const skillPool = [
  "Java","React","Python","UI设计","C++","Spring","Node.js","算法",
  "机器学习","Docker","前端","后端","MySQL","数据分析","Kotlin",
  "Go","云计算","AWS","Figma","Photoshop"
]

// 随机取n个技能
function getRandomSkills(n = 3) {
  return [...skillPool]
    .sort(() => 0.5 - Math.random())
    .slice(0, n)
}

// 生成100条用户
const mockUsers = Array.from({ length: 100 }, (_, i) => {
  return {
    id: i + 1,
    name: names[i % names.length] + i,  // 避免重名
    age: 20 + Math.floor(Math.random() * 10),
    skills: getRandomSkills(3),
    wants: getRandomSkills(2)
  }
})

export default mockUsers
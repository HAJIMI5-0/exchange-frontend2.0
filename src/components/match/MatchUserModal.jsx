import { useEffect, useState } from 'react'

import {
  getSkills,
  getWants,
  getGenderText
} from './matchUtils'

import { translateText } from '../../api/profileApi'

function MatchUserModal({
  text,
  lang = 'zh',
  selectedUser,
  chatResult,
  matchHistory = [],
  matchHistoryLoading = false,
  matchHistoryError = '',
  onClose
}) {
  const rawEmptyText = text.userNotFilled || '用户未填写'

  const [translatedDetail, setTranslatedDetail] = useState({
    emptyText: '',
    nationality: '',
    teachSkill: '',
    learnSkill: '',
    timeSlot: '',
    awards: '',
    historyAnd: '',
    historyMatched: ''
  })

  const getDisplayName = () => {
    return (
      selectedUser.name ||
      selectedUser.username ||
      text.user ||
      'User'
    )
  }

  const getHistoryAndText = (currentLang) => {
    if (currentLang === 'en') return 'and'
    if (currentLang === 'ko' || currentLang === 'kr') return '와'
    if (currentLang === 'ja') return 'と'
    if (currentLang === 'fr') return 'et'
    if (currentLang === 'de') return 'und'
    if (currentLang === 'es') return 'y'
    if (currentLang === 'ar') return 'و'

    return '和'
  }

  const getHistoryMatchedText = (currentLang) => {
    if (currentLang === 'en') return 'matched'
    if (currentLang === 'ko' || currentLang === 'kr') return '매칭되었습니다'
    if (currentLang === 'ja') return 'マッチしました'
    if (currentLang === 'fr') return 'ont été mis en relation'
    if (currentLang === 'de') return 'wurden gematcht'
    if (currentLang === 'es') return 'hicieron match'
    if (currentLang === 'ar') return 'تمت مطابقتهما'

    return '进行了匹配'
  }

  const getSkillDisplayText = (value) => {
    if (!value) {
      return rawEmptyText
    }

    if (Array.isArray(value)) {
      return value.length > 0 ? value.join('、') : rawEmptyText
    }

    if (typeof value === 'string') {
      const trimmed = value.trim()

      if (!trimmed) {
        return rawEmptyText
      }

      return trimmed
        .split(',')
        .map(item => item.trim())
        .filter(Boolean)
        .join('、')
    }

    return rawEmptyText
  }

  const getRawTeachSkillText = () => {
    return getSkillDisplayText(
      selectedUser.translatedSkills ||
      selectedUser.skills ||
      selectedUser.skillOffer ||
      selectedUser.skill_offer ||
      getSkills(selectedUser)
    )
  }

  const getRawLearnSkillText = () => {
    return getSkillDisplayText(
      selectedUser.translatedWants ||
      selectedUser.wants ||
      selectedUser.skillWant ||
      selectedUser.skill_want ||
      getWants(selectedUser)
    )
  }

  const getRawTimeSlotText = () => {
    const timeSlot =
      selectedUser.timeSlot ||
      selectedUser.time_slot ||
      selectedUser.onlineTime ||
      selectedUser.online_time ||
      selectedUser.onlineTimeSlot ||
      selectedUser.availableTime ||
      selectedUser.available_time ||
      selectedUser.availableTimeSlot

    if (!timeSlot) {
      return rawEmptyText
    }

    if (timeSlot === 'weekday_morning') {
      return text.weekdayMorning || '平日上午'
    }

    if (timeSlot === 'weekday_afternoon') {
      return text.weekdayAfternoon || '平日下午'
    }

    if (timeSlot === 'weekday_evening') {
      return text.weekdayEvening || '平日晚上'
    }

    if (timeSlot === 'weekend') {
      return text.weekend || '周末'
    }

    return timeSlot
  }

  const getRawAwardsText = () => {
    const awards =
      selectedUser.awards ||
      selectedUser.award ||
      selectedUser.prizes ||
      selectedUser.prize ||
      selectedUser.honors ||
      selectedUser.honor ||
      selectedUser.achievements ||
      selectedUser.achievement

    if (!awards) {
      return rawEmptyText
    }

    if (Array.isArray(awards)) {
      return awards.length > 0 ? awards.join('、') : rawEmptyText
    }

    if (typeof awards === 'string') {
      return awards.trim() ? awards : rawEmptyText
    }

    return rawEmptyText
  }

  const getRatingScore = () => {
    const rating =
      selectedUser.rating ??
      selectedUser.score ??
      selectedUser.ratingScore ??
      selectedUser.rating_score ??
      selectedUser.averageRating ??
      selectedUser.average_rating ??
      selectedUser.avgRating ??
      selectedUser.avg_rating ??
      selectedUser.satisfactionScore ??
      selectedUser.satisfaction_score

    if (rating === null || rating === undefined || rating === '') {
      return null
    }

    const numberRating = Number(rating)

    if (Number.isNaN(numberRating)) {
      return rating
    }

    if (numberRating <= 0) {
      return null
    }

    return numberRating.toFixed(1)
  }

  const getRatingStars = () => {
    const rating = getRatingScore()

    if (!rating || Number.isNaN(Number(rating))) {
      return ''
    }

    const score = Number(rating)
    const starCount = Math.round(score / 2)

    return '★'.repeat(starCount) + '☆'.repeat(5 - starCount)
  }

  const getHistoryUserA = (item) => {
    return (
      item.userAName ||
      item.user_a_name ||
      item.senderName ||
      item.senderUsername ||
      item.sender_username ||
      item.user1Name ||
      item.user1Username ||
      item.user1_name ||
      item.user1_username ||
      getDisplayName()
    )
  }

  const getHistoryUserB = (item) => {
    return (
      item.userBName ||
      item.user_b_name ||
      item.partnerName ||
      item.partner_name ||
      item.receiverName ||
      item.receiverUsername ||
      item.receiver_username ||
      item.user2Name ||
      item.user2Username ||
      item.user2_name ||
      item.user2_username ||
      text.unknownUser ||
      '未知用户'
    )
  }

  const getHistoryTime = (item) => {
    return (
      item.matchTime ||
      item.match_time ||
      item.createdAt ||
      item.created_at ||
      item.createTime ||
      item.createdTime ||
      item.matchedAt ||
      item.matched_at ||
      item.time ||
      text.unknownTime ||
      '时间未知'
    )
  }

  const translateValue = async (value) => {
    if (value === null || value === undefined) {
      return ''
    }

    const finalValue = String(value).trim()

    if (!finalValue) {
      return ''
    }

    if (lang === 'zh') {
      return finalValue
    }

    try {
      const translated = await translateText(finalValue, lang)

      return translated || finalValue
    } catch (err) {
      console.error('自动翻译失败:', err)
      return finalValue
    }
  }

  useEffect(() => {
    let cancelled = false

    const translateModalData = async () => {
      const rawNationality =
        selectedUser.translatedNationality ||
        selectedUser.nationality ||
        rawEmptyText

      const rawTeachSkill = getRawTeachSkillText()
      const rawLearnSkill = getRawLearnSkillText()
      const rawTimeSlot = getRawTimeSlotText()
      const rawAwards = getRawAwardsText()

      const historyAndText = getHistoryAndText(lang)
      const historyMatchedText = getHistoryMatchedText(lang)

      try {
        const [
          translatedEmptyText,
          translatedNationality,
          translatedTeachSkill,
          translatedLearnSkill,
          translatedTimeSlot,
          translatedAwards
        ] = await Promise.all([
          translateValue(rawEmptyText),
          translateValue(rawNationality),
          translateValue(rawTeachSkill),
          translateValue(rawLearnSkill),
          translateValue(rawTimeSlot),
          translateValue(rawAwards)
        ])

        if (cancelled) {
          return
        }

        setTranslatedDetail({
          emptyText: translatedEmptyText,
          nationality: translatedNationality,
          teachSkill: translatedTeachSkill,
          learnSkill: translatedLearnSkill,
          timeSlot: translatedTimeSlot,
          awards: translatedAwards,
          historyAnd: historyAndText,
          historyMatched: historyMatchedText
        })
      } catch (err) {
        console.error('详情弹窗翻译失败:', err)

        if (!cancelled) {
          setTranslatedDetail({
            emptyText: rawEmptyText,
            nationality: rawNationality,
            teachSkill: rawTeachSkill,
            learnSkill: rawLearnSkill,
            timeSlot: rawTimeSlot,
            awards: rawAwards,
            historyAnd: historyAndText,
            historyMatched: historyMatchedText
          })
        }
      }
    }

    translateModalData()

    return () => {
      cancelled = true
    }
  }, [selectedUser, lang, text])

  const displayEmptyText = translatedDetail.emptyText || rawEmptyText

  const displayNationality =
    translatedDetail.nationality ||
    selectedUser.translatedNationality ||
    selectedUser.nationality ||
    displayEmptyText

  const displayTeachSkill =
    translatedDetail.teachSkill ||
    getRawTeachSkillText()

  const displayLearnSkill =
    translatedDetail.learnSkill ||
    getRawLearnSkillText()

  const displayTimeSlot =
    translatedDetail.timeSlot ||
    getRawTimeSlotText()

  const displayAwards =
    translatedDetail.awards ||
    getRawAwardsText()

  const historyAnd = translatedDetail.historyAnd || getHistoryAndText(lang)
  const historyMatched = translatedDetail.historyMatched || getHistoryMatchedText(lang)

  const ratingScore = getRatingScore()
  const ratingStars = getRatingStars()

  return (
    <div className="modal-mask">
      <div className="user-modal timeline-modal">
        <button
          type="button"
          className="modal-close-btn timeline-close-btn"
          onClick={onClose}
          aria-label={text.close || '关闭'}
          title={text.close || '关闭'}
        >
          ×
        </button>

        <div className="timeline-rating-badge">
          {ratingScore ? (
            <>
              <span className="timeline-rating-score">{ratingScore}</span>
              <span className="timeline-rating-stars">{ratingStars}</span>
            </>
          ) : (
            <span>{text.noRating || '暂无评分'}</span>
          )}
        </div>

        <div className="timeline-profile-header">
          <div className="modal-avatar timeline-avatar">
            {selectedUser.avatar ? (
              <img src={selectedUser.avatar} alt="avatar" />
            ) : (
              <span>👤</span>
            )}
          </div>

          <h2>{getDisplayName()}</h2>
        </div>

        <div className="timeline-basic-row">
          <div className="timeline-basic-item">
            <span>{text.age || '年龄'}</span>
            <strong>{selectedUser.age || displayEmptyText}</strong>
          </div>

          <div className="timeline-basic-item">
            <span>{text.gender || '性别'}</span>
            <strong>{getGenderText(selectedUser.gender, text) || displayEmptyText}</strong>
          </div>

          <div className="timeline-basic-item">
            <span>{text.nationality || '国籍'}</span>
            <strong>{displayNationality}</strong>
          </div>
        </div>

        <div className="timeline-info-panel">
          <div className="timeline-info-row">
            <span>{text.teachSkill || '擅长的技能'}</span>
            <strong>{displayTeachSkill}</strong>
          </div>

          <div className="timeline-info-row">
            <span>{text.learnSkill || '想学习的技能'}</span>
            <strong>{displayLearnSkill}</strong>
          </div>

          <div className="timeline-info-row">
            <span>{text.onlineTime || '在线时间段'}</span>
            <strong>{displayTimeSlot}</strong>
          </div>

          <div className="timeline-info-row">
            <span>{text.awards || '获得的奖项'}</span>
            <strong>{displayAwards}</strong>
          </div>
        </div>

        <div className="timeline-history-section">
          <h3>{text.matchHistory || '匹配历史记录'}</h3>

          {matchHistoryLoading && (
            <p className="timeline-history-empty">
              {text.loading || '加载中...'}
            </p>
          )}

          {!matchHistoryLoading && matchHistoryError && (
            <p className="timeline-history-empty">
              {matchHistoryError}
            </p>
          )}

          {!matchHistoryLoading && !matchHistoryError && matchHistory.length === 0 && (
            <p className="timeline-history-empty">
              {text.noMatchHistory || '暂无匹配历史记录'}
            </p>
          )}

          {!matchHistoryLoading && !matchHistoryError && matchHistory.length > 0 && (
            <ul className="timeline-history-list">
              {matchHistory.map((item, index) => (
                <li key={item.id || item.partnerId || index}>
                  <div className="timeline-dot"></div>

                  <div className="timeline-history-content">
                    <span className="timeline-history-time">
                      {getHistoryTime(item)}
                    </span>

                    <span className="timeline-history-text">
                      {getHistoryUserA(item)} {historyAnd} {getHistoryUserB(item)} {historyMatched}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {chatResult && (
          <p className="apply-result">
            {chatResult}
          </p>
        )}
      </div>
    </div>
  )
}

export default MatchUserModal
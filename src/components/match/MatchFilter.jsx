function MatchFilter({
  text,
  haveSkill,
  wantSkill,
  timeSlot,
  learnLevel,
  setHaveSkill,
  setWantSkill,
  setTimeSlot,
  setLearnLevel,
  loading,
  onMatch
}) {
  return (
    <div className="match-filter-box">
      <div className="filter-group">
        <label>{text.iCan || '我会什么'}</label>

        <input
          type="text"
          value={haveSkill}
          onChange={(e) => setHaveSkill(e.target.value)}
          placeholder={text.haveSkillPlaceholder || '请输入你会的技能，例如 Java'}
        />
      </div>

      <div className="filter-group">
        <label>{text.iWantLearn || '我想学什么'}</label>

        <input
          type="text"
          value={wantSkill}
          onChange={(e) => setWantSkill(e.target.value)}
          placeholder={text.wantSkillPlaceholder || '请输入你想学的技能，例如 React'}
        />
      </div>

      <div className="filter-group">
        <label>{text.timeSlot || '学习时间段'}</label>

        <select
          value={timeSlot}
          onChange={(e) => setTimeSlot(e.target.value)}
        >
          <option value="weekday_morning">
            {text.weekdayMorning || '平日上午'}
          </option>

          <option value="weekday_afternoon">
            {text.weekdayAfternoon || '平日下午'}
          </option>

          <option value="weekday_evening">
            {text.weekdayEvening || '平日晚上'}
          </option>

          <option value="weekend">
            {text.weekend || '周末'}
          </option>
        </select>
      </div>

      <div className="filter-group">
        <label>{text.learnLevel || '想学习的等级'}</label>

        <select
          value={learnLevel}
          onChange={(e) => setLearnLevel(e.target.value)}
        >
          <option value="beginner">
            {text.beginner || '入门'}
          </option>

          <option value="basic">
            {text.basic || '基础'}
          </option>

          <option value="intermediate">
            {text.intermediate || '中级'}
          </option>

          <option value="advanced">
            {text.advanced || '进阶'}
          </option>
        </select>
      </div>

      <button
        className="match-btn"
        onClick={onMatch}
        disabled={loading}
      >
        {loading ? (text.matching || '匹配中...') : (text.startMatch || '开始匹配')}
      </button>
    </div>
  )
}

export default MatchFilter
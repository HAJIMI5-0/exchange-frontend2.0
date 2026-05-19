function Settings({ text, user, lang, setLang }) {
  return (
    <section className="settings-page">
      <div className="settings-card">
        <h1>{text.settingsPage || "设置页面"}</h1>

        <div className="settings-section">
          <h2>{text.accountSettings || "账号设置"}</h2>

          <div className="settings-row">
            <span>{text.username || "用户名"}</span>
            <strong>{user?.name || user?.username || "-"}</strong>
          </div>

          <div className="settings-row">
            <span>{text.email || "邮箱"}</span>
            <strong>{user?.email || "-"}</strong>
          </div>
        </div>

        <div className="settings-section">
          <h2>{text.appSettings || "应用设置"}</h2>

          <div className="settings-row">
            <span>{text.language || "语言"}</span>

            <select
              className="lang-select"
              value={lang}
              onChange={(e) => setLang(e.target.value)}
            >
              <option value="zh">中文</option>
              <option value="en">English</option>
              <option value="ko">한국어</option>
              <option value="ja">日本語</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
              <option value="es">Español</option>
              <option value="ar">العربية</option>
            </select>
          </div>

          <div className="settings-row">
            <span>{text.theme || "主题"}</span>
            <strong>{text.darkMode || "深色模式"}</strong>
          </div>
        </div>

        <div className="settings-section">
          <h2>{text.about || "关于"}</h2>

          <div className="settings-row">
            <span>{text.projectName || "项目名称"}</span>
            <strong>SOUL</strong>
          </div>

          <div className="settings-row">
            <span>{text.version || "版本"}</span>
            <strong>1.0.0</strong>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Settings
